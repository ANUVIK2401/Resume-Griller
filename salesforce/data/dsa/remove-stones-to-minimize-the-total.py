import heapq
from typing import List


class Solution:
    def minStoneSum(self, piles: List[int], k: int) -> int:
        heap = [-p for p in piles]  # max-heap via negation
        heapq.heapify(heap)
        for _ in range(k):
            largest = -heap[0]
            heapq.heapreplace(heap, -(largest - largest // 2))
        return -sum(heap)


if __name__ == "__main__":
    s = Solution()
    assert s.minStoneSum([5, 4, 9], 2) == 12
    assert s.minStoneSum([4, 3, 6, 7], 3) == 12
    assert s.minStoneSum([1], 5) == 1
