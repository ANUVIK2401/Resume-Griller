from typing import List


class Solution:
    def minEatingSpeed(self, piles: List[int], h: int) -> int:
        lo, hi = 1, max(piles)
        while lo < hi:  # smallest speed that finishes in h hours
            mid = (lo + hi) // 2
            if self._hours(piles, mid) <= h:
                hi = mid
            else:
                lo = mid + 1
        return lo

    def _hours(self, piles, speed):
        return sum((p + speed - 1) // speed for p in piles)  # ceil division


if __name__ == "__main__":
    s = Solution()
    assert s.minEatingSpeed([3, 6, 7, 11], 8) == 4
    assert s.minEatingSpeed([30, 11, 23, 4, 20], 5) == 30
    assert s.minEatingSpeed([30, 11, 23, 4, 20], 6) == 23
