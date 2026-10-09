import threading
import time
from collections import OrderedDict
from typing import Any, Callable, Hashable, Optional, Tuple


class LRUTTLCache:
    """Bounded cache: least recently used goes first, entries expire after ttl seconds."""

    _MISSING = object()

    def __init__(self, capacity: int, ttl: float, clock: Callable[[], float] = time.monotonic):
        if capacity <= 0:
            raise ValueError("capacity must be positive")
        self.capacity, self.ttl, self._clock = capacity, ttl, clock
        self._items: "OrderedDict[Hashable, Tuple[Any, float]]" = OrderedDict()  # key -> (value, expires_at)
        self._lock = threading.Lock()

    def get(self, key: Hashable, default: Any = None) -> Any:
        with self._lock:
            entry = self._items.get(key, self._MISSING)
            if entry is self._MISSING:
                return default
            value, expires_at = entry
            if expires_at <= self._clock():
                del self._items[key]  # lazy expiry on read
                return default
            self._items.move_to_end(key)  # a read counts as use
            return value

    def put(self, key: Hashable, value: Any, ttl: Optional[float] = None) -> None:
        with self._lock:
            self._items[key] = (value, self._clock() + (ttl if ttl is not None else self.ttl))
            self._items.move_to_end(key)  # overwrite also refreshes recency
            if len(self._items) > self.capacity:
                self._evict()

    def __len__(self) -> int:
        with self._lock:
            return len(self._items)

    def _evict(self) -> None:
        now = self._clock()
        for k in [k for k, (_, exp) in self._items.items() if exp <= now]:
            del self._items[k]  # drop expired first: they are free to remove
        while len(self._items) > self.capacity:
            self._items.popitem(last=False)  # then least recently used


if __name__ == "__main__":
    now = [0.0]
    c = LRUTTLCache(capacity=2, ttl=10, clock=lambda: now[0])
    c.put("a", 1)
    c.put("b", 2)
    assert c.get("a") == 1  # a is now most recent
    c.put("c", 3)  # evicts b, the least recent
    assert c.get("b") is None and c.get("a") == 1 and c.get("c") == 3
    c.put("a", 10)  # overwrite does not grow the cache
    assert len(c) == 2 and c.get("a") == 10
    now[0] = 10
    assert c.get("a") is None  # expired at exactly ttl
    c.put("x", None)
    assert c.get("x", "default") is None  # a stored None is a hit, not a miss
    now[0] = 25
    c.put("p", 1, ttl=1)
    c.put("q", 2)
    c.put("r", 3)
    assert len(c) == 2  # x expired and was dropped before any LRU eviction
    try:
        LRUTTLCache(0, 1)
        raise AssertionError("zero capacity accepted")
    except ValueError:
        pass
