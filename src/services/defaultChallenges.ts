import { Challenge } from '../types/competition';

export const DEFAULT_CHALLENGES: Challenge[] = [
  {
    id: 'chal-1',
    level: 1,
    title: 'Level 1: Automated Seed Sower',
    description: 'Use a loop to fly the drone across the farm and plant at least 12 Carrot seeds.',
    points: 100,
    targetCrop: 'carrot',
    targetCount: 12,
    timeLimitSeconds: 120,
    testCriterion: 'planted_count',
    starterCode: `# Level 1: Automated Seed Sower
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
    title: 'Level 2: Smart Irrigation Engineer',
    description: 'Fly across your soil beds and water 8 plots so their moisture reaches optimal levels (>=60%).',
    points: 150,
    targetCount: 8,
    timeLimitSeconds: 150,
    testCriterion: 'water_efficiency',
    starterCode: `# Level 2: Smart Irrigation Engineer
# Goal: Inspect plots and water at least 8 dry beds to optimal moisture (>=60%).
#
# Available commands:
#   fly_to(x, y)   - Move drone to (x, y)
#   water(x, y)    - Spray hydration mist on soil
#   get_tile(x, y) - Check tile info: tile["moisture"]

# TODO: Write your code below to inspect and water 8 plots

`,
    solutionHint: 'Use get_tile(x, y) to check moisture and water if it is below 80.',
  },
  {
    id: 'chal-3',
    level: 3,
    title: 'Level 3: Bountiful Autumn Harvest',
    description: 'Automate the quadcopter drone to locate ripe crops (growth >= 100) and harvest at least 10 crops into your inventory.',
    points: 250,
    targetCount: 10,
    timeLimitSeconds: 180,
    testCriterion: 'harvest_count',
    starterCode: `# Level 3: Bountiful Autumn Harvest
# Goal: Locate mature crops (growth >= 100) and harvest at least 10 crops.
#
# Available commands:
#   fly_to(x, y)   - Move drone to (x, y)
#   harvest(x, y)  - Harvest fully grown crop
#   get_tile(x, y) - Returns {"crop": str, "growth": int}

# TODO: Write your code below to scan and harvest 10 ripe crops

`,
    solutionHint: 'Check tile["growth"] >= 100 before calling harvest(x, y).',
  },
  {
    id: 'chal-4',
    level: 4,
    title: 'Level 4: Soil Nutrition Master',
    description: 'Clear weeds and apply fertilizer on 6 farm plots to maximize crop yield speed.',
    points: 300,
    targetCount: 6,
    timeLimitSeconds: 150,
    testCriterion: 'water_efficiency',
    starterCode: `# Level 4: Soil Nutrition Master
# Goal: Clear weeds and apply fertilizer on at least 6 farm plots.
#
# Available commands:
#   fly_to(x, y)        - Move drone to (x, y)
#   clear_weeds(x, y)   - Remove weeds on plot
#   fertilize(x, y)     - Enrich soil nutrients
#   get_tile(x, y)      - Check tile info

# TODO: Write your code below to fertilize and clear 6 plots

`,
    solutionHint: 'Call clear_weeds(x, y) followed by fertilize(x, y) across 6 plots.',
  },
  {
    id: 'chal-5',
    level: 5,
    title: 'Level 5: Grand Championship Speed Run',
    description: 'Plant and harvest as many crops as possible within 90 seconds using full quadcopter automation!',
    points: 500,
    targetCount: 16,
    timeLimitSeconds: 90,
    testCriterion: 'speed_run',
    starterCode: `# Level 5: Grand Championship Speed Run
# Goal: Plant, water, and harvest as many crops as possible in minimum time!
#
# Available commands:
#   fly_to(x, y), plant(x, y, crop), water(x, y), harvest(x, y)

# TODO: Implement your high-speed automation pipeline

`,
    solutionHint: 'Speed up execution by planting fast-growing crops with immediate watering.',
  },
];
