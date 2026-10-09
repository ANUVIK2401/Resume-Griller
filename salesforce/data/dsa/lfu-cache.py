from collections import OrderedDict, defaultdict


class LFUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.values = {}  # key -> value
        self.freq = {}  # key -> use count
        self.buckets = defaultdict(OrderedDict)  # count -> keys in LRU order
        self.min_freq = 0

    def get(self, key: int) -> int:
        if key not in self.values:
            return -1
        self._touch(key)
        return self.values[key]

    def put(self, key: int, value: int) -> None:
        if self.capacity == 0:
            return
        if key in self.values:
            self.values[key] = value
            self._touch(key)
            return
        if len(self.values) == self.capacity:
            self._evict()
        self.values[key], self.freq[key] = value, 1
        self.buckets[1][key] = None
        self.min_freq = 1  # a new key always has the lowest count

    def _touch(self, key):
        f = self.freq[key]
        del self.buckets[f][key]
        if not self.buckets[f] and self.min_freq == f:
            self.min_freq += 1
        self.freq[key] = f + 1
        self.buckets[f + 1][key] = None

    def _evict(self):
        key, _ = self.buckets[self.min_freq].popitem(last=False)  # LRU among least frequent
        del self.values[key], self.freq[key]


if __name__ == "__main__":
    c = LFUCache(2)
    c.put(1, 1)
    c.put(2, 2)
    assert c.get(1) == 1
    c.put(3, 3)  # evicts 2 (freq 1)
    assert c.get(2) == -1 and c.get(3) == 3
    c.put(4, 4)  # 1 and 3 both freq 2: evict 1, the least recent
    assert c.get(1) == -1 and c.get(3) == 3 and c.get(4) == 4
    z = LFUCache(0)
    z.put(0, 0)
    assert z.get(0) == -1
