import { Challenge } from '../types/competition';

export const DEFAULT_CHALLENGES: Challenge[] = [
  // ==========================================
  // EASY TIER (Levels 1 - 7)
  // ==========================================
  {
    id: 'chal-1',
    level: 1,
    difficulty: 'easy',
    topic: 'farming',
    title: 'Level 1: Automated Seed Sower',
    description: 'Use a loop to fly the drone across the farm and plant at least 12 Carrot seeds.',
    points: 100,
    targetCrop: 'carrot',
    targetCount: 12,
    timeLimitSeconds: 120,
    testCriterion: 'planted_count',
    starterCode: `# Level 1: Automated Seed Sower (Easy - Farming)
# Goal: Write a Python loop to plant at least 12 Carrot seeds.
#
# Available commands:
#   fly_to(x, y)          - Moves the drone to coordinates (x, y)
#   plant(x, y, "carrot") - Plants a carrot seed at (x, y)
#   get_tile(x, y)        - Returns current tile details

# TODO: Write your automation loop below to plant 12 carrots

`,
    solutionHint: 'Use nested loops for x in range(0, 4) and y in range(0, 3) with fly_to(x, y) and plant(x, y, "carrot").',
  },
  {
    id: 'chal-2',
    level: 2,
    difficulty: 'easy',
    topic: 'farming',
    title: 'Level 2: Golden Wheat Fields',
    description: 'Traverse a 4x4 coordinate zone to plant at least 16 Wheat seeds and build a golden crop field.',
    points: 120,
    targetCrop: 'wheat',
    targetCount: 16,
    timeLimitSeconds: 120,
    testCriterion: 'planted_count',
    starterCode: `# Level 2: Golden Wheat Fields (Easy - Farming)
# Goal: Traverse farm plots and plant at least 16 Wheat seeds.
#
# Available commands:
#   fly_to(x, y)         - Moves the drone to coordinates (x, y)
#   plant(x, y, "wheat") - Plants a wheat seed at (x, y)

# TODO: Write your loop to cover at least 16 plots with wheat

`,
    solutionHint: 'Use nested loops x in range(4) and y in range(4) calling fly_to(x, y) and plant(x, y, "wheat").',
  },
  {
    id: 'chal-3',
    level: 3,
    difficulty: 'easy',
    topic: 'farming',
    title: 'Level 3: Quick Hydration Mist',
    description: 'Spray irrigation hydration mist across at least 8 soil plots until moisture reaches optimal 60%+.',
    points: 130,
    targetCount: 8,
    timeLimitSeconds: 150,
    testCriterion: 'water_efficiency',
    starterCode: `# Level 3: Quick Hydration Mist (Easy - Farming)
# Goal: Fly across soil beds and water at least 8 plots until moisture >= 60%.
#
# Available commands:
#   fly_to(x, y)   - Move drone to (x, y)
#   water(x, y)    - Spray hydration mist on soil
#   get_tile(x, y) - Check tile info: tile["moisture"]

# TODO: Write your code below to inspect and water 8 plots

`,
    solutionHint: 'Loop over plots, check tile["moisture"] with get_tile(x, y), and water if below 60%.',
  },
  {
    id: 'chal-4',
    level: 4,
    difficulty: 'easy',
    topic: 'farming',
    title: 'Level 4: Organic Weed Cleansing',
    description: 'Clear invasive weeds and fertilize at least 6 plots to boost nutrients to >= 65%.',
    points: 140,
    targetCount: 6,
    timeLimitSeconds: 150,
    testCriterion: 'water_efficiency',
    starterCode: `# Level 4: Organic Weed Cleansing (Easy - Farming)
# Goal: Clear weeds and apply organic fertilizer on at least 6 plots.
#
# Available commands:
#   fly_to(x, y)        - Move drone to (x, y)
#   clear_weeds(x, y)   - Remove weeds on plot
#   fertilize(x, y)     - Enrich soil nutrients

# TODO: Write your automation routine to clear and fertilize 6 plots

`,
    solutionHint: 'Call clear_weeds(x, y) followed by fertilize(x, y) across 6 plots.',
  },
  {
    id: 'chal-5',
    level: 5,
    difficulty: 'easy',
    topic: 'leetcode',
    title: 'Level 5: LeetCode #1 - Two Sum Soil Target',
    description: 'Given an array of integers nums and an integer target, return indices [i, j] such that nums[i] + nums[j] == target.',
    points: 150,
    targetCount: 1,
    timeLimitSeconds: 120,
    testCriterion: 'leetcode_test',
    functionName: 'two_sum',
    testCases: [
      { input: [[2, 7, 11, 15], 9], expected: [0, 1], description: 'Target 9 with [2, 7]' },
      { input: [[3, 2, 4], 6], expected: [1, 2], description: 'Target 6 with [2, 4]' },
      { input: [[3, 3], 6], expected: [0, 1], description: 'Target 6 with duplicate [3, 3]' },
      { input: [[1, 5, 8, 12, 14], 20], expected: [2, 3], description: 'Target 20 with [8, 12]' },
    ],
    starterCode: `# Level 5: LeetCode #1 - Two Sum (Easy)
#
# Problem:
#   Given an array of integers 'nums' and an integer 'target',
#   return indices of the two numbers such that they add up to target.
#   Assume exactly one valid solution exists.
#
# Examples:
#   two_sum([2, 7, 11, 15], 9) -> [0, 1]
#   two_sum([3, 2, 4], 6)      -> [1, 2]

def two_sum(nums, target):
    # TODO: Implement two_sum algorithm
    pass

`,
    solutionHint: 'Use nested loops: for i in range(len(nums)): for j in range(i + 1, len(nums)): if nums[i] + nums[j] == target: return [i, j]',
  },
  {
    id: 'chal-6',
    level: 6,
    difficulty: 'easy',
    topic: 'leetcode',
    title: 'Level 6: LeetCode #9 - Palindrome Number',
    description: 'Given an integer x, return True if x is a palindrome, and False otherwise. A number is palindrome if it reads the same backward as forward.',
    points: 130,
    targetCount: 1,
    timeLimitSeconds: 90,
    testCriterion: 'leetcode_test',
    functionName: 'is_palindrome',
    testCases: [
      { input: [121], expected: true, description: '121 is palindrome' },
      { input: [-121], expected: false, description: 'Negative numbers are not palindromes' },
      { input: [10], expected: false, description: '10 reverse is 01' },
      { input: [12321], expected: true, description: '12321 is palindrome' },
      { input: [7], expected: true, description: 'Single digit is palindrome' },
    ],
    starterCode: `# Level 6: LeetCode #9 - Palindrome Number (Easy)
#
# Problem:
#   Given an integer x, return True if x is palindrome integer.
#   An integer is a palindrome when it reads the same backward as forward.
#
# Examples:
#   is_palindrome(121)   -> True
#   is_palindrome(-121)  -> False
#   is_palindrome(10)    -> False

def is_palindrome(x):
    # TODO: Check if x is palindrome
    pass

`,
    solutionHint: 'Convert to string with str(x). Compare s[i] with s[len(s) - 1 - i] for i in range(len(s) // 2).',
  },
  {
    id: 'chal-7',
    level: 7,
    difficulty: 'easy',
    topic: 'leetcode',
    title: 'Level 7: LeetCode #463 - Island Perimeter Patrol',
    description: 'Patrol and hydrate ONLY the outer perimeter plots (x==0 or y==0 or x==max_x or y==max_y) to >=60% moisture, leaving interior plots unwatered.',
    points: 160,
    targetCount: 16,
    timeLimitSeconds: 150,
    testCriterion: 'pattern_match',
    starterCode: `# Level 7: LeetCode #463 - Island Perimeter Patrol (Easy)
#
# Problem:
#   Identify the outer perimeter boundary of your farmland.
#   Water all perimeter plots (moisture >= 60%) while keeping interior plots dry.
#
# Perimeter conditions on 6x6 grid:
#   x == 0 or y == 0 or x == 5 or y == 5

# Available commands:
#   fly_to(x, y), water(x, y)

# TODO: Navigate and hydrate all perimeter plots

`,
    solutionHint: 'Loop x in range(6) and y in range(6): if x == 0 or y == 0 or x == 5 or y == 5: water(x, y).',
  },

  // ==========================================
  // MEDIUM TIER (Levels 8 - 15)
  // ==========================================
  {
    id: 'chal-8',
    level: 8,
    difficulty: 'medium',
    topic: 'farming',
    title: 'Level 8: Smart Irrigation Engineer',
    description: 'Fly across your soil beds and water 14 plots so their moisture reaches optimal levels (>=60%).',
    points: 200,
    targetCount: 14,
    timeLimitSeconds: 180,
    testCriterion: 'water_efficiency',
    starterCode: `# Level 8: Smart Irrigation Engineer (Medium - Farming)
# Goal: Inspect plots and water at least 14 dry beds to optimal moisture (>=60%).
#
# Available commands:
#   fly_to(x, y)   - Move drone to (x, y)
#   water(x, y)    - Spray hydration mist on soil
#   get_tile(x, y) - Check tile info: tile["moisture"]

# TODO: Build an efficient loop to inspect and water 14 plots

`,
    solutionHint: 'Use get_tile(x, y) to check moisture and water if it is below 80.',
  },
  {
    id: 'chal-9',
    level: 9,
    difficulty: 'medium',
    topic: 'farming',
    title: 'Level 9: Bountiful Autumn Harvest',
    description: 'Plant and nurture crops to maturity (growth >= 100), then harvest at least 8 crops into your inventory.',
    points: 250,
    targetCount: 8,
    timeLimitSeconds: 180,
    testCriterion: 'harvest_count',
    starterCode: `# Level 9: Bountiful Autumn Harvest (Medium - Farming)
# Goal: Plant, nurture, and harvest at least 8 mature crops.
#
# Available commands:
#   plant(x, y, "carrot"), water(x, y), harvest(x, y)

# TODO: Plant crops, nurture them, and harvest when ripe

`,
    solutionHint: 'Plant fast crops like carrots or wheat, water them, and harvest once growth reaches 100.',
  },
  {
    id: 'chal-10',
    level: 10,
    difficulty: 'medium',
    topic: 'farming',
    title: 'Level 10: Soil Nutrition Master',
    description: 'Clear weeds and apply fertilizer across at least 10 farm plots to optimize soil nutrients (>=65%).',
    points: 280,
    targetCount: 10,
    timeLimitSeconds: 180,
    testCriterion: 'water_efficiency',
    starterCode: `# Level 10: Soil Nutrition Master (Medium - Farming)
# Goal: Clear weeds and enrich soil nutrients to >= 65% on at least 10 plots.
#
# Available commands:
#   fly_to(x, y), clear_weeds(x, y), fertilize(x, y)

# TODO: Clean and fertilize 10 plots to maximize soil health

`,
    solutionHint: 'Iterate over 10 plots calling clear_weeds(x, y) and fertilize(x, y).',
  },
  {
    id: 'chal-11',
    level: 11,
    difficulty: 'medium',
    topic: 'farming',
    title: 'Level 11: Crop Rotation Duo',
    description: 'Plant at least 18 plots with crops, alternating between different crop species to maintain biodiversity.',
    points: 300,
    targetCount: 18,
    timeLimitSeconds: 180,
    testCriterion: 'planted_count',
    starterCode: `# Level 11: Crop Rotation Duo (Medium - Farming)
# Goal: Plant at least 18 plots alternating between different crop types (e.g. carrot, wheat, tomato).
#
# Available commands:
#   fly_to(x, y), plant(x, y, crop_id)

# TODO: Implement alternating crop distribution across 18 plots

`,
    solutionHint: 'Use modulo on loop index to alternate planting "carrot" and "wheat" across 18 plots.',
  },
  {
    id: 'chal-12',
    level: 12,
    difficulty: 'medium',
    topic: 'leetcode',
    title: 'Level 12: LeetCode #53 - Maximum Subarray (Kadane)',
    description: 'Given an integer array nums, find the contiguous subarray with the largest sum and return its sum using Kadane\'s algorithm.',
    points: 260,
    targetCount: 1,
    timeLimitSeconds: 180,
    testCriterion: 'leetcode_test',
    functionName: 'max_sub_array',
    testCases: [
      { input: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6, description: '[4,-1,2,1] has the largest sum = 6' },
      { input: [[1]], expected: 1, description: 'Single element array' },
      { input: [[5, 4, -1, 7, 8]], expected: 23, description: 'All positive numbers' },
      { input: [[-1, -2, -3]], expected: -1, description: 'All negative numbers' },
    ],
    starterCode: `# Level 12: LeetCode #53 - Maximum Subarray (Medium)
#
# Problem:
#   Given an integer array nums, find the subarray with the largest sum,
#   and return its sum using Kadane's algorithm.
#
# Examples:
#   max_sub_array([-2,1,-3,4,-1,2,1,-5,4]) -> 6  # [4,-1,2,1]
#   max_sub_array([5,4,-1,7,8])             -> 23

def max_sub_array(nums):
    # TODO: Implement Kadane's algorithm
    pass

`,
    solutionHint: 'Initialize max_sum = nums[0] and cur = 0. For x in nums: cur = max(x, cur + x); max_sum = max(max_sum, cur). Return max_sum.',
  },
  {
    id: 'chal-13',
    level: 13,
    difficulty: 'medium',
    topic: 'leetcode',
    title: 'Level 13: LeetCode #54 - Spiral Matrix Traversal',
    description: 'Traverse the farm plots in clockwise spiral order (top-right, right-down, bottom-left, left-up, inward) and plant at least 16 plots along the path.',
    points: 280,
    targetCount: 16,
    timeLimitSeconds: 180,
    testCriterion: 'pattern_match',
    starterCode: `# Level 13: LeetCode #54 - Spiral Matrix Traversal (Medium)
#
# Problem:
#   Traverse the grid in clockwise spiral order:
#   1. Top row from left to right
#   2. Right column from top to bottom
#   3. Bottom row from right to left
#   4. Left column from bottom to top, then inward!
#   Plant crops at each step along the spiral path. Reach at least 16 plots.
#
# Available commands:
#   fly_to(x, y), plant(x, y, "carrot")

# TODO: Implement the spiral traversal loop

`,
    solutionHint: 'Maintain bounds: top = 0, bottom = 3, left = 0, right = 3. Traverse boundaries and shrink bounds after each edge.',
  },
  {
    id: 'chal-14',
    level: 14,
    difficulty: 'medium',
    topic: 'leetcode',
    title: 'Level 14: LeetCode #75 - Dutch National Flag Sorting',
    description: 'Segregate farm crops in 3 sorted rows: Row 0 must be all Carrots (Red), Row 1 all Wheat (Yellow), and Row 2 all Corn (Green)!',
    points: 300,
    targetCount: 12,
    timeLimitSeconds: 180,
    testCriterion: 'pattern_match',
    starterCode: `# Level 14: LeetCode #75 - Dutch National Flag Sorting (Medium)
#
# Problem:
#   Implement 3-way partition by row:
#   - Row 0 (y=0): Plant Carrots (Red) across at least 4 plots
#   - Row 1 (y=1): Plant Wheat (Yellow) across at least 4 plots
#   - Row 2 (y=2): Plant Corn (Green) across at least 4 plots
#
# Available commands:
#   plant(x, y, "carrot"), plant(x, y, "wheat"), plant(x, y, "corn")

# TODO: Plant crops partitioned by row

`,
    solutionHint: 'Loop for x in range(4): plant(x, 0, "carrot"); plant(x, 1, "wheat"); plant(x, 2, "corn").',
  },
  {
    id: 'chal-15',
    level: 15,
    difficulty: 'medium',
    topic: 'leetcode',
    title: 'Level 15: LeetCode #198 - House Robber (Agro Yield)',
    description: 'You are harvesting plots with varying crop yields. You cannot harvest two adjacent plots without alerting pests. Determine the maximum yield you can collect.',
    points: 290,
    targetCount: 1,
    timeLimitSeconds: 180,
    testCriterion: 'leetcode_test',
    functionName: 'rob',
    testCases: [
      { input: [[1, 2, 3, 1]], expected: 4, description: 'Harvest plot 0 (1) + plot 2 (3) = 4' },
      { input: [[2, 7, 9, 3, 1]], expected: 12, description: 'Harvest plot 0 (2) + plot 2 (9) + plot 4 (1) = 12' },
      { input: [[2, 1, 1, 2]], expected: 4, description: 'Harvest plot 0 (2) + plot 3 (2) = 4' },
      { input: [[5]], expected: 5, description: 'Single plot' },
    ],
    starterCode: `# Level 15: LeetCode #198 - House Robber (Medium)
#
# Problem:
#   Given an integer array nums representing the amount of harvest at each plot,
#   return the maximum yield you can harvest without picking two adjacent plots.
#
# Examples:
#   rob([1, 2, 3, 1])    -> 4  (1 + 3)
#   rob([2, 7, 9, 3, 1]) -> 12 (2 + 9 + 1)

def rob(nums):
    # TODO: Implement dynamic programming solution
    pass

`,
    solutionHint: 'Maintain prev1 = 0, prev2 = 0. For x in nums: temp = max(prev1, prev2 + x); prev2 = prev1; prev1 = temp. Return prev1.',
  },

  // ==========================================
  // HARD TIER (Levels 16 - 22)
  // ==========================================
  {
    id: 'chal-16',
    level: 16,
    difficulty: 'hard',
    topic: 'farming',
    title: 'Level 16: Full Lifecycle Farm Pipeline',
    description: 'Automate a full agricultural pipeline: sow seeds, water plots, monitor growth, and harvest at least 14 mature crops.',
    points: 400,
    targetCount: 14,
    timeLimitSeconds: 210,
    testCriterion: 'harvest_count',
    starterCode: `# Level 16: Full Lifecycle Farm Pipeline (Hard - Farming)
# Goal: Construct a complete end-to-end pipeline: sow, water, monitor, and harvest 14 mature crops.
#
# Available commands:
#   fly_to(x, y), plant(x, y, c), water(x, y), harvest(x, y), get_tile(x, y)

# TODO: Implement your full autonomous farming loop to harvest 14 crops

`,
    solutionHint: 'Plant 14+ crops, water all of them thoroughly, loop checking growth, then harvest all.',
  },
  {
    id: 'chal-17',
    level: 17,
    difficulty: 'hard',
    topic: 'farming',
    title: 'Level 17: Quadcopter Agro-Swarm Patrol',
    description: 'Patrol 15 farm plots, clear all weeds, and apply fertilizer so every plot achieves nutrients >= 65% with zero weeds.',
    points: 450,
    targetCount: 15,
    timeLimitSeconds: 210,
    testCriterion: 'water_efficiency',
    starterCode: `# Level 17: Quadcopter Agro-Swarm Patrol (Hard - Farming)
# Goal: Patrol 15 plots, eliminating weeds and boosting soil nutrients >= 65%.
#
# Available commands:
#   fly_to(x, y), clear_weeds(x, y), fertilize(x, y)

# TODO: Write a high-efficiency traversal routine to optimize 15 plots

`,
    solutionHint: 'Traverse 15 tiles, clearing weeds and applying fertilizer on each to push nutrients >= 65%.',
  },
  {
    id: 'chal-18',
    level: 18,
    difficulty: 'hard',
    topic: 'farming',
    title: 'Level 18: Grand Championship Speed Run',
    description: 'Plant and harvest as many crops as possible within 90 seconds using high-speed drone automation! Reach 20 actions.',
    points: 500,
    targetCount: 20,
    timeLimitSeconds: 90,
    testCriterion: 'speed_run',
    starterCode: `# Level 18: Grand Championship Speed Run (Hard - Farming)
# Goal: Plant, water, and harvest as many crops as possible in minimum time! Reach 20 actions.
#
# Available commands:
#   fly_to(x, y), plant(x, y, crop), water(x, y), harvest(x, y)

# TODO: Implement your high-speed automation pipeline

`,
    solutionHint: 'Speed up execution by planting fast-growing crops with immediate watering and rapid harvesting.',
  },
  {
    id: 'chal-19',
    level: 19,
    difficulty: 'hard',
    topic: 'farming',
    title: 'Level 19: High-Yield Mega Harvest',
    description: 'Demonstrate supreme mastery of autonomous agriculture by harvesting at least 20 mature crops into your storage silo.',
    points: 600,
    targetCount: 20,
    timeLimitSeconds: 240,
    testCriterion: 'harvest_count',
    starterCode: `# Level 19: High-Yield Mega Harvest (Hard - Farming)
# Goal: Orchestrate large-scale continuous farming to harvest at least 20 mature crops.
#
# Available commands:
#   fly_to(x, y), plant(x, y, crop), water(x, y), harvest(x, y), get_tile(x, y)

# TODO: Implement a large-scale agricultural cycle to harvest 20 crops

`,
    solutionHint: 'Plant across 20+ plots in batches, keep moisture high, and loop harvest on mature crops.',
  },
  {
    id: 'chal-20',
    level: 20,
    difficulty: 'hard',
    topic: 'leetcode',
    title: 'Level 20: LeetCode #42 - Trapping Rain Water',
    description: 'Given n non-negative integers representing an elevation map of irrigation dikes where width of each bar is 1, compute how much rainwater it can trap.',
    points: 480,
    targetCount: 1,
    timeLimitSeconds: 210,
    testCriterion: 'leetcode_test',
    functionName: 'trap',
    testCases: [
      { input: [[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]], expected: 6, description: 'Elevation map traps 6 units of water' },
      { input: [[4, 2, 0, 3, 2, 5]], expected: 9, description: 'Elevation map traps 9 units of water' },
      { input: [[1, 2, 3, 4]], expected: 0, description: 'Monotonic slope traps 0 water' },
    ],
    starterCode: `# Level 20: LeetCode #42 - Trapping Rain Water (Hard)
#
# Problem:
#   Given n non-negative integers representing an elevation map of dikes,
#   compute how much water it can trap after rain.
#
# Examples:
#   trap([0,1,0,2,1,0,1,3,2,1,2,1]) -> 6
#   trap([4,2,0,3,2,5])             -> 9

def trap(height):
    # TODO: Implement two-pointer or DP rainwater trapping
    pass

`,
    solutionHint: 'Use two pointers: left = 0, right = len(height) - 1. Track left_max and right_max, adding trapped water at the lower pointer.',
  },
  {
    id: 'chal-21',
    level: 21,
    difficulty: 'hard',
    topic: 'leetcode',
    title: 'Level 21: LeetCode #1091 - Drone Shortest Path in Binary Grid',
    description: 'Given an n x n binary grid (0 = clear plot, 1 = canal barrier), return the length of the shortest clear path from (0, 0) to (n-1, n-1) using 8-directional BFS.',
    points: 550,
    targetCount: 1,
    timeLimitSeconds: 240,
    testCriterion: 'leetcode_test',
    functionName: 'shortest_path_binary_matrix',
    testCases: [
      { input: [[[0, 0, 0], [1, 1, 0], [1, 1, 0]]], expected: 4, description: 'Shortest path is 4 steps' },
      { input: [[[0, 1], [1, 0]]], expected: 2, description: 'Diagonal step from (0,0) to (1,1) is 2' },
      { input: [[[1, 0, 0], [1, 1, 0], [1, 1, 0]]], expected: -1, description: 'Blocked start (0,0) returns -1' },
    ],
    starterCode: `# Level 21: LeetCode #1091 - Shortest Path in Binary Matrix (Hard)
#
# Problem:
#   Given an n x n binary grid 'grid' (0 = clear, 1 = obstacle),
#   return the length of the shortest clear path from top-left (0, 0)
#   to bottom-right (n-1, n-1) moving in any of 8 directions.
#   If no path exists, return -1.
#
# Examples:
#   shortest_path_binary_matrix([[0,0,0],[1,1,0],[1,1,0]]) -> 4
#   shortest_path_binary_matrix([[0,1],[1,0]])             -> 2

def shortest_path_binary_matrix(grid):
    # TODO: Implement BFS queue algorithm
    pass

`,
    solutionHint: 'If grid[0][0] != 0 or grid[n-1][n-1] != 0: return -1. Use a queue initialized with [(0, 0, 1)]. Explore 8 directions (dx, dy).',
  },
  {
    id: 'chal-22',
    level: 22,
    difficulty: 'hard',
    topic: 'leetcode',
    title: 'Level 22: LeetCode #48 - Rotate 90° Matrix Transpose',
    description: 'Given an n x n 2D matrix representing crop coordinate plots, rotate the matrix by 90 degrees clockwise and return the rotated matrix.',
    points: 520,
    targetCount: 1,
    timeLimitSeconds: 210,
    testCriterion: 'leetcode_test',
    functionName: 'rotate_matrix',
    testCases: [
      {
        input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]],
        expected: [[7, 4, 1], [8, 5, 2], [9, 6, 3]],
        description: 'Rotate 3x3 matrix 90 degrees clockwise',
      },
      {
        input: [[[1, 2], [3, 4]]],
        expected: [[3, 1], [4, 2]],
        description: 'Rotate 2x2 matrix 90 degrees clockwise',
      },
    ],
    starterCode: `# Level 22: LeetCode #48 - Rotate 90° Matrix (Hard)
#
# Problem:
#   Given an n x n 2D matrix, rotate the matrix by 90 degrees clockwise.
#   Return the new rotated matrix.
#
# Example:
#   rotate_matrix([[1,2,3],[4,5,6],[7,8,9]]) -> [[7,4,1],[8,5,2],[9,6,3]]

def rotate_matrix(matrix):
    # TODO: Implement 90-degree matrix rotation
    pass

`,
    solutionHint: 'Transposing the matrix (swap matrix[i][j] and matrix[j][i]) followed by reversing each row produces a 90-degree clockwise rotation.',
  },
];
