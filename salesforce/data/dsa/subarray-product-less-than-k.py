from typing import List


class Solution:
    def numSubarrayProductLessThanK(self, nums: List[int], k: int) -> int:
        if k <= 1:
            return 0  # all values are >= 1, so no product is < 1
        product, left, count = 1, 0, 0
        for right, n in enumerate(nums):
            product *= n
            while product >= k:
                product //= nums[left]
                left += 1
            count += right - left + 1  # every subarray ending at right
        return count


if __name__ == "__main__":
    s = Solution()
    assert s.numSubarrayProductLessThanK([10, 5, 2, 6], 100) == 8
    assert s.numSubarrayProductLessThanK([1, 2, 3], 0) == 0
    assert s.numSubarrayProductLessThanK([1, 1, 1], 2) == 6
