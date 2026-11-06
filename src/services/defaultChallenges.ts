import { Challenge } from '../types/competition';

export const DEFAULT_CHALLENGES: Challenge[] = [
  // ==========================================
  // EASY TIER (Levels 1 - 4)
  // ==========================================
  {
    id: 'chal-1',
    level: 1,
    difficulty: 'easy',
    title: 'Level 1: Automated Seed Sower',
    description: 'Use a loop to fly the drone across the farm and plant at least 12 Carrot seeds.',
    points: 100,
    targetCrop: 'carrot',
    targetCount: 12,
    timeLimitSeconds: 120,
    testCriterion: 'planted_count',
    starterCode: `# Level 1: Automated Seed Sower (Easy)
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
    title: 'Level 2: Golden Wheat Fields',
    description: 'Traverse a 4x4 coordinate zone to plant at least 16 Wheat seeds and build a golden crop field.',
    points: 120,
    targetCrop: 'wheat',
    targetCount: 16,
    timeLimitSeconds: 120,
    testCriterion: 'planted_count',
    starterCode: `# Level 2: Golden Wheat Fields (Easy)
# Goal: Traverse farm plots and plant at least 16 Wheat seeds.
#
# Available commands:
#   fly_to(x, y)         - Moves the drone to coordinates (x, y)
#   plant(x, y, "wheat") - Plants a wheat seed at (x, y)
#   get_tile(x, y)       - Returns tile state dict

# TODO: Write your loop to cover at least 16 plots with wheat

`,
    solutionHint: 'Use nested loops x in range(4) and y in range(4) calling fly_to(x, y) and plant(x, y, "wheat").',
  },
  {
    id: 'chal-3',
    level: 3,
    difficulty: 'easy',
    title: 'Level 3: Quick Hydration Mist',
    description: 'Spray irrigation hydration mist across at least 8 soil plots until moisture reaches optimal 60%+.',
    points: 130,
    targetCount: 8,
    timeLimitSeconds: 150,
    testCriterion: 'water_efficiency',
    starterCode: `# Level 3: Quick Hydration Mist (Easy)
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
    title: 'Level 4: Organic Weed Cleansing',
    description: 'Clear invasive weeds and fertilize at least 6 plots to boost nutrients to >= 65%.',
    points: 140,
    targetCount: 6,
    timeLimitSeconds: 150,
    testCriterion: 'water_efficiency',
    starterCode: `# Level 4: Organic Weed Cleansing (Easy)
# Goal: Clear weeds and apply organic fertilizer on at least 6 plots.
#
# Available commands:
#   fly_to(x, y)        - Move drone to (x, y)
#   clear_weeds(x, y)   - Remove weeds on plot
#   fertilize(x, y)     - Enrich soil nutrients
#   get_tile(x, y)      - Check tile info: tile["nutrients"], tile["weedLevel"]

# TODO: Write your automation routine to clear and fertilize 6 plots

`,
    solutionHint: 'Call clear_weeds(x, y) followed by fertilize(x, y) across 6 plots.',
  },

  // ==========================================
  // MEDIUM TIER (Levels 5 - 8)
  // ==========================================
  {
    id: 'chal-5',
    level: 5,
    difficulty: 'medium',
    title: 'Level 5: Smart Irrigation Engineer',
    description: 'Fly across your soil beds and water 14 plots so their moisture reaches optimal levels (>=60%).',
    points: 200,
    targetCount: 14,
    timeLimitSeconds: 180,
    testCriterion: 'water_efficiency',
    starterCode: `# Level 5: Smart Irrigation Engineer (Medium)
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
    id: 'chal-6',
    level: 6,
    difficulty: 'medium',
    title: 'Level 6: Bountiful Autumn Harvest',
    description: 'Plant and nurture crops to maturity (growth >= 100), then harvest at least 8 crops into your inventory.',
    points: 250,
    targetCount: 8,
    timeLimitSeconds: 180,
    testCriterion: 'harvest_count',
    starterCode: `# Level 6: Bountiful Autumn Harvest (Medium)
# Goal: Plant, nurture, and harvest at least 8 mature crops.
#
# Available commands:
#   fly_to(x, y)   - Move drone to (x, y)
#   plant(x, y, c) - Plant crop ("carrot", "wheat", etc.)
#   water(x, y)    - Water soil to accelerate growth
#   harvest(x, y)  - Harvest fully grown crop
#   get_tile(x, y) - Returns {"crop": str, "growth": int}

# TODO: Plant crops, nurture them, and harvest when ripe

`,
    solutionHint: 'Plant fast crops like carrots or wheat, water them, and harvest once growth reaches 100.',
  },
  {
    id: 'chal-7',
    level: 7,
    difficulty: 'medium',
    title: 'Level 7: Soil Nutrition Master',
    description: 'Clear weeds and apply fertilizer across at least 10 farm plots to optimize soil nutrients (>=65%).',
    points: 280,
    targetCount: 10,
    timeLimitSeconds: 180,
    testCriterion: 'water_efficiency',
    starterCode: `# Level 7: Soil Nutrition Master (Medium)
# Goal: Clear weeds and enrich soil nutrients to >= 65% on at least 10 plots.
#
# Available commands:
#   fly_to(x, y)      - Move drone to (x, y)
#   clear_weeds(x, y) - Remove weeds on plot
#   fertilize(x, y)   - Enrich soil nutrients
#   get_tile(x, y)    - Check tile info

# TODO: Clean and fertilize 10 plots to maximize soil health

`,
    solutionHint: 'Iterate over 10 plots calling clear_weeds(x, y) and fertilize(x, y).',
  },
  {
    id: 'chal-8',
    level: 8,
    difficulty: 'medium',
    title: 'Level 8: Crop Rotation Duo',
    description: 'Plant at least 18 plots with crops, alternating between different crop species to maintain biodiversity.',
    points: 300,
    targetCount: 18,
    timeLimitSeconds: 180,
    testCriterion: 'planted_count',
    starterCode: `# Level 8: Crop Rotation Duo (Medium)
# Goal: Plant at least 18 plots alternating between different crop types (e.g. carrot, wheat, tomato).
#
# Available commands:
#   fly_to(x, y)          - Move drone to (x, y)
#   plant(x, y, crop_id)  - Plant specified crop ("carrot", "wheat", "corn", "tomato")
#   get_tile(x, y)        - Returns current tile state

# TODO: Implement alternating crop distribution across 18 plots

`,
    solutionHint: 'Use modulo on loop index to alternate planting "carrot" and "wheat" across 18 plots.',
  },

  // ==========================================
  // HARD TIER (Levels 9 - 12)
  // ==========================================
  {
    id: 'chal-9',
    level: 9,
    difficulty: 'hard',
    title: 'Level 9: Full Lifecycle Farm Pipeline',
    description: 'Automate a full agricultural pipeline: sow seeds, water plots, monitor growth, and harvest at least 14 mature crops.',
    points: 400,
    targetCount: 14,
    timeLimitSeconds: 210,
    testCriterion: 'harvest_count',
    starterCode: `# Level 9: Full Lifecycle Farm Pipeline (Hard)
# Goal: Construct a complete end-to-end pipeline: sow, water, monitor, and harvest 14 mature crops.
#
# Available commands:
#   fly_to(x, y)   - Move drone to (x, y)
#   plant(x, y, c) - Plant seed ("carrot", "wheat")
#   water(x, y)    - Hydrate plot
#   harvest(x, y)  - Harvest ripe crop
#   get_tile(x, y) - Returns tile state: growth, moisture, crop

# TODO: Implement your full autonomous farming loop to harvest 14 crops

`,
    solutionHint: 'Plant 14+ crops, water all of them thoroughly, loop checking growth, then harvest all.',
  },
  {
    id: 'chal-10',
    level: 10,
    difficulty: 'hard',
    title: 'Level 10: Quadcopter Agro-Swarm Patrol',
    description: 'Patrol 15 farm plots, clear all weeds, and apply fertilizer so every plot achieves nutrients >= 65% with zero weeds.',
    points: 450,
    targetCount: 15,
    timeLimitSeconds: 210,
    testCriterion: 'water_efficiency',
    starterCode: `# Level 10: Quadcopter Agro-Swarm Patrol (Hard)
# Goal: Patrol 15 plots, eliminating weeds and boosting soil nutrients >= 65%.
#
# Available commands:
#   fly_to(x, y)        - Move drone to (x, y)
#   clear_weeds(x, y)   - Remove weeds
#   fertilize(x, y)     - Enrich soil nutrients
#   get_tile(x, y)      - Check tile info: tile["nutrients"], tile["weedLevel"]

# TODO: Write a high-efficiency traversal routine to optimize 15 plots

`,
    solutionHint: 'Traverse 15 tiles, clearing weeds and applying fertilizer on each to push nutrients >= 65%.',
  },
  {
    id: 'chal-11',
    level: 11,
    difficulty: 'hard',
    title: 'Level 11: Grand Championship Speed Run',
    description: 'Plant and harvest as many crops as possible within 90 seconds using high-speed drone automation! Reach 20 actions.',
    points: 500,
    targetCount: 20,
    timeLimitSeconds: 90,
    testCriterion: 'speed_run',
    starterCode: `# Level 11: Grand Championship Speed Run (Hard)
# Goal: Plant, water, and harvest as many crops as possible in minimum time! Reach 20 actions.
#
# Available commands:
#   fly_to(x, y), plant(x, y, crop), water(x, y), harvest(x, y)

# TODO: Implement your high-speed automation pipeline

`,
    solutionHint: 'Speed up execution by planting fast-growing crops with immediate watering and rapid harvesting.',
  },
  {
    id: 'chal-12',
    level: 12,
    difficulty: 'hard',
    title: 'Level 12: High-Yield Mega Harvest',
    description: 'Demonstrate supreme mastery of autonomous agriculture by harvesting at least 20 mature crops into your storage silo.',
    points: 600,
    targetCount: 20,
    timeLimitSeconds: 240,
    testCriterion: 'harvest_count',
    starterCode: `# Level 12: High-Yield Mega Harvest (Hard)
# Goal: Orchestrate large-scale continuous farming to harvest at least 20 mature crops.
#
# Available commands:
#   fly_to(x, y), plant(x, y, crop), water(x, y), harvest(x, y), get_tile(x, y)

# TODO: Implement a large-scale agricultural cycle to harvest 20 crops

`,
    solutionHint: 'Plant across 20+ plots in batches, keep moisture high, and loop harvest on mature crops.',
  },
];
