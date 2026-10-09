from collections import OrderedDict


class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.items = OrderedDict()  # oldest first

    def get(self, key: int) -> int:
        if key not in self.items:
            return -1
        self.items.move_to_end(key)  # mark as most recently used
        return self.items[key]

    def put(self, key: int, value: int) -> None:
        self.items[key] = value
        self.items.move_to_end(key)
        if len(self.items) > self.capacity:
            self.items.popitem(last=False)  # evict least recently used


if __name__ == "__main__":
    c = LRUCache(2)
    c.put(1, 1)
    c.put(2, 2)
    assert c.get(1) == 1
    c.put(3, 3)  # evicts 2
    assert c.get(2) == -1
    c.put(4, 4)  # evicts 1
    assert c.get(1) == -1 and c.get(3) == 3 and c.get(4) == 4
