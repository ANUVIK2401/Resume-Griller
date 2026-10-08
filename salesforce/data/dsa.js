/* Salesforce DSA list. "sf" = frequently reported in Salesforce interviews.
   Difficulty: E / M / H. Slugs build the LeetCode link. */
const lc = (title, slug, diff, tags, notes) => ({
  title, url: `https://leetcode.com/problems/${slug}/`, meta: diff, tags, notes
});

const SF_PAGE = {
  key: 'dsa',
  sections: [
    {
      title: 'Reported 2026 MTS loop: closest practice problems',
      intro: 'One April 2026 MTS candidate got these two. Solve the closest analogs, then write the reported version from scratch.',
      items: [
        { title: 'Reported: task scheduling with memory limit and max 2 same-type tasks in parallel', meta: 'M/H', tags: ['reported', 'heap', 'greedy'],
          notes: 'Find minimum time to run all tasks. Think greedy with a heap by memory, or binary search on time plus a feasibility check. State the constraints back before coding.' },
        lc('Task Scheduler', 'task-scheduler', 'M', ['reported', 'heap', 'greedy']),
        lc('Process Tasks Using Servers', 'process-tasks-using-servers', 'M', ['reported', 'heap']),
        { title: 'Reported: grid BFS where you can jump 1 to K cells, with obstacles', meta: 'M/H', tags: ['reported', 'bfs', 'graph'],
          notes: 'BFS by levels. Stop extending a direction when you hit an obstacle. Prune cells already reached at an earlier or equal level, or the run goes O(mnk).' },
        lc('Minimum Number of Visited Cells in a Grid', 'minimum-number-of-visited-cells-in-a-grid', 'H', ['reported', 'bfs']),
        lc('Shortest Path in a Grid with Obstacles Elimination', 'shortest-path-in-a-grid-with-obstacles-elimination', 'H', ['reported', 'bfs']),
        lc('Jump Game II', 'jump-game-ii', 'M', ['reported', 'greedy'])
      ]
    },
    {
      title: 'Must do: top Salesforce-reported problems',
      intro: 'Do these first. They come up most in reports and cover the core patterns.',
      items: [
        lc('Two Sum', 'two-sum', 'E', ['sf', 'hashing']),
        lc('LRU Cache', 'lru-cache', 'M', ['sf', 'design']),
        lc('Merge Intervals', 'merge-intervals', 'M', ['sf', 'intervals']),
        lc('Number of Islands', 'number-of-islands', 'M', ['sf', 'bfs']),
        lc('Top K Frequent Elements', 'top-k-frequent-elements', 'M', ['sf', 'heap']),
        lc('Longest Substring Without Repeating Characters', 'longest-substring-without-repeating-characters', 'M', ['sf', 'sliding-window']),
        lc('Course Schedule', 'course-schedule', 'M', ['sf', 'graph']),
        lc('Meeting Rooms II', 'meeting-rooms-ii', 'M', ['sf', 'intervals', 'heap']),
        lc('Word Break', 'word-break', 'M', ['sf', 'dp']),
        lc('Rotting Oranges', 'rotting-oranges', 'M', ['sf', 'bfs']),
        lc('Group Anagrams', 'group-anagrams', 'M', ['sf', 'hashing']),
        lc('Valid Parentheses', 'valid-parentheses', 'E', ['sf', 'stack'])
      ]
    },
    {
      title: 'Graphs and BFS / DFS',
      items: [
        lc('Course Schedule II', 'course-schedule-ii', 'M', ['graph']),
        lc('Network Delay Time', 'network-delay-time', 'M', ['graph']),
        lc('Cheapest Flights Within K Stops', 'cheapest-flights-within-k-stops', 'M', ['graph']),
        lc('Accounts Merge', 'accounts-merge', 'M', ['graph', 'union-find']),
        lc('Evaluate Division', 'evaluate-division', 'M', ['graph']),
        lc('Word Ladder', 'word-ladder', 'H', ['bfs']),
        lc('Clone Graph', 'clone-graph', 'M', ['graph']),
        lc('Pacific Atlantic Water Flow', 'pacific-atlantic-water-flow', 'M', ['bfs'])
      ]
    },
    {
      title: 'Heaps and scheduling',
      intro: 'This group matters most for an SRE team: rate limits, job scheduling, resource caps.',
      items: [
        lc('Kth Largest Element in an Array', 'kth-largest-element-in-an-array', 'M', ['heap']),
        lc('Find Median from Data Stream', 'find-median-from-data-stream', 'H', ['heap']),
        lc('Reorganize String', 'reorganize-string', 'M', ['heap', 'greedy']),
        lc('Single-Threaded CPU', 'single-threaded-cpu', 'M', ['heap']),
        lc('Merge k Sorted Lists', 'merge-k-sorted-lists', 'H', ['heap']),
        lc('IPO', 'ipo', 'H', ['heap', 'greedy'])
      ]
    },
    {
      title: 'Intervals, sliding window, two pointers',
      items: [
        lc('Insert Interval', 'insert-interval', 'M', ['intervals']),
        lc('Non-overlapping Intervals', 'non-overlapping-intervals', 'M', ['intervals']),
        lc('Minimum Window Substring', 'minimum-window-substring', 'H', ['sliding-window']),
        lc('Sliding Window Maximum', 'sliding-window-maximum', 'H', ['sliding-window']),
        lc('Trapping Rain Water', 'trapping-rain-water', 'H', ['two-pointers']),
        lc('3Sum', '3sum', 'M', ['two-pointers']),
        lc('Subarray Sum Equals K', 'subarray-sum-equals-k', 'M', ['hashing'])
      ]
    },
    {
      title: 'Design-flavored data structures',
      intro: 'Salesforce likes these because they look like small LLD problems with tight complexity.',
      items: [
        lc('Min Stack', 'min-stack', 'M', ['design', 'stack']),
        lc('Insert Delete GetRandom O(1)', 'insert-delete-getrandom-o1', 'M', ['design']),
        lc('Time Based Key-Value Store', 'time-based-key-value-store', 'M', ['design', 'binary-search']),
        lc('Logger Rate Limiter', 'logger-rate-limiter', 'E', ['design']),
        lc('Design Hit Counter', 'design-hit-counter', 'M', ['design']),
        lc('Snapshot Array', 'snapshot-array', 'M', ['design', 'binary-search']),
        lc('Design Underground System', 'design-underground-system', 'M', ['design']),
        lc('LFU Cache', 'lfu-cache', 'H', ['design'])
      ]
    },
    {
      title: 'Binary search, stacks, DP',
      items: [
        lc('Search in Rotated Sorted Array', 'search-in-rotated-sorted-array', 'M', ['binary-search']),
        lc('Koko Eating Bananas', 'koko-eating-bananas', 'M', ['binary-search']),
        lc('Capacity To Ship Packages Within D Days', 'capacity-to-ship-packages-within-d-days', 'M', ['binary-search']),
        lc('Daily Temperatures', 'daily-temperatures', 'M', ['stack']),
        lc('Asteroid Collision', 'asteroid-collision', 'M', ['stack']),
        lc('Basic Calculator II', 'basic-calculator-ii', 'M', ['stack']),
        lc('Coin Change', 'coin-change', 'M', ['dp']),
        lc('Decode Ways', 'decode-ways', 'M', ['dp']),
        lc('Longest Increasing Subsequence', 'longest-increasing-subsequence', 'M', ['dp'])
      ]
    },
    {
      title: 'Trees and backtracking',
      items: [
        lc('Binary Tree Right Side View', 'binary-tree-right-side-view', 'M', ['tree']),
        lc('Lowest Common Ancestor of a Binary Tree', 'lowest-common-ancestor-of-a-binary-tree', 'M', ['tree']),
        lc('Serialize and Deserialize Binary Tree', 'serialize-and-deserialize-binary-tree', 'H', ['tree', 'design']),
        lc('Validate Binary Search Tree', 'validate-binary-search-tree', 'M', ['tree']),
        lc('Word Search', 'word-search', 'M', ['backtracking']),
        lc('Combination Sum', 'combination-sum', 'M', ['backtracking']),
        lc('Subsets', 'subsets', 'M', ['backtracking'])
      ]
    },
    {
      title: 'How to practice',
      items: [
        { title: 'Narrate: clarify, approach, complexity, code, test', notes: 'State complexity before you are asked. Walk one edge case by hand after coding.', tags: ['method'] },
        { title: 'Write in Java or Python with clean classes', notes: 'The JD stresses OOP and modular code. Name helpers well and avoid one giant function.', tags: ['method'] },
        { title: 'Re-solve every problem you missed 3 days later', notes: 'Log misses in your DSA patterns notes.', tags: ['method'] },
        { title: 'LeetCode Salesforce company tag (Premium)', url: 'https://leetcode.com/company/salesforce/', notes: 'Sort by last 6 months for the freshest list.', tags: ['method'] }
      ]
    }
  ]
};
