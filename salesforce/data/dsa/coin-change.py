from typing import List


class Solution:
    def coinChange(self, coins: List[int], amount: int) -> int:
        INF = amount + 1
        best = [0] + [INF] * amount  # best[x] = fewest coins summing to x
        for x in range(1, amount + 1):
            for c in coins:
                if c <= x:
                    best[x] = min(best[x], best[x - c] + 1)
        return best[amount] if best[amount] < INF else -1


if __name__ == "__main__":
    s = Solution()
    assert s.coinChange([1, 2, 5], 11) == 3
    assert s.coinChange([2], 3) == -1
    assert s.coinChange([1], 0) == 0
