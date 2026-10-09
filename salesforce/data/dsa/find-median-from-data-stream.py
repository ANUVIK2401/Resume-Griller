import heapq


class MedianFinder:
    def __init__(self):
        self.low = []   # max-heap (negated), the smaller half
        self.high = []  # min-heap, the larger half

    def addNum(self, num: int) -> None:
        heapq.heappush(self.low, -num)
        heapq.heappush(self.high, -heapq.heappop(self.low))  # keep every low <= every high
        if len(self.high) > len(self.low):
            heapq.heappush(self.low, -heapq.heappop(self.high))  # low holds the extra one

    def findMedian(self) -> float:
        if len(self.low) > len(self.high):
            return float(-self.low[0])
        return (-self.low[0] + self.high[0]) / 2


if __name__ == "__main__":
    m = MedianFinder()
    m.addNum(1)
    m.addNum(2)
    assert m.findMedian() == 1.5
    m.addNum(3)
    assert m.findMedian() == 2.0
    m2 = MedianFinder()
    for x in [5, 15, 1, 3]:
        m2.addNum(x)
    assert m2.findMedian() == 4.0
