from typing import List


class Solution:
    def compress(self, chars: List[str]) -> int:
        write = read = 0
        while read < len(chars):
            ch, run_start = chars[read], read
            while read < len(chars) and chars[read] == ch:
                read += 1  # read pointer skips the whole run
            chars[write] = ch
            write += 1
            if read - run_start > 1:
                for digit in str(read - run_start):
                    chars[write] = digit
                    write += 1
        return write


if __name__ == "__main__":
    s = Solution()
    c = ["a", "a", "b", "b", "c", "c", "c"]
    assert s.compress(c) == 6 and c[:6] == ["a", "2", "b", "2", "c", "3"]
    c = ["a"]
    assert s.compress(c) == 1
    c = ["a"] + ["b"] * 12
    assert s.compress(c) == 4 and c[:4] == ["a", "b", "1", "2"]
