import heapq
from typing import List


class Solution:
    def maximumProduct(self, nums: List[int]) -> int:
        a, b, c = heapq.nlargest(3, nums)
        x, y = heapq.nsmallest(2, nums)  # two big negatives can beat two positives
        return max(a * b * c, a * x * y)


if __name__ == "__main__":
    s = Solution()
    assert s.maximumProduct([1, 2, 3]) == 6
    assert s.maximumProduct([1, 2, 3, 4]) == 24
    assert s.maximumProduct([-1, -2, -3]) == -6
    assert s.maximumProduct([-10, -10, 1, 3, 2]) == 300
