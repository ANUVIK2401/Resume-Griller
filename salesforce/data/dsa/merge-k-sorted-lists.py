import heapq
from typing import List, Optional


class ListNode:  # LeetCode provides this
    def __init__(self, val=0, next=None):
        self.val, self.next = val, next


class Solution:
    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:
        # index i breaks ties so nodes are never compared
        heap = [(node.val, i, node) for i, node in enumerate(lists) if node]
        heapq.heapify(heap)
        dummy = tail = ListNode()
        while heap:
            _, i, node = heapq.heappop(heap)
            tail.next = tail = node
            if node.next:
                heapq.heappush(heap, (node.next.val, i, node.next))
        return dummy.next


if __name__ == "__main__":
    def build(vals):
        dummy = cur = ListNode()
        for v in vals:
            cur.next = cur = ListNode(v)
        return dummy.next

    def to_list(node):
        out = []
        while node:
            out.append(node.val)
            node = node.next
        return out

    s = Solution()
    assert to_list(s.mergeKLists([build([1, 4, 5]), build([1, 3, 4]), build([2, 6])])) == [1, 1, 2, 3, 4, 4, 5, 6]
    assert to_list(s.mergeKLists([])) == []
    assert to_list(s.mergeKLists([None, build([0])])) == [0]
