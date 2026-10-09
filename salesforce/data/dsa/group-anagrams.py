from collections import defaultdict
from typing import List


class Solution:
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
        groups = defaultdict(list)
        for word in strs:
            groups[self._signature(word)].append(word)
        return list(groups.values())

    def _signature(self, word):
        counts = [0] * 26  # O(L) key instead of sorting
        for ch in word:
            counts[ord(ch) - 97] += 1
        return tuple(counts)


if __name__ == "__main__":
    s = Solution()
    norm = lambda groups: sorted(sorted(g) for g in groups)
    assert norm(s.groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"])) == [["ate", "eat", "tea"], ["bat"], ["nat", "tan"]]
    assert s.groupAnagrams([""]) == [[""]]
