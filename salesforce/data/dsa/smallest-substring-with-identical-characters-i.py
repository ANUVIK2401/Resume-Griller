class Solution:
    def minLength(self, s: str, numOps: int) -> int:
        lo, hi = 1, len(s)
        while lo < hi:  # smallest max-run length reachable with numOps flips
            mid = (lo + hi) // 2
            if self._flips_needed(s, mid) <= numOps:
                hi = mid
            else:
                lo = mid + 1
        return lo

    def _flips_needed(self, s, limit):
        if limit == 1:  # must alternate: compare to both patterns
            mismatch = sum(1 for i, ch in enumerate(s) if ch != "01"[i % 2])
            return min(mismatch, len(s) - mismatch)
        flips, run = 0, 1
        for i in range(1, len(s) + 1):
            if i < len(s) and s[i] == s[i - 1]:
                run += 1
            else:
                flips += run // (limit + 1)  # one flip per limit+1 chars breaks the run
                run = 1
        return flips


if __name__ == "__main__":
    s = Solution()
    assert s.minLength("000001", 1) == 2
    assert s.minLength("0000", 2) == 1
    assert s.minLength("0101", 0) == 1

    import itertools

    def brute(t, ops):
        def longest_run(u):
            return max(len(list(g)) for _, g in itertools.groupby(u))
        best = longest_run(t)
        for r in range(1, ops + 1):
            for idxs in itertools.combinations(range(len(t)), r):
                u = list(t)
                for i in idxs:
                    u[i] = "1" if u[i] == "0" else "0"
                best = min(best, longest_run(u))
        return best

    for n in range(1, 9):
        for bits in itertools.product("01", repeat=n):
            t = "".join(bits)
            for ops in range(0, 3):
                assert s.minLength(t, ops) == brute(t, ops), (t, ops)
