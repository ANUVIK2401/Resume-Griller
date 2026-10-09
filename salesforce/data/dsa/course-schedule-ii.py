from collections import deque
from typing import List


class Solution:
    def findOrder(self, numCourses: int, prerequisites: List[List[int]]) -> List[int]:
        graph, indegree = self._build(numCourses, prerequisites)
        queue = deque(c for c in range(numCourses) if indegree[c] == 0)
        order = []
        while queue:
            course = queue.popleft()
            order.append(course)
            for nxt in graph[course]:
                indegree[nxt] -= 1
                if indegree[nxt] == 0:
                    queue.append(nxt)
        return order if len(order) == numCourses else []  # leftovers mean a cycle

    def _build(self, n, prerequisites):
        graph = [[] for _ in range(n)]
        indegree = [0] * n
        for course, pre in prerequisites:
            graph[pre].append(course)
            indegree[course] += 1
        return graph, indegree


if __name__ == "__main__":
    s = Solution()

    def valid(n, pre, order):
        pos = {c: i for i, c in enumerate(order)}
        return len(order) == n and all(pos[p] < pos[c] for c, p in pre)

    assert s.findOrder(2, [[1, 0]]) == [0, 1]
    pre = [[1, 0], [2, 0], [3, 1], [3, 2]]
    assert valid(4, pre, s.findOrder(4, pre))
    assert s.findOrder(2, [[0, 1], [1, 0]]) == []
    assert s.findOrder(1, []) == [0]
