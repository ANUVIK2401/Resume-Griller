class Solution:
    def minOperations(self, n: int) -> int:
        ops = 0
        while n:
            if n & 3 == 3:
                n += 1  # a run of 1s: one add clears it (0111 + 1 = 1000)
                ops += 1
            elif n & 1:
                n -= 1  # lone 1 bit: subtract it
                ops += 1
            else:
                n >>= 1  # trailing 0 costs nothing
        return ops


if __name__ == "__main__":
    s = Solution()
    assert s.minOperations(39) == 3
    assert s.minOperations(54) == 3
    assert s.minOperations(1) == 1
    assert s.minOperations(3) == 2

    # brute-force BFS over add/subtract powers of 2 for small n
    from collections import deque

    def brute(n):
        seen, q = {n: 0}, deque([n])
        while q:
            x = q.popleft()
            if x == 0:
                return seen[x]
            for p in (1 << i for i in range(12)):
                for y in (x + p, x - p):
                    if 0 <= y < 4096 and y not in seen:
                        seen[y] = seen[x] + 1
                        q.append(y)

    assert all(s.minOperations(n) == brute(n) for n in range(1, 600))
