from typing import List


class Solution:
    def makeConnected(self, n: int, connections: List[List[int]]) -> int:
        if len(connections) < n - 1:
            return -1  # not enough cables to connect n machines
        parent = list(range(n))
        components = n
        for a, b in connections:
            ra, rb = self._find(parent, a), self._find(parent, b)
            if ra != rb:
                parent[ra] = rb
                components -= 1
        return components - 1  # each extra cable joins two components

    def _find(self, parent, x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x


if __name__ == "__main__":
    s = Solution()
    assert s.makeConnected(4, [[0, 1], [0, 2], [1, 2]]) == 1
    assert s.makeConnected(6, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3]]) == 2
    assert s.makeConnected(6, [[0, 1], [0, 2], [0, 3], [1, 2]]) == -1
