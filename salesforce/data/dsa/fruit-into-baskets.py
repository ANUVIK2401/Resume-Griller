from collections import defaultdict
from typing import List


class Solution:
    def totalFruit(self, fruits: List[int]) -> int:
        counts = defaultdict(int)
        left = best = 0
        for right, f in enumerate(fruits):
            counts[f] += 1
            while len(counts) > 2:  # shrink until two types remain
                counts[fruits[left]] -= 1
                if counts[fruits[left]] == 0:
                    del counts[fruits[left]]
                left += 1
            best = max(best, right - left + 1)
        return best


if __name__ == "__main__":
    s = Solution()
    assert s.totalFruit([1, 2, 1]) == 3
    assert s.totalFruit([0, 1, 2, 2]) == 3
    assert s.totalFruit([1, 2, 3, 2, 2]) == 4
    assert s.totalFruit([3, 3, 3, 1, 2, 1, 1, 2, 3, 3, 4]) == 5
