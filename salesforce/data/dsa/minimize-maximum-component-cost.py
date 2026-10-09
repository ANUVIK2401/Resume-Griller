from typing import List


class Solution:
    def minCost(self, n: int, edges: List[List[int]], k: int) -> int:
        parent = list(range(n))
        components, cost = n, 0
        for u, v, w in sorted(edges, key=lambda e: e[2]):  # Kruskal, cheapest first
            if components <= k:
                break  # already few enough components; heavier edges can be removed
            if self._union(parent, u, v):
                components -= 1
                cost = w
        return cost

    def _find(self, parent, x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]  # path halving
            x = parent[x]
        return x

    def _union(self, parent, a, b):
        ra, rb = self._find(parent, a), self._find(parent, b)
        if ra == rb:
            return False
        parent[ra] = rb
        return True


if __name__ == "__main__":
    s = Solution()
    assert s.minCost(5, [[0, 1, 4], [1, 2, 3], [1, 3, 2], [3, 4, 6]], 2) == 4
    assert s.minCost(4, [[0, 1, 5], [1, 2, 5], [2, 3, 5]], 1) == 5
    assert s.minCost(3, [[0, 1, 7]], 3) == 0
