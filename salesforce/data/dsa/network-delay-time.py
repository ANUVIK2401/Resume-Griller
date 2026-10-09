import heapq
from collections import defaultdict
from typing import List


class Solution:
    def networkDelayTime(self, times: List[List[int]], n: int, k: int) -> int:
        graph = defaultdict(list)
        for u, v, w in times:
            graph[u].append((v, w))
        dist = {}
        heap = [(0, k)]
        while heap:  # Dijkstra: first pop of a node is its shortest time
            d, node = heapq.heappop(heap)
            if node in dist:
                continue
            dist[node] = d
            for nxt, w in graph[node]:
                if nxt not in dist:
                    heapq.heappush(heap, (d + w, nxt))
        return max(dist.values()) if len(dist) == n else -1


if __name__ == "__main__":
    s = Solution()
    assert s.networkDelayTime([[2, 1, 1], [2, 3, 1], [3, 4, 1]], 4, 2) == 2
    assert s.networkDelayTime([[1, 2, 1]], 2, 1) == 1
    assert s.networkDelayTime([[1, 2, 1]], 2, 2) == -1
