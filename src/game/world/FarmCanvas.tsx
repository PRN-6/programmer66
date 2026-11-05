import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei';
import { useGameStore } from '../../store/useGameStore';
import { FarmGrid } from './FarmGrid';
import { RobotRenderer } from './RobotRenderer';
import { Environment } from './Environment';
import { WeatherEffects } from './WeatherEffects';
import { WEATHER_PROFILES } from '../simulation/weatherConfig';

// Check if device supports WebGL
const checkWebGLSupport = () => {
  if (typeof window === 'undefined') return true;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
};

// Simulation driver inside Canvas loop - throttled to 8 Hz (~125ms)
// This reduces Zustand React store churn by 85%+ while keeping simulation accuracy identical
const SimulationRunner: React.FC = () => {
  const tick = useGameStore((state) => state.tick);
  const accumRef = useRef(0);

  useFrame((_, delta) => {
    // Clamp delta to avoid massive jumps during tab switches or frame drops
    const safeDelta = Math.min(delta, 0.1);
    accumRef.current += safeDelta;

    if (accumRef.current >= 0.125) {
      tick(accumRef.current);
      accumRef.current = 0;
    }
  });

  return null;
};

// Isolated sky & fog component so FarmCanvas parent never re-renders when time/weather ticks
const SkyAndFog: React.FC = () => {
  const weather = useGameStore((s) => s.weather);
  const timeOfDay = useGameStore((s) => s.timeOfDay);
  const profile = WEATHER_PROFILES[weather];

  const isNight = timeOfDay < 5.5 || timeOfDay > 19.5;
  const skyColor = isNight ? '#0b1120' : profile.skyColor;

  return (
    <>
      <color attach="background" args={[skyColor]} />
      <fog attach="fog" args={[skyColor, 18, 48]} />
    </>
  );
};

export const FarmCanvas: React.FC = () => {
  const [hasWebGL] = useState(() => checkWebGLSupport());

  const robots = useGameStore((s) => s.robots);
  const gridWidth = useGameStore((s) => s.gridWidth);
  const gridHeight = useGameStore((s) => s.gridHeight);
  const quality = useGameStore((s) => s.graphicsQuality);

  // Dynamic DPR based on hardware capability & user quality setting
  const dpr: [number, number] | number = quality === 'low' ? 1 : quality === 'balanced' ? [1, 1.25] : [1, 1.5];

  if (!hasWebGL) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-900 text-neutral-300 p-6 text-center">
        <p className="text-sm font-semibold text-amber-400">WebGL Acceleration Not Detected</p>
        <p className="text-xs text-neutral-400 mt-1 max-w-sm">
          Please enable Hardware Acceleration or WebGL in your browser settings to render the 3D farm world.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        shadows={quality !== 'low'}
        dpr={dpr}
        gl={{
          powerPreference: 'high-performance',
          antialias: quality === 'high',
          precision: quality === 'low' ? 'lowp' : 'mediump',
          stencil: false,
          depth: true,
        }}
        camera={{ position: [2.8, 9.2, 9.2], fov: 42 }}
        className="w-full h-full"
      >
        {/* Dynamic adaptive frame scaling for silky 60 FPS on low-power devices */}
        <AdaptiveDpr pixelated={false} />
        <AdaptiveEvents />

        {/* Dynamic background sky & atmospheric fog */}
        <SkyAndFog />

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

        {/* Throttled Simulation Loop */}
        <SimulationRunner />
      </Canvas>
    </div>
  );
};

