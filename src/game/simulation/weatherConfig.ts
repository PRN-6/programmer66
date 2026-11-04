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
    name: 'Clear',
    icon: 'Sun',
    description: 'Crisp clear skies with soft natural daylight. Healthy photosynthesis, moderate soil evaporation.',
    skyColor: '#252932',
    ambientIntensity: 0.6,
    sunIntensity: 1.3,
    sunColor: '#f4f4f5',
    soilDryingRate: 1.2,
    rainMoistureRate: 0,
    temperatureC: 22,
    growthMultiplier: 1.25,
    durationSeconds: 120,
  },
  cloudy: {
    type: 'cloudy',
    name: 'Overcast',
    icon: 'Cloud',
    description: 'Moody gray cloud cover. Reduced evaporation preserves soil moisture for longer.',
    skyColor: '#1a1d24',
    ambientIntensity: 0.45,
    sunIntensity: 0.7,
    sunColor: '#d4d4d8',
    soilDryingRate: 0.5,
    rainMoistureRate: 0,
    temperatureC: 18,
    growthMultiplier: 1.0,
    durationSeconds: 90,
  },
  rainy: {
    type: 'rainy',
    name: 'Rain',
    icon: 'CloudRain',
    description: 'Steady rainfall naturally hydrates all farm tiles and refills ponds.',
    skyColor: '#14161c',
    ambientIntensity: 0.38,
    sunIntensity: 0.35,
    sunColor: '#a1a1aa',
    soilDryingRate: 0,
    rainMoistureRate: 3.5,
    temperatureC: 15,
    growthMultiplier: 1.15,
    durationSeconds: 80,
  },
  stormy: {
    type: 'stormy',
    name: 'Thunderstorm',
    icon: 'CloudLightning',
    description: 'Deep storm with flashes of lightning and heavy precipitation.',
    skyColor: '#0c0e12',
    ambientIntensity: 0.22,
    sunIntensity: 0.15,
    sunColor: '#71717a',
    soilDryingRate: 0,
    rainMoistureRate: 6.0,
    temperatureC: 13,
    growthMultiplier: 0.9,
    durationSeconds: 60,
  },
  drought: {
    type: 'drought',
    name: 'Dry Heat',
    icon: 'Flame',
    description: 'Hazy arid conditions. Soil dries rapidly; crops require frequent robot irrigation.',
    skyColor: '#282522',
    ambientIntensity: 0.65,
    sunIntensity: 1.5,
    sunColor: '#e4e4e7',
    soilDryingRate: 3.0,
    rainMoistureRate: 0,
    temperatureC: 32,
    growthMultiplier: 0.7,
    durationSeconds: 60,
  },
};
