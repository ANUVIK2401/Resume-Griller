from collections import defaultdict
from typing import List


class Solution:
    def minTransfers(self, transactions: List[List[int]]) -> int:
        balance = defaultdict(int)
        for giver, taker, amount in transactions:
            balance[giver] -= amount
            balance[taker] += amount
        debts = [b for b in balance.values() if b != 0]
        return self._settle(debts, 0)

    def _settle(self, debts, start):
        while start < len(debts) and debts[start] == 0:
            start += 1
        if start == len(debts):
            return 0
        best = float("inf")
        tried = set()
        for j in range(start + 1, len(debts)):
            # settle debts[start] into an opposite-sign account; skip repeats of the same amount
            if debts[j] * debts[start] < 0 and debts[j] not in tried:
                tried.add(debts[j])
                debts[j] += debts[start]
                best = min(best, 1 + self._settle(debts, start + 1))
                debts[j] -= debts[start]
                if debts[j] + debts[start] == 0:
                    break  # exact cancel is always optimal
        return best


if __name__ == "__main__":
    s = Solution()
    assert s.minTransfers([[0, 1, 10], [2, 0, 5]]) == 2
    assert s.minTransfers([[0, 1, 10], [1, 0, 1], [1, 2, 5], [2, 0, 5]]) == 1
    assert s.minTransfers([[0, 1, 5], [1, 0, 5]]) == 0
