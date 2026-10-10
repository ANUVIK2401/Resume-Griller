"""LLD correctness regressions: python3 scripts/test_lld_regressions.py."""

import importlib.util
from pathlib import Path
import sys
import unittest


def load_solution(name):
    solution = Path(__file__).resolve().parents[1] / "data/lld" / f"{name}.py"
    spec = importlib.util.spec_from_file_location(name.replace("-", "_"), solution)
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module  # dataclasses resolve annotations through the module
    spec.loader.exec_module(module)
    return module


ALERTS = load_solution("alert-deduplicator")
WORKFLOW = load_solution("workflow-step-logger")
INCIDENTS = load_solution("incident-state-machine")

LFU_SPEC = importlib.util.spec_from_file_location(
    "lfu_cache", Path(__file__).resolve().parents[1] / "data/dsa/lfu-cache.py")
LFU = importlib.util.module_from_spec(LFU_SPEC)
LFU_SPEC.loader.exec_module(LFU)


class LLDRegressionTests(unittest.TestCase):
    def test_lfu_frequency_buckets_stay_bounded(self):
        cache = LFU.LFUCache(1)
        cache.put(1, 100)
        for _ in range(1000):
            self.assertEqual(cache.get(1), 100)
        self.assertEqual(len(cache.buckets), 1)
        cache.put(2, 200)
        self.assertEqual(cache.get(1), -1)
        self.assertEqual(cache.get(2), 200)
        self.assertEqual(len(cache.buckets), 1)

    def test_lfu_zero_capacity_and_invalid_capacity(self):
        cache = LFU.LFUCache(0)
        cache.put(1, 100)
        self.assertEqual(cache.get(1), -1)
        self.assertEqual(len(cache.buckets), 0)
        for capacity in (-1, 0.5, True, "1"):
            with self.subTest(capacity=capacity), self.assertRaises(ValueError):
                LFU.LFUCache(capacity)

    def test_delimiters_cannot_merge_unrelated_alerts(self):
        first = ALERTS.Alert("a|b", "c", 2)
        second = ALERTS.Alert("a", "b|c", 2)
        dedup = ALERTS.AlertDeduplicator()
        self.assertNotEqual(dedup.fingerprint(first), dedup.fingerprint(second))
        self.assertIsNotNone(dedup.ingest(first))
        self.assertIsNotNone(dedup.ingest(second))

    def test_fingerprint_normalizes_label_order_and_ignores_volatile_labels(self):
        first = ALERTS.Alert("api", "errors", 2, (("region", "us"), ("pod", "p1"), ("env", "prod")))
        second = ALERTS.Alert("api", "errors", 1, (("env", "prod"), ("region", "us"), ("pod", "p2")))
        self.assertEqual(ALERTS.AlertDeduplicator.fingerprint(first), ALERTS.AlertDeduplicator.fingerprint(second))

    def test_listener_failure_is_observable_and_other_listeners_still_run(self):
        logger = WORKFLOW.WorkflowStepLogger()
        seen = []

        class BrokenListener:
            def on_transition(self, transition):
                raise RuntimeError("private credential detail")

        class HealthyListener:
            def on_transition(self, transition):
                seen.append(transition)

        logger.subscribe(BrokenListener())
        logger.subscribe(HealthyListener())
        transition = logger.record("wf", "step", WORKFLOW.StepState.PENDING, "worker")
        self.assertEqual(seen, [transition])
        self.assertEqual(logger.current_state("wf", "step"), WORKFLOW.StepState.PENDING)
        failures = logger.notification_failures
        self.assertEqual(len(failures), 1)
        self.assertEqual(failures[0].transition, transition)
        self.assertEqual(failures[0].listener_type, "BrokenListener")
        self.assertEqual(failures[0].error_type, "RuntimeError")
        self.assertNotIn("private credential", repr(failures))
        failures.clear()
        self.assertEqual(len(logger.notification_failures), 1)

    def test_incident_status_cannot_bypass_guards(self):
        incident = INCIDENTS.Incident("INC-1", "Outage", 1)
        with self.assertRaises(AttributeError):
            incident.status = INCIDENTS.Status.CLOSED
        machine = INCIDENTS.IncidentStateMachine()
        with self.assertRaises(ValueError):
            machine.fire(incident, INCIDENTS.Event.ACK, "owner")
        self.assertEqual(incident.status, INCIDENTS.Status.OPEN)
        self.assertEqual(incident.timeline, [])
        incident.assignee = "owner"
        machine.fire(incident, INCIDENTS.Event.ACK, "owner")
        machine.fire(incident, INCIDENTS.Event.RESOLVE, "owner")
        history = list(incident.timeline)
        with self.assertRaises(ValueError):
            machine.fire(incident, INCIDENTS.Event.CLOSE, "owner")
        self.assertEqual(incident.status, INCIDENTS.Status.RESOLVED)
        self.assertEqual(incident.timeline, history)
        incident.rca_link = "https://example.org/rca"
        self.assertEqual(machine.fire(incident, INCIDENTS.Event.CLOSE, "owner"), INCIDENTS.Status.CLOSED)


if __name__ == "__main__":
    unittest.main()
