import { CropConfig, CropId } from '../../types/game';

export const CROPS: Record<CropId, CropConfig> = {
  wheat: {
    id: 'wheat',
    name: 'Golden Wheat',
    description: 'A resilient staple crop. Easy to grow, reliable yield, perfect for testing early automation.',
    seedCost: 5,
    sellPrice: 12,
    growthDuration: 18, // 18 seconds
    waterRequirement: 25,
    nutrientRequirement: 20,
    preferredWeather: ['sunny', 'cloudy'],
    color: '#84cc16', // fresh green
    secondaryColor: '#eab308', // wheat yellow
    fruitColor: '#facc15', // golden ear
    minStageDuration: 3,
    xpReward: 10,
  },
  corn: {
    id: 'corn',
    name: 'Sweet Corn',
    description: 'Tall stalks yielding golden ears. Demands more water and soil nutrients, but brings good profit.',
    seedCost: 10,
    sellPrice: 28,
    growthDuration: 28, // 28 seconds
    waterRequirement: 40,
    nutrientRequirement: 35,
    preferredWeather: ['sunny', 'rainy'],
    color: '#15803d', // deep green stalk
    secondaryColor: '#4ade80', // light leaves
    fruitColor: '#fbbf24', // yellow corn cob
    minStageDuration: 5,
    xpReward: 25,
  },
  carrot: {
    id: 'carrot',
    name: 'Crunchy Carrot',
    description: 'Fast-growing root vegetable. Loves moderately moist soil and balanced fertilizer.',
    seedCost: 8,
    sellPrice: 20,
    growthDuration: 22,
    waterRequirement: 30,
    nutrientRequirement: 25,
    preferredWeather: ['cloudy', 'rainy'],
    color: '#22c55e',
    secondaryColor: '#16a34a',
    fruitColor: '#f97316', // bright orange
    minStageDuration: 4,
    xpReward: 15,
  },
  tomato: {
    id: 'tomato',
    name: 'Vine Tomato',
    description: 'Juicy red tomatoes on climbing vines. Highly profitable cash crop requiring warm sunlight.',
    seedCost: 15,
    sellPrice: 42,
    growthDuration: 35,
    waterRequirement: 50,
    nutrientRequirement: 45,
    preferredWeather: ['sunny'],
    color: '#166534',
    secondaryColor: '#22c55e',
    fruitColor: '#ef4444', // vibrant red
    minStageDuration: 6,
    xpReward: 40,
  },
  potato: {
    id: 'potato',
    name: 'Hearty Potato',
    description: 'Sturdy tuber crop that can tolerate low moisture. High yield, staple food for expanding farms.',
    seedCost: 12,
    sellPrice: 32,
    growthDuration: 26,
    waterRequirement: 20,
    nutrientRequirement: 30,
    preferredWeather: ['cloudy', 'sunny'],
    color: '#65a30d',
    secondaryColor: '#84cc16',
    fruitColor: '#a16207', // earthy potato / flower
    minStageDuration: 5,
    xpReward: 20,
  },
};

export const CROP_LIST: CropConfig[] = Object.values(CROPS);

