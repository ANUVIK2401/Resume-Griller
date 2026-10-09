from collections import deque
from typing import List


class Solution:
    def shortestBridge(self, grid: List[List[int]]) -> int:
        queue = self._mark_first_island(grid)  # first island cells become 2
        flips = 0
        while queue:
            for _ in range(len(queue)):  # expand outward one ring per flip
                r, c = queue.popleft()
                for nr, nc in self._neighbors(grid, r, c):
                    if grid[nr][nc] == 1:
                        return flips
                    if grid[nr][nc] == 0:
                        grid[nr][nc] = 2
                        queue.append((nr, nc))
            flips += 1
        return -1

    def _mark_first_island(self, grid):
        start = next((r, c) for r in range(len(grid)) for c in range(len(grid)) if grid[r][c] == 1)
        grid[start[0]][start[1]] = 2
        stack, island = [start], deque([start])
        while stack:
            r, c = stack.pop()
            for nr, nc in self._neighbors(grid, r, c):
                if grid[nr][nc] == 1:
                    grid[nr][nc] = 2
                    stack.append((nr, nc))
                    island.append((nr, nc))
        return island

    def _neighbors(self, grid, r, c):
        n = len(grid)
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < n and 0 <= nc < n:
                yield nr, nc


if __name__ == "__main__":
    s = Solution()
    assert s.shortestBridge([[0, 1], [1, 0]]) == 1
    assert s.shortestBridge([[0, 1, 0], [0, 0, 0], [0, 0, 1]]) == 2
    ring = [[1, 1, 1, 1, 1], [1, 0, 0, 0, 1], [1, 0, 1, 0, 1], [1, 0, 0, 0, 1], [1, 1, 1, 1, 1]]
    assert s.shortestBridge(ring) == 1
