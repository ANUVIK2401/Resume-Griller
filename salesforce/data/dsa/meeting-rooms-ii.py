import heapq
from typing import List


class Solution:
    def minMeetingRooms(self, intervals: List[List[int]]) -> int:
        ends = []  # min-heap of end times for rooms in use
        for start, end in sorted(intervals):
            if ends and ends[0] <= start:
                heapq.heapreplace(ends, end)  # reuse the room that frees first
            else:
                heapq.heappush(ends, end)
        return len(ends)


if __name__ == "__main__":
    s = Solution()
    assert s.minMeetingRooms([[0, 30], [5, 10], [15, 20]]) == 2
    assert s.minMeetingRooms([[7, 10], [2, 4]]) == 1
    assert s.minMeetingRooms([[1, 5], [5, 10]]) == 1
    assert s.minMeetingRooms([]) == 0
