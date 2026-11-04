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
# Goal: Plant 12 carrots using a loop

for y in range(0, 3):
    for x in range(0, 4):
        fly_to(x, y)
        plant(x, y, "carrot")
`,
    solutionHint: 'Use nested loops for x in range(0, 4) and y in range(0, 3) with fly_to(x, y) and plant(x, y, "carrot").',
  },
  {
    id: 'chal-2',
    level: 2,
    title: 'Level 2: Smart Irrigation Engineer',
    description: 'Fly across your soil beds and water 8 plots so their moisture reaches optimal levels.',
    points: 150,
    targetCount: 8,
    timeLimitSeconds: 150,
    testCriterion: 'water_efficiency',
    starterCode: `# Level 2: Smart Irrigation Engineer
# Goal: Inspect tiles and water 8 plots

for x in range(0, 4):
    for y in range(0, 2):
        fly_to(x, y)
        tile = get_tile(x, y)
        if tile and tile["moisture"] < 80:
            water(x, y)
`,
    solutionHint: 'Use get_tile(x, y) to check moisture and water if it is below 80.',
  },
  {
    id: 'chal-3',
    level: 3,
    title: 'Level 3: Bountiful Autumn Harvest',
    description: 'Automate the quadcopter drone to locate ripe crops and harvest at least 10 crops into your inventory.',
    points: 250,
    targetCount: 10,
    timeLimitSeconds: 180,
    testCriterion: 'harvest_count',
    starterCode: `# Level 3: Autumn Harvest
# Goal: Harvest 10 mature crops

for y in range(0, 6):
    for x in range(0, 6):
        fly_to(x, y)
        tile = get_tile(x, y)
        if tile and tile["crop"] and tile["growth"] >= 100:
            harvest(x, y)
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
# Goal: Clear weeds and fertilize 6 plots

for x in range(0, 6):
    fly_to(x, 0)
    clear_weeds(x, 0)
    fertilize(x, 0)
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
# Maximize points by chaining plant, water, and harvest!

for y in range(0, 4):
    for x in range(0, 4):
        fly_to(x, y)
        plant(x, y, "carrot")
        water(x, y)
`,
    solutionHint: 'Speed up execution by planting fast-growing crops with immediate watering.',
  },
];
