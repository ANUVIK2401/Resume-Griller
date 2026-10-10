import threading
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Callable, Dict, List, Optional, Tuple


class Status(Enum):
    OPEN = "open"
    ACKNOWLEDGED = "acknowledged"
    MITIGATED = "mitigated"
    RESOLVED = "resolved"
    CLOSED = "closed"


class Event(Enum):
    ACK = "ack"
    MITIGATE = "mitigate"
    RESOLVE = "resolve"
    REOPEN = "reopen"
    CLOSE = "close"


@dataclass
class Incident:
    id: str
    title: str
    severity: int  # 1 is most severe
    _status: Status = field(default=Status.OPEN, init=False, repr=False)
    assignee: Optional[str] = None
    rca_link: Optional[str] = None
    timeline: List[Tuple[datetime, str]] = field(default_factory=list)

    @property
    def status(self) -> Status:
        """Public status is read-only; callers must use fire() to pass guards."""
        return self._status


Guard = Callable[[Incident], Optional[str]]  # returns an error message, or None if allowed


def needs_assignee(i: Incident) -> Optional[str]:
    return None if i.assignee else "assign an owner before acknowledging"


def needs_rca(i: Incident) -> Optional[str]:
    return None if i.rca_link or i.severity > 2 else "SEV1 and SEV2 need an RCA link before closing"


class IncidentStateMachine:
    """Table-driven State pattern: (status, event) -> (next status, guards)."""

    TABLE: Dict[Tuple[Status, Event], Tuple[Status, List[Guard]]] = {
        (Status.OPEN, Event.ACK): (Status.ACKNOWLEDGED, [needs_assignee]),
        (Status.ACKNOWLEDGED, Event.MITIGATE): (Status.MITIGATED, []),
        (Status.ACKNOWLEDGED, Event.RESOLVE): (Status.RESOLVED, []),
        (Status.MITIGATED, Event.RESOLVE): (Status.RESOLVED, []),
        (Status.RESOLVED, Event.REOPEN): (Status.OPEN, []),
        (Status.RESOLVED, Event.CLOSE): (Status.CLOSED, [needs_rca]),
    }

    def __init__(self, clock: Callable[[], datetime] = lambda: datetime.now(timezone.utc)):
        self._clock = clock
        self._lock = threading.Lock()

    def allowed_events(self, incident: Incident) -> List[Event]:
        return [e for (s, e) in self.TABLE if s == incident.status]

    def fire(self, incident: Incident, event: Event, actor: str) -> Status:
        with self._lock:  # validate and apply as one step
            rule = self.TABLE.get((incident.status, event))
            if rule is None:
                raise ValueError(f"{event.value} not allowed from {incident.status.value}")
            target, guards = rule
            for guard in guards:
                problem = guard(incident)
                if problem:
                    raise ValueError(problem)
            before = incident.status
            incident._status = target  # private state: public status has no setter
            incident.timeline.append((self._clock(), f"{actor}: {before.value} -> {target.value}"))
            return target


if __name__ == "__main__":
    sm = IncidentStateMachine()
    inc = Incident("INC-1", "API 5xx spike", severity=1)
    try:
        sm.fire(inc, Event.ACK, "anuvik")
        raise AssertionError("ack without assignee")
    except ValueError:
        pass
    assert inc.status == Status.OPEN and inc.timeline == []  # failed event leaves no trace
    inc.assignee = "anuvik"
    for e in (Event.ACK, Event.MITIGATE, Event.RESOLVE):
        sm.fire(inc, e, "anuvik")
    try:
        sm.fire(inc, Event.CLOSE, "anuvik")
        raise AssertionError("SEV1 closed without RCA")
    except ValueError:
        pass
    sm.fire(inc, Event.REOPEN, "anuvik")
    assert inc.status == Status.OPEN and sm.allowed_events(inc) == [Event.ACK]
    sm.fire(inc, Event.ACK, "anuvik")
    sm.fire(inc, Event.RESOLVE, "anuvik")
    inc.rca_link = "https://wiki/rca/INC-1"
    assert sm.fire(inc, Event.CLOSE, "anuvik") == Status.CLOSED
    assert sm.allowed_events(inc) == []  # closed is terminal
    assert len(inc.timeline) == 7
