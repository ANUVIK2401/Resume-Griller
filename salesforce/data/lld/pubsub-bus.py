import itertools
import threading
from dataclasses import dataclass
from typing import Any, Callable, Dict, List, Tuple

Handler = Callable[[str, Any], None]


@dataclass(frozen=True)
class Subscription:
    topic: str
    id: int


class PubSubBus:
    """In-process pub/sub (Observer). Synchronous delivery; failures go to dead_letters."""

    def __init__(self) -> None:
        self._subs: Dict[str, Dict[int, Handler]] = {}
        self._ids = itertools.count(1)
        self._lock = threading.Lock()
        self.dead_letters: List[Tuple[str, Any, str]] = []

    def subscribe(self, topic: str, handler: Handler) -> Subscription:
        with self._lock:
            sub = Subscription(topic, next(self._ids))
            self._subs.setdefault(topic, {})[sub.id] = handler
            return sub  # the caller keeps this to unsubscribe later

    def unsubscribe(self, sub: Subscription) -> bool:
        with self._lock:
            return self._subs.get(sub.topic, {}).pop(sub.id, None) is not None

    def publish(self, topic: str, message: Any) -> int:
        with self._lock:
            handlers = list(self._subs.get(topic, {}).values())  # snapshot: handlers may (un)subscribe
        delivered = 0
        for handler in handlers:  # deliver outside the lock so handlers can publish
            try:
                handler(topic, message)
                delivered += 1
            except Exception as err:  # one bad subscriber must not starve the others
                self.dead_letters.append((topic, message, repr(err)))
        return delivered


if __name__ == "__main__":
    bus = PubSubBus()
    got = []
    s1 = bus.subscribe("deploys", lambda t, m: got.append(("s1", m)))
    bus.subscribe("deploys", lambda t, m: (_ for _ in ()).throw(RuntimeError("bad handler")))
    bus.subscribe("deploys", lambda t, m: got.append(("s3", m)))
    assert bus.publish("deploys", "v42") == 2
    assert got == [("s1", "v42"), ("s3", "v42")] and len(bus.dead_letters) == 1
    assert bus.unsubscribe(s1) and not bus.unsubscribe(s1)
    assert bus.publish("deploys", "v43") == 1
    assert bus.publish("nobody-listens", "x") == 0

    # a handler that unsubscribes itself mid-delivery must not break delivery to others
    seen = []
    holder = {}
    holder["s"] = bus.subscribe("t", lambda t, m: (seen.append("self"), bus.unsubscribe(holder["s"])))
    bus.subscribe("t", lambda t, m: seen.append("other"))
    bus.publish("t", 1)
    bus.publish("t", 2)
    assert seen == ["self", "other", "other"]

    # handlers can publish to other topics without deadlock
    chain = []
    bus.subscribe("a", lambda t, m: bus.publish("b", m + 1))
    bus.subscribe("b", lambda t, m: chain.append(m))
    bus.publish("a", 1)
    assert chain == [2]
