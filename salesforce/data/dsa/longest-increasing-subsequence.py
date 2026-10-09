import bisect
from typing import List


class Solution:
    def lengthOfLIS(self, nums: List[int]) -> int:
        tails = []  # tails[i] = smallest tail of an increasing run of length i+1
        for n in nums:
            i = bisect.bisect_left(tails, n)
            if i == len(tails):
                tails.append(n)
            else:
                tails[i] = n
        return len(tails)


if __name__ == "__main__":
    s = Solution()
    assert s.lengthOfLIS([10, 9, 2, 5, 3, 7, 101, 18]) == 4
    assert s.lengthOfLIS([0, 1, 0, 3, 2, 3]) == 4
    assert s.lengthOfLIS([7, 7, 7, 7]) == 1
