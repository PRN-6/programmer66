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
];

