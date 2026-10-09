from collections import deque
from typing import List, Tuple


class Solution:
    def min_moves(self, grid: List[str], k: int, start: Tuple[int, int], end: Tuple[int, int]) -> int:
        rows, cols = len(grid), len(grid[0])
        INF = float("inf")
        dist = [[INF] * cols for _ in range(rows)]
        dist[start[0]][start[1]] = 0
        queue = deque([start])
        while queue:
            r, c = queue.popleft()
            if (r, c) == end:
                return dist[r][c]
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                self._slide(grid, dist, queue, r, c, dr, dc, k)
        return -1

    def _slide(self, grid, dist, queue, r, c, dr, dc, k):
        nxt = dist[r][c] + 1
        for step in range(1, k + 1):
            nr, nc = r + dr * step, c + dc * step
            if not (0 <= nr < len(grid) and 0 <= nc < len(grid[0])) or grid[nr][nc] == "#":
                break  # cannot jump over a wall
            if dist[nr][nc] < nxt:
                break  # reached earlier; that cell covers everything past it
            if dist[nr][nc] == nxt:
                continue  # same level already queued, keep sliding
            dist[nr][nc] = nxt
            queue.append((nr, nc))


if __name__ == "__main__":
    s = Solution()
    grid = ["....", "###.", "...."]
    assert s.min_moves(grid, 4, (0, 0), (2, 0)) == 3
    assert s.min_moves(grid, 1, (0, 0), (2, 0)) == 8
    assert s.min_moves([".#", "#."], 1, (0, 0), (1, 1)) == -1
    assert s.min_moves(["."], 3, (0, 0), (0, 0)) == 0

    # cross-check the pruned BFS against a plain BFS on random grids
    import random

    def brute(grid, k, start, end):
        dist = {start: 0}
        queue = deque([start])
        while queue:
            r, c = queue.popleft()
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                for step in range(1, k + 1):
                    nr, nc = r + dr * step, c + dc * step
                    if not (0 <= nr < len(grid) and 0 <= nc < len(grid[0])) or grid[nr][nc] == "#":
                        break
                    if (nr, nc) not in dist:
                        dist[(nr, nc)] = dist[(r, c)] + 1
                        queue.append((nr, nc))
        return dist.get(end, -1)

    rng = random.Random(7)
    for _ in range(300):
        rows, cols, k = rng.randint(1, 7), rng.randint(1, 7), rng.randint(1, 4)
        g = ["".join("#" if rng.random() < 0.3 else "." for _ in range(cols)) for _ in range(rows)]
        cells = [(r, c) for r in range(rows) for c in range(cols) if g[r][c] == "."]
        if len(cells) < 2:
            continue
        a, b = rng.sample(cells, 2)
        assert s.min_moves(g, k, a, b) == brute(g, k, a, b), (g, k, a, b)
