from collections import deque
from typing import List


class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:
        count = 0
        for r in range(len(grid)):
            for c in range(len(grid[0])):
                if grid[r][c] == "1":
                    count += 1
                    self._sink(grid, r, c)
        return count

    def _sink(self, grid, r, c):
        grid[r][c] = "0"  # mark visited in place
        queue = deque([(r, c)])
        while queue:
            r, c = queue.popleft()
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= nr < len(grid) and 0 <= nc < len(grid[0]) and grid[nr][nc] == "1":
                    grid[nr][nc] = "0"
                    queue.append((nr, nc))


if __name__ == "__main__":
    s = Solution()
    g1 = [list("11110"), list("11010"), list("11000"), list("00000")]
    g2 = [list("11000"), list("11000"), list("00100"), list("00011")]
    assert s.numIslands(g1) == 1
    assert s.numIslands(g2) == 3
    assert s.numIslands([["0"]]) == 0
