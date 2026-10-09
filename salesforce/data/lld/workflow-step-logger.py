import threading
from dataclasses import dataclass
from datetime import datetime, timezone
from enum import Enum
from typing import Callable, Dict, List, Optional, Protocol, Tuple


class StepState(Enum):
    PENDING = "pending"
    RUNNING = "running"
    RETRYING = "retrying"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass(frozen=True)  # immutable: a logged transition never changes
class Transition:
    workflow_id: str
    step_id: str
    from_state: Optional[StepState]
    to_state: StepState
    at: datetime
    actor: str
    reason: str = ""


class TransitionPolicy:
    """Which moves are legal. Swap it to change the rules (Strategy)."""

    ALLOWED = {
        None: {StepState.PENDING},
        StepState.PENDING: {StepState.RUNNING, StepState.CANCELLED},
        StepState.RUNNING: {StepState.SUCCEEDED, StepState.FAILED, StepState.RETRYING, StepState.CANCELLED},
        StepState.RETRYING: {StepState.RUNNING, StepState.FAILED, StepState.CANCELLED},
        StepState.SUCCEEDED: set(),  # terminal
        StepState.FAILED: set(),  # terminal
        StepState.CANCELLED: set(),  # terminal
    }

    def check(self, current: Optional[StepState], target: StepState) -> None:
        if target not in self.ALLOWED[current]:
            raise ValueError(f"illegal transition {current} -> {target}")


class TransitionListener(Protocol):  # Observer
    def on_transition(self, t: Transition) -> None: ...


class InMemoryTransitionStore:
    """Append-only history per (workflow, step). Swap for a DB-backed store."""

    def __init__(self) -> None:
        self._history: Dict[Tuple[str, str], List[Transition]] = {}

    def append(self, t: Transition) -> None:
        self._history.setdefault((t.workflow_id, t.step_id), []).append(t)

    def history(self, workflow_id: str, step_id: str) -> List[Transition]:
        return list(self._history.get((workflow_id, step_id), []))  # copy: callers cannot mutate ours

    def current(self, workflow_id: str, step_id: str) -> Optional[StepState]:
        events = self._history.get((workflow_id, step_id))
        return events[-1].to_state if events else None


class WorkflowStepLogger:
    def __init__(self, store=None, policy=None, clock: Callable[[], datetime] = lambda: datetime.now(timezone.utc)):
        self._store = store or InMemoryTransitionStore()
        self._policy = policy or TransitionPolicy()
        self._clock = clock
        self._listeners: List[TransitionListener] = []
        # ponytail: one lock for every step; switch to per-key locks if throughput matters
        self._lock = threading.Lock()

    def subscribe(self, listener: TransitionListener) -> None:
        self._listeners.append(listener)

    def record(self, workflow_id: str, step_id: str, to_state: StepState, actor: str, reason: str = "") -> Transition:
        with self._lock:  # read current state and append atomically, so two writers cannot both pass the check
            current = self._store.current(workflow_id, step_id)
            self._policy.check(current, to_state)
            t = Transition(workflow_id, step_id, current, to_state, self._clock(), actor, reason)
            self._store.append(t)
        self._notify(t)  # outside the lock: a slow listener must not block writers
        return t

    def history(self, workflow_id: str, step_id: str) -> List[Transition]:
        return self._store.history(workflow_id, step_id)

    def current_state(self, workflow_id: str, step_id: str) -> Optional[StepState]:
        return self._store.current(workflow_id, step_id)

    def _notify(self, t: Transition) -> None:
        for listener in list(self._listeners):
            try:
                listener.on_transition(t)
            except Exception:  # one broken listener must not break logging
                pass


if __name__ == "__main__":
    log = WorkflowStepLogger()
    seen = []

    class Collector:
        def on_transition(self, t):
            seen.append(t.to_state)

    log.subscribe(Collector())
    for s in (StepState.PENDING, StepState.RUNNING, StepState.RETRYING, StepState.RUNNING, StepState.SUCCEEDED):
        log.record("wf1", "extract", s, actor="worker-1")
    assert log.current_state("wf1", "extract") == StepState.SUCCEEDED
    assert [t.to_state for t in log.history("wf1", "extract")] == seen
    assert log.history("wf1", "extract")[1].from_state == StepState.PENDING

    try:
        log.record("wf1", "extract", StepState.RUNNING, actor="worker-1")  # terminal state
        raise AssertionError("terminal state accepted a transition")
    except ValueError:
        pass
    assert log.current_state("wf1", "missing") is None and log.history("wf1", "missing") == []

    h = log.history("wf1", "extract")
    h.clear()  # caller mutating its copy must not affect the log
    assert len(log.history("wf1", "extract")) == 5

    # many threads race to start the same step: exactly one RUNNING wins
    log.record("wf2", "load", StepState.PENDING, actor="api")
    wins = []

    def try_start():
        try:
            log.record("wf2", "load", StepState.RUNNING, actor="worker")
            wins.append(1)
        except ValueError:
            pass

    threads = [threading.Thread(target=try_start) for _ in range(50)]
    [t.start() for t in threads]
    [t.join() for t in threads]
    assert len(wins) == 1, len(wins)
