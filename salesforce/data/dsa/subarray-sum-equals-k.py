from collections import defaultdict
from typing import List


class Solution:
    def subarraySum(self, nums: List[int], k: int) -> int:
        seen = defaultdict(int)
        seen[0] = 1  # empty prefix
        prefix = count = 0
        for n in nums:
            prefix += n
            count += seen[prefix - k]  # earlier prefixes that leave exactly k
            seen[prefix] += 1
        return count


if __name__ == "__main__":
    s = Solution()
    assert s.subarraySum([1, 1, 1], 2) == 2
    assert s.subarraySum([1, 2, 3], 3) == 2
    assert s.subarraySum([1, -1, 0], 0) == 3
