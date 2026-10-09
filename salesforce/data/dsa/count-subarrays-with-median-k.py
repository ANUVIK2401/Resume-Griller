from collections import Counter
from typing import List


class Solution:
    def countSubarrays(self, nums: List[int], k: int) -> int:
        pos = nums.index(k)  # every valid subarray contains k
        left_balance = self._left_balances(nums, pos, k)
        count = balance = 0
        for j in range(pos, len(nums)):
            if j > pos:
                balance += 1 if nums[j] > k else -1
            # total (#greater - #smaller) must be 0 (odd length) or 1 (even length)
            count += left_balance[-balance] + left_balance[1 - balance]
        return count

    def _left_balances(self, nums, pos, k):
        seen = Counter({0: 1})
        balance = 0
        for i in range(pos - 1, -1, -1):
            balance += 1 if nums[i] > k else -1
            seen[balance] += 1
        return seen


if __name__ == "__main__":
    s = Solution()
    assert s.countSubarrays([3, 2, 1, 4, 5], 4) == 3
    assert s.countSubarrays([2, 3, 1], 3) == 1
