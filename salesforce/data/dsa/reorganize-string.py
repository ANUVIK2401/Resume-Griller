import heapq
from collections import Counter


class Solution:
    def reorganizeString(self, s: str) -> str:
        heap = [(-cnt, ch) for ch, cnt in Counter(s).items()]
        heapq.heapify(heap)
        out, held = [], None  # held = last used char, kept out for one turn
        while heap:
            cnt, ch = heapq.heappop(heap)
            out.append(ch)
            if held:
                heapq.heappush(heap, held)
            held = (cnt + 1, ch) if cnt + 1 < 0 else None
        return "" if held else "".join(out)


if __name__ == "__main__":
    s = Solution()

    def valid(src, res):
        return sorted(src) == sorted(res) and all(a != b for a, b in zip(res, res[1:]))

    assert valid("aab", s.reorganizeString("aab"))
    assert s.reorganizeString("aaab") == ""
    assert valid("vvvlo", s.reorganizeString("vvvlo"))
    assert s.reorganizeString("a") == "a"
