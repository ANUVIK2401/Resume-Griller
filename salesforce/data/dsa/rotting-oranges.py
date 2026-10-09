from collections import deque
from typing import List


class Solution:
    def orangesRotting(self, grid: List[List[int]]) -> int:
        queue = deque()
        fresh = 0
        for r, row in enumerate(grid):
            for c, v in enumerate(row):
                if v == 2:
                    queue.append((r, c))  # every rotten orange starts at minute 0
                elif v == 1:
                    fresh += 1
        minutes = 0
        while queue and fresh:
            for _ in range(len(queue)):  # one BFS level = one minute
                r, c = queue.popleft()
                for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                    if 0 <= nr < len(grid) and 0 <= nc < len(grid[0]) and grid[nr][nc] == 1:
                        grid[nr][nc] = 2
                        fresh -= 1
                        queue.append((nr, nc))
            minutes += 1
        return -1 if fresh else minutes


if __name__ == "__main__":
    s = Solution()
    assert s.orangesRotting([[2, 1, 1], [1, 1, 0], [0, 1, 1]]) == 4
    assert s.orangesRotting([[2, 1, 1], [0, 1, 1], [1, 0, 1]]) == -1
    assert s.orangesRotting([[0, 2]]) == 0
