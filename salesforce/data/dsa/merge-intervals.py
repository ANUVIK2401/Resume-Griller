from typing import List


class Solution:
    def merge(self, intervals: List[List[int]]) -> List[List[int]]:
        merged = []
        for start, end in sorted(intervals):
            if merged and start <= merged[-1][1]:  # touching counts as overlap
                merged[-1][1] = max(merged[-1][1], end)
            else:
                merged.append([start, end])
        return merged


if __name__ == "__main__":
    s = Solution()
    assert s.merge([[1, 3], [2, 6], [8, 10], [15, 18]]) == [[1, 6], [8, 10], [15, 18]]
    assert s.merge([[1, 4], [4, 5]]) == [[1, 5]]
    assert s.merge([[1, 4], [2, 3]]) == [[1, 4]]
