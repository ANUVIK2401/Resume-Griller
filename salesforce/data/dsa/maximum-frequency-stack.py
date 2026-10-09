from collections import Counter, defaultdict


class FreqStack:
    def __init__(self):
        self.freq = Counter()
        self.stacks = defaultdict(list)  # frequency -> values pushed at that frequency
        self.max_freq = 0

    def push(self, val: int) -> None:
        self.freq[val] += 1
        f = self.freq[val]
        self.max_freq = max(self.max_freq, f)
        self.stacks[f].append(val)  # a value sits in one stack per frequency level

    def pop(self) -> int:
        val = self.stacks[self.max_freq].pop()
        self.freq[val] -= 1
        if not self.stacks[self.max_freq]:
            self.max_freq -= 1
        return val


if __name__ == "__main__":
    fs = FreqStack()
    for v in [5, 7, 5, 7, 4, 5]:
        fs.push(v)
    assert [fs.pop() for _ in range(4)] == [5, 7, 5, 4]
