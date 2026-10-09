from typing import List


class Solution:
    def asteroidCollision(self, asteroids: List[int]) -> List[int]:
        stack = []
        for a in asteroids:
            alive = True
            while alive and a < 0 and stack and stack[-1] > 0:  # only right-then-left collide
                if stack[-1] < -a:
                    stack.pop()  # top explodes, keep checking
                    continue
                if stack[-1] == -a:
                    stack.pop()  # both explode
                alive = False
            if alive:
                stack.append(a)
        return stack


if __name__ == "__main__":
    s = Solution()
    assert s.asteroidCollision([5, 10, -5]) == [5, 10]
    assert s.asteroidCollision([8, -8]) == []
    assert s.asteroidCollision([10, 2, -5]) == [10]
    assert s.asteroidCollision([-2, -1, 1, 2]) == [-2, -1, 1, 2]
