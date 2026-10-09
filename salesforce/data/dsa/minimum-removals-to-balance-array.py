from typing import List


class Solution:
    def minRemoval(self, nums: List[int], k: int) -> int:
        nums = sorted(nums)
        left = longest = 0
        for right, hi in enumerate(nums):
            while hi > k * nums[left]:  # window min is nums[left], max is hi
                left += 1
            longest = max(longest, right - left + 1)
        return len(nums) - longest  # keep the longest balanced window


if __name__ == "__main__":
    s = Solution()
    assert s.minRemoval([2, 1, 5], 2) == 1
    assert s.minRemoval([1, 6, 2, 9], 3) == 2
    assert s.minRemoval([4, 6], 2) == 0
    assert s.minRemoval([7], 1) == 0
