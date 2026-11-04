import type { WeatherType } from '../../types/game';

export interface WeatherProfile {
  type: WeatherType;
  name: string;
  icon: string;
  description: string;
  skyColor: string;
  ambientIntensity: number;
  sunIntensity: number;
  sunColor: string;
  soilDryingRate: number; // moisture lost per second
  rainMoistureRate: number; // moisture added per second
  temperatureC: number;
  growthMultiplier: number;
  durationSeconds: number;
}

export const WEATHER_PROFILES: Record<WeatherType, WeatherProfile> = {
  sunny: {
    type: 'sunny',
    name: 'Sunny',
    icon: 'Sun',
    description: 'Bright warm sunshine across the farm. Accelerated photosynthesis, moderate soil evaporation.',
    skyColor: '#38bdf8',
    ambientIntensity: 0.65,
    sunIntensity: 1.35,
    sunColor: '#fffbeb',
    soilDryingRate: 1.2,
    rainMoistureRate: 0,
    temperatureC: 24,
    growthMultiplier: 1.25,
    durationSeconds: 120,
  },
  cloudy: {
    type: 'cloudy',
    name: 'Overcast',
    icon: 'Cloud',
    description: 'Soft overcast cloud cover. Reduced evaporation preserves soil moisture for longer.',
    skyColor: '#94a3b8',
    ambientIntensity: 0.5,
    sunIntensity: 0.8,
    sunColor: '#e2e8f0',
    soilDryingRate: 0.5,
    rainMoistureRate: 0,
    temperatureC: 19,
    growthMultiplier: 1.0,
    durationSeconds: 90,
  },
  rainy: {
    type: 'rainy',
    name: 'Rain',
    icon: 'CloudRain',
    description: 'Refreshing steady rainfall naturally hydrates all farm plots and refills ponds.',
    skyColor: '#64748b',
    ambientIntensity: 0.42,
    sunIntensity: 0.4,
    sunColor: '#cbd5e1',
    soilDryingRate: 0,
    rainMoistureRate: 3.5,
    temperatureC: 16,
    growthMultiplier: 1.15,
    durationSeconds: 80,
  },
  stormy: {
    type: 'stormy',
    name: 'Thunderstorm',
    icon: 'CloudLightning',
    description: 'Heavy thunderstorm with lightning and heavy rain. Rapidly drenches soil.',
    skyColor: '#334155',
    ambientIntensity: 0.28,
    sunIntensity: 0.2,
    sunColor: '#94a3b8',
    soilDryingRate: 0,
    rainMoistureRate: 6.0,
    temperatureC: 14,
    growthMultiplier: 0.9,
    durationSeconds: 60,
  },
  drought: {
    type: 'drought',
    name: 'Heatwave',
    icon: 'Flame',
    description: 'Intense warm sunlight. Soil dries rapidly; crops require frequent irrigation.',
    skyColor: '#fb923c',
    ambientIntensity: 0.75,
    sunIntensity: 1.6,
    sunColor: '#fef08a',
    soilDryingRate: 3.0,
    rainMoistureRate: 0,
    temperatureC: 34,
    growthMultiplier: 0.7,
    durationSeconds: 60,
  },
};
