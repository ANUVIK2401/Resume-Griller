import heapq
import itertools
import random
import threading
import time
from dataclasses import dataclass, field
from typing import Callable, Dict, List, Optional


@dataclass
class Job:
    id: str  # also the idempotency key
    fn: Callable[[], None]
    run_at: float
    max_retries: int = 3
    attempts: int = 0
    last_error: Optional[str] = None


@dataclass(order=True)
class _Entry:  # heap entry: compares by time, then sequence, never by Job
    run_at: float
    seq: int
    job: Job = field(compare=False)


class JobScheduler:
    def __init__(self, base_backoff: float = 1.0, max_backoff: float = 60.0,
                 clock: Callable[[], float] = time.monotonic, rng: random.Random = None):
        self._heap: List[_Entry] = []
        self._seq = itertools.count()
        self._known: Dict[str, Job] = {}
        self.dead_letters: List[Job] = []
        self.completed: List[str] = []
        self._base, self._cap = base_backoff, max_backoff
        self._clock, self._rng = clock, rng or random.Random()
        self._lock = threading.Lock()

    def submit(self, job_id: str, fn: Callable[[], None], delay: float = 0.0, max_retries: int = 3) -> bool:
        with self._lock:
            if job_id in self._known:
                return False  # duplicate submit is a no-op
            job = Job(job_id, fn, self._clock() + delay, max_retries)
            self._known[job_id] = job
            self._push(job)
            return True

    def run_pending(self) -> int:
        """Run every job that is due now. Returns how many ran."""
        ran = 0
        while True:
            with self._lock:  # pop under the lock, run outside it
                if not self._heap or self._heap[0].run_at > self._clock():
                    return ran
                job = heapq.heappop(self._heap).job
            self._execute(job)
            ran += 1

    def _execute(self, job: Job) -> None:
        job.attempts += 1
        try:
            job.fn()
            self.completed.append(job.id)
        except Exception as err:
            job.last_error = repr(err)
            self._retry_or_bury(job)

    def _retry_or_bury(self, job: Job) -> None:
        with self._lock:
            if job.attempts > job.max_retries:
                self.dead_letters.append(job)  # out of retries: park it for a human
                return
            job.run_at = self._clock() + self._backoff(job.attempts)
            self._push(job)

    def _backoff(self, attempt: int) -> float:
        ceiling = min(self._cap, self._base * 2 ** (attempt - 1))
        return self._rng.uniform(0, ceiling)  # full jitter spreads retries out

    def _push(self, job: Job) -> None:
        heapq.heappush(self._heap, _Entry(job.run_at, next(self._seq), job))


if __name__ == "__main__":
    now = [0.0]
    sched = JobScheduler(base_backoff=1, max_backoff=8, clock=lambda: now[0], rng=random.Random(1))

    calls = []
    sched.submit("ok", lambda: calls.append("ok"))
    assert not sched.submit("ok", lambda: calls.append("dup"))  # idempotent submit
    sched.submit("later", lambda: calls.append("later"), delay=5)
    assert sched.run_pending() == 1 and calls == ["ok"]
    now[0] = 5
    sched.run_pending()
    assert calls == ["ok", "later"]

    def boom():
        raise RuntimeError("downstream 503")

    sched.submit("flaky", boom, max_retries=2)
    for t in range(5, 100):  # advance time until retries are exhausted
        now[0] = t
        sched.run_pending()
    assert [j.id for j in sched.dead_letters] == ["flaky"]
    assert sched.dead_letters[0].attempts == 3 and "503" in sched.dead_letters[0].last_error

    # same run_at for two jobs must not compare Job objects
    sched.submit("a", lambda: None, delay=0)
    sched.submit("b", lambda: None, delay=0)
    assert sched.run_pending() == 2
    assert all(0 <= sched._backoff(n) <= 8 for n in range(1, 10))  # capped
