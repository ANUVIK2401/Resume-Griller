from typing import List


class Solution:
    def minTaps(self, n: int, ranges: List[int]) -> int:
        reach = [0] * (n + 1)  # reach[x] = farthest right point from any tap covering x as its left edge
        for i, r in enumerate(ranges):
            left = max(0, i - r)
            reach[left] = max(reach[left], i + r)
        taps = covered = next_cover = 0
        for x in range(n + 1):  # jump game II over the reach array
            if x > next_cover:
                return -1
            if x > covered:
                taps += 1
                covered = next_cover
            next_cover = max(next_cover, reach[x])
        return taps


if __name__ == "__main__":
    s = Solution()
    assert s.minTaps(5, [3, 4, 1, 1, 0, 0]) == 1
    assert s.minTaps(3, [0, 0, 0, 0]) == -1
    assert s.minTaps(7, [1, 2, 1, 0, 2, 1, 0, 1]) == 3
