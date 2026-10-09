class Solution:
    def removeDuplicates(self, s: str, k: int) -> str:
        stack = []  # [char, run length]
        for ch in s:
            if stack and stack[-1][0] == ch:
                stack[-1][1] += 1
                if stack[-1][1] == k:
                    stack.pop()  # removal can join the runs on either side
            else:
                stack.append([ch, 1])
        return "".join(ch * n for ch, n in stack)


if __name__ == "__main__":
    s = Solution()
    assert s.removeDuplicates("abcd", 2) == "abcd"
    assert s.removeDuplicates("deeedbbcccbdaa", 3) == "aa"
    assert s.removeDuplicates("pbbcggttciiippooaais", 2) == "ps"
