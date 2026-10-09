from collections import Counter


class Solution:
    def minWindow(self, s: str, t: str) -> str:
        need = Counter(t)
        missing = len(t)  # chars of t still uncovered
        left, best = 0, (0, float("inf"))
        for right, ch in enumerate(s):
            if need[ch] > 0:
                missing -= 1
            need[ch] -= 1
            if missing == 0:
                left = self._shrink(s, need, left)
                if right - left < best[1] - best[0]:
                    best = (left, right)
                need[s[left]] += 1  # give up the leftmost needed char, keep sliding
                missing += 1
                left += 1
        return "" if best[1] == float("inf") else s[best[0]:best[1] + 1]

    def _shrink(self, s, need, left):
        while need[s[left]] < 0:  # surplus chars can go
            need[s[left]] += 1
            left += 1
        return left


if __name__ == "__main__":
    s = Solution()
    assert s.minWindow("ADOBECODEBANC", "ABC") == "BANC"
    assert s.minWindow("a", "a") == "a"
    assert s.minWindow("a", "aa") == ""
    assert s.minWindow("ab", "b") == "b"
