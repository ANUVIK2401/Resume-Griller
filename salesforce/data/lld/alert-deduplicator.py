import hashlib
import threading
import time
from dataclasses import dataclass
from typing import Callable, Dict, Optional, Tuple

IGNORED_LABELS = {"timestamp", "pod", "instance_id"}  # vary per firing, not per problem


@dataclass(frozen=True)
class Alert:
    service: str
    name: str
    severity: int  # 1 is most severe
    labels: Tuple[Tuple[str, str], ...] = ()


@dataclass
class _Group:
    first_seen: float
    last_emitted: float
    severity: int
    count: int = 1


class AlertDeduplicator:
    """Emit the first alert per fingerprint, suppress repeats within window_s,
    re-emit on escalation or after the window. resolve() clears the group."""

    def __init__(self, window_s: float = 300, clock: Callable[[], float] = time.monotonic):
        self.window_s, self._clock = window_s, clock
        self._groups: Dict[str, _Group] = {}
        self._lock = threading.Lock()

    @staticmethod
    def fingerprint(alert: Alert) -> str:
        stable = sorted((k, v) for k, v in alert.labels if k not in IGNORED_LABELS)
        raw = f"{alert.service}|{alert.name}|{stable}"
        return hashlib.sha256(raw.encode()).hexdigest()[:16]

    def ingest(self, alert: Alert) -> Optional[str]:
        """Returns the fingerprint if the alert should page, None if suppressed."""
        fp = self.fingerprint(alert)
        now = self._clock()
        with self._lock:
            self._expire(now)
            group = self._groups.get(fp)
            if group is None:
                self._groups[fp] = _Group(now, now, alert.severity)
                return fp
            group.count += 1
            escalated = alert.severity < group.severity  # lower number is worse
            if escalated or now - group.last_emitted >= self.window_s:
                group.severity = min(group.severity, alert.severity)
                group.last_emitted = now
                return fp
            return None

    def resolve(self, alert: Alert) -> bool:
        with self._lock:
            return self._groups.pop(self.fingerprint(alert), None) is not None

    def count(self, alert: Alert) -> int:
        with self._lock:
            g = self._groups.get(self.fingerprint(alert))
            return g.count if g else 0

    def _expire(self, now: float) -> None:
        # forget groups quiet for 2 windows so memory stays bounded
        stale = [fp for fp, g in self._groups.items() if now - g.last_emitted > 2 * self.window_s]
        for fp in stale:
            del self._groups[fp]


if __name__ == "__main__":
    now = [0.0]
    d = AlertDeduplicator(window_s=300, clock=lambda: now[0])
    a = Alert("checkout", "HighErrorRate", 2, (("region", "us-east"), ("pod", "p-1")))
    a_other_pod = Alert("checkout", "HighErrorRate", 2, (("region", "us-east"), ("pod", "p-9")))
    assert d.ingest(a) is not None
    assert d.ingest(a_other_pod) is None  # same problem, different pod: suppressed
    assert d.count(a) == 2
    now[0] = 100
    worse = Alert("checkout", "HighErrorRate", 1, (("region", "us-east"),))
    assert d.ingest(worse) is not None  # escalation always pages
    assert d.ingest(a) is None  # back to SEV2 within the window: still suppressed
    now[0] = 400
    assert d.ingest(a) is not None  # window passed since last page
    assert d.ingest(Alert("checkout", "HighErrorRate", 2, (("region", "eu-west"),))) is not None  # different region
    assert d.resolve(a) and d.ingest(a) is not None  # resolved then fires again: pages
    now[0] = 10_000
    d.ingest(Alert("search", "Latency", 3))
    assert len(d._groups) == 1  # stale groups were dropped
