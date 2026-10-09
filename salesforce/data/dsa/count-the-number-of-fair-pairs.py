from typing import List


class Solution:
    def countFairPairs(self, nums: List[int], lower: int, upper: int) -> int:
        nums = sorted(nums)  # pair count does not depend on order
        return self._pairs_at_most(nums, upper) - self._pairs_at_most(nums, lower - 1)

    def _pairs_at_most(self, nums, limit):
        left, right, count = 0, len(nums) - 1, 0
        while left < right:
            if nums[left] + nums[right] <= limit:
                count += right - left  # nums[left] pairs with everything up to right
                left += 1
            else:
                right -= 1
        return count


if __name__ == "__main__":
    s = Solution()
    assert s.countFairPairs([0, 1, 7, 4, 4, 5], 3, 6) == 6
    assert s.countFairPairs([1, 7, 9, 2, 5], 11, 11) == 1
