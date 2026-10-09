import heapq
from typing import List


class Solution:
    def finish_time(self, types: List[str], memory: List[int], duration: List[int], limit: int) -> int:
        if any(m > limit for m in memory):
            return -1  # a task that can never fit
        waiting = list(range(len(types)))  # task ids, input order is priority
        running = []  # min-heap of (end_time, task_id)
        used, per_type, now = 0, {}, 0

        while waiting or running:
            waiting, used = self._start_fitting(waiting, running, types, memory, duration, limit, used, per_type, now)
            if not running:
                return -1  # nothing runs and nothing can start: stuck
            now = running[0][0]
            while running and running[0][0] == now:  # free everything ending now
                _, tid = heapq.heappop(running)
                used -= memory[tid]
                per_type[types[tid]] -= 1
        return now

    def _start_fitting(self, waiting, running, types, memory, duration, limit, used, per_type, now):
        still_waiting = []
        for tid in waiting:  # earliest index first, skip tasks that do not fit yet
            t = types[tid]
            if used + memory[tid] <= limit and per_type.get(t, 0) < 2:
                used += memory[tid]
                per_type[t] = per_type.get(t, 0) + 1
                heapq.heappush(running, (now + duration[tid], tid))
            else:
                still_waiting.append(tid)
        return still_waiting, used


if __name__ == "__main__":
    s = Solution()
    assert s.finish_time(["a", "a", "a"], [1, 1, 1], [2, 2, 2], 10) == 4  # third "a" waits for the cap
    assert s.finish_time(["a", "b"], [6, 6], [3, 1], 10) == 4  # memory blocks "b" until t=3
    assert s.finish_time(["a", "a", "a", "b"], [1, 1, 1, 1], [5, 5, 5, 1], 10) == 10  # "b" jumps the blocked "a"
    assert s.finish_time(["a"], [11], [1], 10) == -1
    assert s.finish_time([], [], [], 10) == 0
