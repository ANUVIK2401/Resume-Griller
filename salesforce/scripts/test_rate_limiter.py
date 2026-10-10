"""Regression tests: python3 scripts/test_rate_limiter.py (standard library only)."""

import importlib.util
import math
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import unittest


SOLUTION = Path(__file__).resolve().parents[1] / "data/lld/rate-limiter.py"
SPEC = importlib.util.spec_from_file_location("rate_limiter", SOLUTION)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class RateLimiterTests(unittest.TestCase):
    def test_token_bucket_rejects_invalid_configuration(self):
        for capacity in (0, -1, math.nan, math.inf, -math.inf, True, "2"):
            with self.subTest(capacity=capacity), self.assertRaises(ValueError):
                MODULE.TokenBucket(capacity, 1)
        for rate in (-1, math.nan, math.inf, -math.inf, True, "2"):
            with self.subTest(rate=rate), self.assertRaises(ValueError):
                MODULE.TokenBucket(1, rate)

    def test_sliding_window_rejects_invalid_configuration(self):
        for limit in (0, -1, 1.5, math.nan, math.inf, True, "2"):
            with self.subTest(limit=limit), self.assertRaises(ValueError):
                MODULE.SlidingWindowLog(limit, 10)
        for window in (0, -1, math.nan, math.inf, -math.inf, True, "2"):
            with self.subTest(window=window), self.assertRaises(ValueError):
                MODULE.SlidingWindowLog(2, window)

    def test_invalid_cost_never_changes_quota(self):
        for limiter in (MODULE.TokenBucket(2, 0), MODULE.SlidingWindowLog(2, 10)):
            for cost in (0, -1, math.nan, math.inf, -math.inf, True, "1"):
                with self.subTest(limiter=type(limiter).__name__, cost=cost):
                    with self.assertRaises(ValueError):
                        limiter.allow(cost)
            self.assertTrue(limiter.allow(2))
            self.assertFalse(limiter.allow())

    def test_token_bucket_fractional_refill_and_capacity(self):
        now = [0.0]
        limiter = MODULE.TokenBucket(1, 0.5, lambda: now[0])
        self.assertTrue(limiter.allow(0.75))
        self.assertFalse(limiter.allow(0.5))
        now[0] = 0.5
        self.assertTrue(limiter.allow(0.5))
        now[0] = 100
        self.assertFalse(limiter.allow(1.1))
        self.assertTrue(limiter.allow(1))
        self.assertFalse(limiter.allow())

    def test_sliding_window_rejects_fractional_cost(self):
        limiter = MODULE.SlidingWindowLog(2, 10)
        for cost in (0.1, 0.5, 1.5):
            with self.subTest(cost=cost), self.assertRaises(ValueError):
                limiter.allow(cost)
        self.assertTrue(limiter.allow(2.0))
        self.assertFalse(limiter.allow())

    def test_sliding_window_exact_boundary_and_large_cost(self):
        now = [0.0]
        limiter = MODULE.SlidingWindowLog(2, 10, lambda: now[0])
        self.assertFalse(limiter.allow(3))
        self.assertTrue(limiter.allow())
        now[0] = 1
        self.assertTrue(limiter.allow())
        now[0] = 9.999
        self.assertFalse(limiter.allow())
        now[0] = 10
        self.assertTrue(limiter.allow())
        self.assertFalse(limiter.allow())
        now[0] = 11
        self.assertTrue(limiter.allow())
        self.assertLessEqual(len(limiter._times), 2)

    def test_concurrent_quota_is_atomic_for_both_strategies(self):
        for limiter in (MODULE.TokenBucket(50, 0), MODULE.SlidingWindowLog(50, 100)):
            with self.subTest(limiter=type(limiter).__name__):
                with ThreadPoolExecutor(max_workers=20) as executor:
                    accepted = list(executor.map(lambda _: limiter.allow(), range(200)))
                self.assertEqual(sum(accepted), 50)

    def test_registry_creation_is_atomic_and_keys_are_isolated(self):
        creations = []

        def factory():
            creations.append(1)
            return MODULE.TokenBucket(50, 0)

        registry = MODULE.RateLimiterRegistry(factory)
        with ThreadPoolExecutor(max_workers=20) as executor:
            accepted = list(executor.map(lambda _: registry.allow("tenant-a"), range(200)))
        self.assertEqual(sum(accepted), 50)
        self.assertEqual(len(creations), 1)
        self.assertTrue(registry.allow("tenant-b"))
        self.assertEqual(len(creations), 2)

    def test_registry_rejects_invalid_cost_before_allocating_key(self):
        creations = []

        def factory():
            creations.append(1)
            return MODULE.TokenBucket(1, 0)

        registry = MODULE.RateLimiterRegistry(factory)
        with self.assertRaises(ValueError):
            registry.allow("invalid-request", -1)
        self.assertEqual(creations, [])


if __name__ == "__main__":
    unittest.main()
