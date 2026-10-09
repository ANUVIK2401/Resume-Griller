from collections import Counter
from typing import List


class Solution:
    def topKFrequent(self, nums: List[int], k: int) -> List[int]:
        buckets = [[] for _ in range(len(nums) + 1)]  # index = frequency
        for num, freq in Counter(nums).items():
            buckets[freq].append(num)
        out = []
        for freq in range(len(buckets) - 1, 0, -1):
            out.extend(buckets[freq])
            if len(out) >= k:
                return out[:k]
        return out


if __name__ == "__main__":
    s = Solution()
    assert sorted(s.topKFrequent([1, 1, 1, 2, 2, 3], 2)) == [1, 2]
    assert s.topKFrequent([1], 1) == [1]
