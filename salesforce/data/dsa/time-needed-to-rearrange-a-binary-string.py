class Solution:
    def secondsToRemoveOccurrences(self, s: str) -> int:
        zeros = seconds = 0
        for ch in s:
            if ch == "0":
                zeros += 1
            elif zeros:
                # this 1 must pass every zero before it, and can't overtake the 1 ahead
                seconds = max(seconds + 1, zeros)
        return seconds


if __name__ == "__main__":
    s = Solution()
    assert s.secondsToRemoveOccurrences("0110101") == 4
    assert s.secondsToRemoveOccurrences("11100") == 0

    def simulate(t):
        sec = 0
        while "01" in t:
            t, sec = t.replace("01", "10"), sec + 1
        return sec

    import itertools
    for n in range(1, 11):
        for bits in itertools.product("01", repeat=n):
            t = "".join(bits)
            assert s.secondsToRemoveOccurrences(t) == simulate(t), t
