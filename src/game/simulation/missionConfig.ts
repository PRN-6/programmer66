import { Mission } from '../../types/game';

export const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'mission_01',
    title: 'MISSION 01: First Seeds',
    stage: 1,
    stageName: 'Stage 1: Beginner Farmer',
    description: 'Welcome to programmer66! Begin by planting 5 wheat seeds manually or via script. Ensure your farm takes its first breath.',
    objectives: [
      {
        id: 'plant_wheat_5',
        description: 'Plant 5 wheat seeds in the soil',
        target: 5,
        current: 0,
        completed: false,
      },
    ],
    starterCode: `# MISSION 01: Plant 5 Wheat Crops
# Use farm.get_tile(x, y) to inspect and plant

print("Starting planting routine...")
for x in range(5):
    tile = farm.get_tile(x, 0)
    if tile.is_empty():
        tile.plant("wheat")
print("Planting complete!")
`,
    hints: [
      'You can click any soil tile on the 3D grid to plant seeds manually, or use the Python script to automate it.',
      'Check your seed count in the inventory to make sure you have enough wheat seeds.',
      'The starter script uses a simple range loop to plant along row 0.',
    ],
    rewardMoney: 50,
    rewardXp: 50,
    completed: false,
  },
  {
    id: 'mission_02',
    title: 'MISSION 02: Quench the Thirst',
    stage: 2,
    stageName: 'Stage 2: Automation Beginner',
    description: 'Dry soil stunts crop growth. Write a program or send your robot to water at least 5 dry tiles.',
    objectives: [
      {
        id: 'water_tiles_5',
        description: 'Water 5 dry soil tiles',
        target: 5,
        current: 0,
        completed: false,
      },
    ],
    starterCode: `# MISSION 02: Water Dry Soil
# Loop through tiles and water any tile that needs water

tiles = farm.get_tiles()
print("Scanning soil moisture...")

for tile in tiles:
    if tile.needs_water():
        tile.water()

print("All scanned tiles watered!")
`,
    hints: [
      'Each tile has moisture between 0% and 100%.',
      'tile.needs_water() returns True when moisture is under 35%.',
      'During sunny days or heatwaves, soil dries faster.',
    ],
    rewardMoney: 80,
    rewardXp: 80,
    completed: false,
  },
  {
    id: 'mission_03',
    title: 'MISSION 03: The Golden Harvest',
    stage: 3,
    stageName: 'Stage 3: Automation Engineer',
    description: 'Harvest 5 fully mature crops to collect valuable produce and sell them in the marketplace.',
    objectives: [
      {
        id: 'harvest_crops_5',
        description: 'Harvest 5 mature crops',
        target: 5,
        current: 0,
        completed: false,
      },
    ],
    starterCode: `# MISSION 03: Harvest Ready Crops
# Inspect every tile; if mature, harvest it!

for tile in farm.get_tiles():
    if tile.is_ready():
        tile.harvest()
`,
    hints: [
      'Crops visibly mature through 4 growth stages.',
      'tile.is_ready() checks if the crop has reached the mature stage.',
      'Harvested produce goes straight to your inventory to be sold for profit.',
    ],
    rewardMoney: 120,
    rewardXp: 120,
    completed: false,
  },
  {
    id: 'mission_04',
    title: 'MISSION 04: Full Autonomous Loop',
    stage: 4,
    stageName: 'Stage 4: Farm Manager',
    description: 'Create a reusable function that scans an entire field: planting empty tiles, watering dry soil, and harvesting ready crops in one program.',
    objectives: [
      {
        id: 'total_harvest_15',
        description: 'Harvest 15 crops across multiple cycles',
        target: 15,
        current: 0,
        completed: false,
      },
      {
        id: 'total_planted_15',
        description: 'Plant 15 crops',
        target: 15,
        current: 0,
        completed: false,
      },
    ],
    starterCode: `# MISSION 04: Intelligent Field Manager
# Define an automated function to service the whole farm

def manage_farm():
    print("Beginning farm maintenance cycle...")
    for tile in farm.get_tiles():
        if tile.is_ready():
            tile.harvest()
        if tile.is_empty():
            tile.plant("carrot")
        if tile.needs_water():
            tile.water()
    print("Cycle complete.")

# Run the routine
manage_farm()
`,
    hints: [
      'Carrots sell for more than wheat and grow fast in moist soil.',
      'You can buy more carrot seeds from the Marketplace.',
    ],
    rewardMoney: 250,
    rewardXp: 200,
    completed: false,
  },
  {
    id: 'mission_05',
    title: 'MISSION 05: Robot Navigation Mastery',
    stage: 5,
    stageName: 'Stage 5: Agricultural Engineer',
    description: 'Command your autonomous robot Rusty-01 to physically travel across the grid, watering and harvesting with maximum efficiency.',
    objectives: [
      {
        id: 'robot_actions_20',
        description: 'Perform 20 robot automated actions',
        target: 20,
        current: 0,
        completed: false,
      },
    ],
    starterCode: `# MISSION 05: Robot Physical Automation
# Move robot to each tile and perform operations

for y in range(4):
    for x in range(4):
        robot.move_to(x, y)
        tile = farm.get_tile(x, y)
        if tile.is_empty():
            robot.plant("corn")
        if tile.needs_water():
            robot.water()
        if tile.is_ready():
            robot.harvest()
`,
    hints: [
      'robot.move_to(x, y) commands the physical 3D robot to navigate across the terrain.',
      'robot.water() and robot.harvest() trigger mechanical animations and sound effects.',
    ],
    rewardMoney: 400,
    rewardXp: 350,
    completed: false,
  },
  {
    id: 'mission_06',
    title: 'MISSION 06: Grand Agricultural Empire',
    stage: 6,
    stageName: 'Stage 6: Intelligent Farming',
    description: 'Accumulate $1000 and harvest 50 crops to prove yourself as a master automated agricultural engineer!',
    objectives: [
      {
        id: 'money_1000',
        description: 'Earn a balance of $1,000',
        target: 1000,
        current: 0,
        completed: false,
      },
      {
        id: 'total_harvest_50',
        description: 'Harvest 50 total crops',
        target: 50,
        current: 0,
        completed: false,
      },
    ],
    starterCode: `# MISSION 06: Continuous High-Yield System
# Build your infinite automated loop!

for cycle in range(5):
    print("Cycle", cycle + 1, "starting...")
    for tile in farm.get_tiles():
        if tile.is_ready():
            tile.harvest()
        if tile.is_empty():
            tile.plant("tomato")
        if tile.needs_water():
            tile.water()
    sleep(2)
`,
    hints: [
      'Tomatoes have the highest profit margin of all starter crops ($42 each).',
      'Fertilizing tiles dramatically speeds up crop growth rates.',
    ],
    rewardMoney: 1000,
    rewardXp: 1000,
    completed: false,
  },
  {
    id: 'mission_07',
    title: 'MISSION 07: Systematic Crop Rotation',
    stage: 7,
    stageName: 'Stage 7: Crop Scientist (Hard)',
    description: 'Scale your production to industrial levels. Harvest 75 total crops and maintain steady soil hydration with 30 watered plots.',
    objectives: [
      {
        id: 'total_harvest_75',
        description: 'Harvest 75 total crops across all plots',
        target: 75,
        current: 0,
        completed: false,
      },
      {
        id: 'water_tiles_30',
        description: 'Water 30 soil plots to maintain growth velocity',
        target: 30,
        current: 0,
        completed: false,
      },
    ],
    starterCode: `# MISSION 07: Systematic Crop Rotation
# Monitor soil and execute high-throughput crop cycles

def rotate_crops():
    print("Initiating industrial cultivation loop...")
    for tile in farm.get_tiles():
        if tile.is_ready():
            tile.harvest()
        if tile.is_empty():
            tile.plant("corn")
        if tile.needs_water():
            tile.water()

for round in range(3):
    rotate_crops()
print("Rotation cycle completed successfully!")
`,
    hints: [
      'Corn grows tall and yields hearty rewards for mid-tier farmers.',
      'Combine harvesting and planting in a single loop pass for maximum efficiency.',
    ],
    rewardMoney: 1500,
    rewardXp: 1200,
    completed: false,
  },
  {
    id: 'mission_08',
    title: 'MISSION 08: High-Density Drone Fleet',
    stage: 8,
    stageName: 'Stage 8: Fleet Commander (Hard)',
    description: 'Maximize physical drone automation. Dispatch Rusty-01 across every sector of the farm to execute 60 automated robot operations and plant 50 crops.',
    objectives: [
      {
        id: 'robot_actions_60',
        description: 'Execute 60 robot automated operations',
        target: 60,
        current: 0,
        completed: false,
      },
      {
        id: 'total_planted_50',
        description: 'Plant 50 total crops on your agricultural field',
        target: 50,
        current: 0,
        completed: false,
      },
    ],
    starterCode: `# MISSION 08: High-Density Drone Fleet
# Navigate the 3D drone to automate each coordinate

for y in range(4):
    for x in range(4):
        robot.move_to(x, y)
        tile = farm.get_tile(x, y)
        if tile.is_empty():
            robot.plant("carrot")
        if tile.needs_water():
            robot.water()
        if tile.is_ready():
            robot.harvest()

print("Drone fleet patrol completed!")
`,
    hints: [
      'robot.move_to(x, y) navigates the drone physically to each tile position.',
      'Using double loops over x and y coordinates ensures 100% coverage.',
    ],
    rewardMoney: 2200,
    rewardXp: 1800,
    completed: false,
  },
  {
    id: 'mission_09',
    title: 'MISSION 09: Agronomic Treasury Mogul',
    stage: 9,
    stageName: 'Stage 9: Enterprise Mogul (Hard)',
    description: 'Expand your farming economy. Amass a cash treasury of $3,000 and achieve 100 total harvests to dominate the global agricultural markets.',
    objectives: [
      {
        id: 'money_3000',
        description: 'Amass a treasury balance of $3,000',
        target: 3000,
        current: 0,
        completed: false,
      },
      {
        id: 'total_harvest_100',
        description: 'Harvest 100 total crops across farming cycles',
        target: 100,
        current: 0,
        completed: false,
      },
    ],
    starterCode: `# MISSION 09: Agronomic Treasury Mogul
# Plant premium cash crops (tomatoes & carrots) to maximize profit

for tile in farm.get_tiles():
    if tile.is_ready():
        tile.harvest()
    if tile.is_empty():
        # Tomatoes yield high market sell value
        tile.plant("tomato")
    if tile.needs_water():
        tile.water()

print("High-yield cycle complete. Check treasury balance!")
`,
    hints: [
      'Selling produce at the Market turns harvested crops into cold hard cash.',
      'Higher level crops yield substantial profit margins per tile.',
    ],
    rewardMoney: 3000,
    rewardXp: 2500,
    completed: false,
  },
  {
    id: 'mission_10',
    title: 'MISSION 10: Matrix Spiral Traversal (LeetCode 54)',
    stage: 10,
    stageName: 'Stage 10: Algorithmic Architect (LeetCode)',
    description: 'Program your robot to traverse the 4x4 farm matrix in clockwise spiral order (top row, right column, bottom row, left column, inward layer) to cultivate every plot sequentially.',
    objectives: [
      {
        id: 'robot_actions_100',
        description: 'Execute 100 robot automated operations',
        target: 100,
        current: 0,
        completed: false,
      },
      {
        id: 'total_planted_75',
        description: 'Plant 75 total crops via automated routines',
        target: 75,
        current: 0,
        completed: false,
      },
    ],
    starterCode: `# MISSION 10: Matrix Spiral Traversal (LeetCode 54)
# Traverse farm grid in clockwise spiral order

def spiral_service(width=4, height=4):
    top, bottom = 0, height - 1
    left, right = 0, width - 1

    while top <= bottom and left <= right:
        # 1. Traverse Right across Top
        for x in range(left, right + 1):
            robot.move_to(x, top)
            tile = farm.get_tile(x, top)
            if tile.is_empty(): robot.plant("wheat")
            if tile.needs_water(): robot.water()
            if tile.is_ready(): robot.harvest()
        top += 1

        # 2. Traverse Down across Right
        for y in range(top, bottom + 1):
            robot.move_to(right, y)
            tile = farm.get_tile(right, y)
            if tile.is_empty(): robot.plant("wheat")
            if tile.needs_water(): robot.water()
            if tile.is_ready(): robot.harvest()
        right -= 1

        # 3. Traverse Left across Bottom
        if top <= bottom:
            for x in range(right, left - 1, -1):
                robot.move_to(x, bottom)
                tile = farm.get_tile(x, bottom)
                if tile.is_empty(): robot.plant("wheat")
                if tile.needs_water(): robot.water()
                if tile.is_ready(): robot.harvest()
            bottom -= 1

        # 4. Traverse Up across Left
        if left <= right:
            for y in range(bottom, top - 1, -1):
                robot.move_to(left, y)
                tile = farm.get_tile(left, y)
                if tile.is_empty(): robot.plant("wheat")
                if tile.needs_water(): robot.water()
                if tile.is_ready(): robot.harvest()
            left += 1

spiral_service(4, 4)
print("Spiral traversal loop complete!")
`,
    hints: [
      'Shrink top, bottom, left, and right bounds after completing each direction.',
      'Check boundary conditions (top <= bottom and left <= right) before moving backwards.',
    ],
    rewardMoney: 4500,
    rewardXp: 3500,
    completed: false,
  },
  {
    id: 'mission_11',
    title: 'MISSION 11: BFS Flood Fill Hydration (LeetCode 733)',
    stage: 11,
    stageName: 'Stage 11: Grid Optimizer (LeetCode)',
    description: 'Write a breadth-first search (BFS) queue exploration routine that identifies dry plots and irrigates connected clusters until 60 waterings and 150 harvests are attained.',
    objectives: [
      {
        id: 'water_tiles_60',
        description: 'Water 60 dry soil tiles across field scans',
        target: 60,
        current: 0,
        completed: false,
      },
      {
        id: 'total_harvest_150',
        description: 'Harvest 150 total crops',
        target: 150,
        current: 0,
        completed: false,
      },
    ],
    starterCode: `# MISSION 11: BFS Flood Fill Hydration (LeetCode 733)
# Water dry soil using Breadth-First Search queue exploration

visited = set()
queue = [(0, 0)]

while len(queue) > 0:
    x, y = queue.pop(0)
    if (x, y) in visited:
        continue
    visited.add((x, y))

    tile = farm.get_tile(x, y)
    if tile.needs_water():
        tile.water()
    if tile.is_ready():
        tile.harvest()

    # Explore 4-directional neighbors
    for dx, dy in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
        nx, ny = x + dx, y + dy
        if 0 <= nx < 4 and 0 <= ny < 4 and (nx, ny) not in visited:
            queue.append((nx, ny))

print("BFS Irrigation scan completed!")
`,
    hints: [
      'A visited set prevents re-visiting the same grid cell.',
      'BFS spreads outward in concentric diamond waves, ideal for cluster irrigation.',
    ],
    rewardMoney: 6000,
    rewardXp: 4500,
    completed: false,
  },
  {
    id: 'mission_12',
    title: 'MISSION 12: Autonomous Agricultural Singularity',
    stage: 12,
    stageName: 'Stage 12: Autonomous Singularity (Master)',
    description: 'The pinnacle of programmer66! Achieve complete autonomous singularity: amass $10,000 treasury, harvest 200 crops, and execute 150 robot operations.',
    objectives: [
      {
        id: 'money_10000',
        description: 'Amass $10,000 treasury balance',
        target: 10000,
        current: 0,
        completed: false,
      },
      {
        id: 'total_harvest_200',
        description: 'Harvest 200 total crops across all sectors',
        target: 200,
        current: 0,
        completed: false,
      },
      {
        id: 'robot_actions_150',
        description: 'Execute 150 robot automated actions',
        target: 150,
        current: 0,
        completed: false,
      },
    ],
    starterCode: `# MISSION 12: Autonomous Agricultural Singularity
# Continuous master loop executing full automation

print("Engaging Agricultural Singularity Protocol...")
for cycle in range(5):
    for tile in farm.get_tiles():
        if tile.is_ready():
            tile.harvest()
        if tile.is_empty():
            tile.plant("tomato")
        if tile.needs_water():
            tile.water()

print("Singularity cycle complete. Maximum efficiency achieved!")
`,
    hints: [
      'Reach the maximum rank of Autonomous Singularity Agronomist on the World Leaderboard!',
      'All automated routines can be composed into multi-stage functions.',
    ],
    rewardMoney: 10000,
    rewardXp: 8000,
    completed: false,
  },
];

