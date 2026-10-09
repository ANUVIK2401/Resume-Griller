from collections import defaultdict
from typing import List


class Solution:
    def solveQueries(self, nums: List[int], queries: List[int]) -> List[int]:
        n = len(nums)
        positions = defaultdict(list)  # value -> sorted indices
        for i, v in enumerate(nums):
            positions[v].append(i)
        best = [-1] * n
        for idxs in positions.values():
            if len(idxs) > 1:
                self._fill(idxs, n, best)
        return [best[q] for q in queries]

    def _fill(self, idxs, n, best):
        m = len(idxs)
        for j, i in enumerate(idxs):
            # nearest equal value is a sorted neighbor, wrapping around the circle
            for other in (idxs[j - 1], idxs[(j + 1) % m]):
                gap = abs(i - other)
                d = min(gap, n - gap)
                best[i] = d if best[i] == -1 else min(best[i], d)


if __name__ == "__main__":
    s = Solution()
    assert s.solveQueries([1, 3, 1, 4, 1, 3, 2], [0, 3, 5]) == [2, -1, 3]
    assert s.solveQueries([1, 2, 3, 4], [0, 1, 2, 3]) == [-1, -1, -1, -1]
