from collections import Counter
from typing import List


class Solution:
    def deleteAndEarn(self, nums: List[int]) -> int:
        points = Counter()
        for n in nums:
            points[n] += n  # taking value v earns v * count(v)
        take = skip = 0
        prev = None
        for v in sorted(points):  # house robber over sorted distinct values
            best_before = max(take, skip)
            if prev is not None and v == prev + 1:
                take, skip = skip + points[v], best_before
            else:
                take, skip = best_before + points[v], best_before
            prev = v
        return max(take, skip)


if __name__ == "__main__":
    s = Solution()
    assert s.deleteAndEarn([3, 4, 2]) == 6
    assert s.deleteAndEarn([2, 2, 3, 3, 3, 4]) == 9
    assert s.deleteAndEarn([1]) == 1
