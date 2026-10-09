import heapq
from collections import Counter
from typing import List


class Solution:
    def topKFrequent(self, words: List[str], k: int) -> List[str]:
        counts = Counter(words)
        # higher count first, then alphabetical: (-count, word) sorts that way
        return heapq.nsmallest(k, counts, key=lambda w: (-counts[w], w))


if __name__ == "__main__":
    s = Solution()
    assert s.topKFrequent(["i", "love", "leetcode", "i", "love", "coding"], 2) == ["i", "love"]
    words = ["the", "day", "is", "sunny", "the", "the", "the", "sunny", "is", "is"]
    assert s.topKFrequent(words, 4) == ["the", "is", "sunny", "day"]
