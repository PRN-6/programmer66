import React from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useGameStore } from '../../store/useGameStore';
import { FarmGrid } from './FarmGrid';
import { RobotRenderer } from './RobotRenderer';
import { Environment } from './Environment';
import { WeatherEffects } from './WeatherEffects';
import { WEATHER_PROFILES } from '../simulation/weatherConfig';

// Simulation driver inside Canvas loop
const SimulationRunner: React.FC = () => {
  const tick = useGameStore((state) => state.tick);

  useFrame((_, delta) => {
    // Clamp delta to avoid massive jumps when tab is inactive
    const safeDelta = Math.min(delta, 0.1);
    tick(safeDelta);
  });

  return null;
};

export const FarmCanvas: React.FC = () => {
  const { robots, gridWidth, gridHeight, weather, timeOfDay } = useGameStore();
  const profile = WEATHER_PROFILES[weather];

  // Dynamic background sky color calculation
  const isNight = timeOfDay < 5.5 || timeOfDay > 19.5;
  const skyColor = isNight ? '#0b1120' : profile.skyColor;

  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        shadows
        camera={{ position: [10, 11, 11], fov: 42 }}
        className="w-full h-full"
      >
        <color attach="background" args={[skyColor]} />
        <fog attach="fog" args={[skyColor, 18, 48]} />

        {/* Orbit Camera Controls */}
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.06}
          minDistance={5}
          maxDistance={30}
          maxPolarAngle={Math.PI / 2.15} // Prevent camera going underneath terrain
          target={[0, 0, 0]}
        />

        {/* Dynamic Sun, Moon, Lighting, Rain */}
        <WeatherEffects />

        {/* Farm Buildings, Trees, Pond, Ground */}
        <Environment />

        {/* Grid Soil Beds & Visual Crops */}
        <FarmGrid />

        {/* Autonomous Farming Robots */}
        {robots.map((robot) => (
          <RobotRenderer
            key={robot.id}
            robot={robot}
            gridWidth={gridWidth}
            gridHeight={gridHeight}
          />
        ))}

        {/* Simulation Loop */}
        <SimulationRunner />
      </Canvas>
    </div>
  );
};

