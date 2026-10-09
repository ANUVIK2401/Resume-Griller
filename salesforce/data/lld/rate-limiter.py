import threading
import time
from collections import deque
from typing import Callable, Deque, Dict, Protocol


class RateLimiter(Protocol):  # Strategy: swap algorithms behind one interface
    def allow(self, cost: float = 1.0) -> bool: ...


class TokenBucket:
    """Bursts up to capacity, refills continuously at rate tokens per second."""

    def __init__(self, capacity: float, rate: float, clock: Callable[[], float] = time.monotonic):
        self.capacity, self.rate, self._clock = capacity, rate, clock
        self._tokens = capacity
        self._last = clock()
        self._lock = threading.Lock()

    def allow(self, cost: float = 1.0) -> bool:
        with self._lock:
            self._refill()
            if self._tokens >= cost:
                self._tokens -= cost
                return True
            return False

    def _refill(self) -> None:
        now = self._clock()
        self._tokens = min(self.capacity, self._tokens + (now - self._last) * self.rate)  # never above capacity
        self._last = now


class SlidingWindowLog:
    """At most limit requests in any window of window_s seconds. Exact, memory grows with limit."""

    def __init__(self, limit: int, window_s: float, clock: Callable[[], float] = time.monotonic):
        self.limit, self.window_s, self._clock = limit, window_s, clock
        self._times: Deque[float] = deque()
        self._lock = threading.Lock()

    def allow(self, cost: float = 1.0) -> bool:
        with self._lock:
            now = self._clock()
            while self._times and self._times[0] <= now - self.window_s:
                self._times.popleft()  # evict expired, keeps memory bounded by limit
            if len(self._times) + cost <= self.limit:
                self._times.extend([now] * int(cost))
                return True
            return False


class RateLimiterRegistry:
    """One limiter per key (tenant, user, API key), created on first use (Factory)."""

    def __init__(self, factory: Callable[[], RateLimiter]):
        self._factory = factory
        self._limiters: Dict[str, RateLimiter] = {}
        self._lock = threading.Lock()

    def allow(self, key: str, cost: float = 1.0) -> bool:
        with self._lock:  # creation must be atomic or two threads build two limiters for one key
            limiter = self._limiters.get(key)
            if limiter is None:
                limiter = self._limiters[key] = self._factory()
        return limiter.allow(cost)


if __name__ == "__main__":
    now = [0.0]
    clock = lambda: now[0]

    tb = TokenBucket(capacity=3, rate=1, clock=clock)
    assert [tb.allow() for _ in range(4)] == [True, True, True, False]  # burst of 3
    now[0] = 1.5
    assert tb.allow() and not tb.allow()  # 1.5 tokens refilled
    now[0] = 1000
    assert sum(tb.allow() for _ in range(10)) == 3  # long idle still caps at capacity
    assert not TokenBucket(5, 1, clock).allow(cost=6)  # cost above capacity never passes

    sw = SlidingWindowLog(limit=2, window_s=10, clock=clock)
    now[0] = 0
    assert sw.allow() and sw.allow() and not sw.allow()
    now[0] = 10
    assert sw.allow()  # first two expired at exactly the window edge
    now[0] = 10_000
    for _ in range(5):
        sw.allow()
    assert len(sw._times) <= 2  # bounded memory

    reg = RateLimiterRegistry(lambda: TokenBucket(5, 0, clock))
    assert sum(reg.allow("tenant-a") for _ in range(8)) == 5
    assert reg.allow("tenant-b")  # tenants are isolated

    # 20 threads x 10 calls against capacity 50, no refill: exactly 50 pass
    shared = TokenBucket(50, 0, clock)
    passed = []
    def hammer():
        passed.extend(1 for _ in range(10) if shared.allow())
    ts = [threading.Thread(target=hammer) for _ in range(20)]
    [t.start() for t in ts]
    [t.join() for t in ts]
    assert len(passed) == 50, len(passed)
