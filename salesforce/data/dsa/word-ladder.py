from collections import defaultdict, deque
from typing import List


class Solution:
    def ladderLength(self, beginWord: str, endWord: str, wordList: List[str]) -> int:
        if endWord not in wordList:
            return 0
        patterns = self._patterns(wordList)
        seen, queue = {beginWord}, deque([(beginWord, 1)])
        while queue:
            word, steps = queue.popleft()
            if word == endWord:
                return steps
            for i in range(len(word)):
                key = word[:i] + "*" + word[i + 1:]
                for nxt in patterns.pop(key, []):  # pop: each pattern bucket is used once
                    if nxt not in seen:
                        seen.add(nxt)
                        queue.append((nxt, steps + 1))
        return 0

    def _patterns(self, words):
        buckets = defaultdict(list)  # "h*t" -> ["hot", "hit"]
        for w in words:
            for i in range(len(w)):
                buckets[w[:i] + "*" + w[i + 1:]].append(w)
        return buckets


if __name__ == "__main__":
    s = Solution()
    assert s.ladderLength("hit", "cog", ["hot", "dot", "dog", "lot", "log", "cog"]) == 5
    assert s.ladderLength("hit", "cog", ["hot", "dot", "dog", "lot", "log"]) == 0
    assert s.ladderLength("a", "c", ["a", "b", "c"]) == 2
