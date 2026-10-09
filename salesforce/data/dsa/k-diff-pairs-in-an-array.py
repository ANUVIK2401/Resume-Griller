from collections import Counter
from typing import List


class Solution:
    def findPairs(self, nums: List[int], k: int) -> int:
        counts = Counter(nums)
        if k == 0:
            return sum(1 for c in counts.values() if c > 1)  # need a duplicate
        return sum(1 for v in counts if v + k in counts)  # unique pairs by smaller value


if __name__ == "__main__":
    s = Solution()
    assert s.findPairs([3, 1, 4, 1, 5], 2) == 2
    assert s.findPairs([1, 2, 3, 4, 5], 1) == 4
    assert s.findPairs([1, 3, 1, 5, 4], 0) == 1
