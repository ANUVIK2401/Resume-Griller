from collections import Counter
from typing import List


class Solution:
    def maxPalindromesAfterOperations(self, words: List[str]) -> int:
        # swaps are free across words, so only total letter pairs matter
        pairs = sum(c // 2 for c in Counter("".join(words)).values())
        made = 0
        for length in sorted(len(w) for w in words):  # cheapest words first
            if pairs < length // 2:
                break
            pairs -= length // 2  # odd centers can be any leftover letter
            made += 1
        return made


if __name__ == "__main__":
    s = Solution()
    assert s.maxPalindromesAfterOperations(["abbb", "ba", "aa"]) == 3
    assert s.maxPalindromesAfterOperations(["abc", "ab"]) == 2
    assert s.maxPalindromesAfterOperations(["cd", "ef", "a"]) == 1
