import heapq
from collections import defaultdict
from typing import List


class Solution:
    def processQueries(self, c: int, connections: List[List[int]], queries: List[List[int]]) -> List[int]:
        parent = list(range(c + 1))
        for u, v in connections:
            parent[self._find(parent, u)] = self._find(parent, v)
        heaps = defaultdict(list)  # grid root -> min-heap of station ids
        for station in range(1, c + 1):
            heapq.heappush(heaps[self._find(parent, station)], station)
        online = [True] * (c + 1)
        out = []
        for kind, x in queries:
            if kind == 2:
                online[x] = False  # lazy delete: heap cleans up on read
            elif online[x]:
                out.append(x)
            else:
                out.append(self._smallest_online(heaps[self._find(parent, x)], online))
        return out

    def _smallest_online(self, heap, online):
        while heap and not online[heap[0]]:
            heapq.heappop(heap)
        return heap[0] if heap else -1

    def _find(self, parent, x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x


if __name__ == "__main__":
    s = Solution()
    assert s.processQueries(5, [[1, 2], [2, 3], [3, 4], [4, 5]], [[1, 3], [2, 1], [1, 1], [2, 2], [1, 2]]) == [3, 2, 3]
    assert s.processQueries(3, [], [[1, 1], [2, 1], [1, 1]]) == [1, -1]
