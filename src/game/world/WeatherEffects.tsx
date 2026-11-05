import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { WEATHER_PROFILES } from '../simulation/weatherConfig';

const generateRainPositions = () => {
  const pos = new Float32Array(600 * 3);
  for (let i = 0; i < 600; i++) {
    const u = (i * 0.6180339887) % 1;
    const v = (i * 0.4142135623) % 1;
    const w = (i * 0.7320508075) % 1;
    pos[i * 3] = (u - 0.5) * 24;
    pos[i * 3 + 1] = v * 12;
    pos[i * 3 + 2] = (w - 0.5) * 24;
  }
  return pos;
};

const INITIAL_RAIN_POSITIONS = generateRainPositions();

export const WeatherEffects: React.FC = () => {
  const weather = useGameStore((s) => s.weather);
  const timeOfDay = useGameStore((s) => s.timeOfDay);
  const quality = useGameStore((s) => s.graphicsQuality);
  const profile = WEATHER_PROFILES[weather];

  // Dynamic particle count based on hardware capability
  const maxRain = quality === 'low' ? 60 : quality === 'balanced' ? 200 : 500;
  const rainCount = weather === 'stormy' ? maxRain : weather === 'rainy' ? Math.round(maxRain * 0.6) : 0;
  const rainGeoRef = useRef<THREE.BufferGeometry>(null);
  const rainPositions = INITIAL_RAIN_POSITIONS;

  // Sun and Moon celestial calculation based on 24hr timeOfDay
  const sunAngle = ((timeOfDay - 6) / 24) * Math.PI * 2;
  const sunY = Math.sin(sunAngle) * 16;
  const sunX = Math.cos(sunAngle) * 18;
  const isDay = sunY > -1;

  // Soft natural golden daylight
  const sunColor = useMemo(() => {
    if (weather === 'drought') return '#fef08a';
    if (timeOfDay < 8 || timeOfDay > 17) return '#fdba74'; // sunset / sunrise golden glow
    return profile.sunColor;
  }, [profile.sunColor, weather, timeOfDay]);

  // Lightning ref to avoid React state re-renders during thunderstorms
  const lightningLightRef = useRef<THREE.PointLight>(null);
  const lightningIntensityRef = useRef(0);

  useFrame((_, delta) => {
    // Rain falling animation
    if (rainCount > 0 && rainGeoRef.current) {
      const positions = rainGeoRef.current.attributes.position.array as Float32Array;
      const speed = weather === 'stormy' ? 18 : 12;
      for (let i = 0; i < rainCount; i++) {
        positions[i * 3 + 1] -= speed * delta;
        if (positions[i * 3 + 1] < 0) {
          positions[i * 3 + 1] = 12;
        }
      }
      rainGeoRef.current.attributes.position.needsUpdate = true;
    }

    // Occasional lightning in storm via ref (0 React re-renders)
    if (weather === 'stormy') {
      if (Math.random() < 0.008) {
        lightningIntensityRef.current = 2.5;
      } else if (lightningIntensityRef.current > 0) {
        lightningIntensityRef.current = Math.max(0, lightningIntensityRef.current - delta * 6);
      }
    } else {
      lightningIntensityRef.current = 0;
    }

    if (lightningLightRef.current) {
      lightningLightRef.current.intensity = lightningIntensityRef.current * 4;
    }
  });

  return (
    <>
      {/* Dynamic Hemisphere Ambient Light (Warm sky & lush green bounce) */}
      <hemisphereLight
        args={[
          isDay ? (weather === 'drought' ? '#fdba74' : '#bae6fd') : '#1e1b4b',
          isDay ? '#3f6212' : '#090d16',
          profile.ambientIntensity * (isDay ? 1 : 0.35),
        ]}
      />

      {/* Main Directional Sunlight (Casts Shadows based on quality setting) */}
      {isDay && (
        <directionalLight
          position={[sunX, Math.max(2, sunY), 10]}
          intensity={profile.sunIntensity * (weather === 'stormy' ? 0.3 : 1.1)}
          color={sunColor}
          castShadow={quality !== 'low'}
          shadow-mapSize-width={quality === 'high' ? 1024 : 512}
          shadow-mapSize-height={quality === 'high' ? 1024 : 512}
          shadow-camera-near={0.5}
          shadow-camera-far={45}
          shadow-camera-left={-12}
          shadow-camera-right={12}
          shadow-camera-top={12}
          shadow-camera-bottom={-12}
          shadow-bias={-0.0005}
        />
      )}

      {/* Nighttime Moon & Stadium Field Illumination */}
      {!isDay && (
        <>
          <directionalLight
            position={[-sunX, Math.max(2, -sunY), -10]}
            intensity={0.5}
            color="#94a3b8"
          />
          {/* Overhead Field Flood Light */}
          <pointLight
            position={[0, 9, 0]}
            intensity={2.2}
            distance={28}
            color="#fffef0"
          />
        </>
      )}

      {/* Lightning Flash Light */}
      <pointLight
        ref={lightningLightRef}
        position={[0, 10, 0]}
        intensity={0}
        color="#f4f4f5"
        distance={40}
      />

      {/* Visual Sun Sphere - Soft Silvery White */}
      {isDay && (
        <mesh position={[sunX, Math.max(2, sunY), 10]}>
          <sphereGeometry args={[1.2, 16, 16]} />
          <meshBasicMaterial color="#f4f4f5" />
        </mesh>
      )}

      {/* Visual Moon Sphere - Silver */}
      {!isDay && (
        <mesh position={[-sunX, Math.max(2, -sunY), -10]}>
          <sphereGeometry args={[0.9, 16, 16]} />
          <meshBasicMaterial color="#d4d4d8" />
        </mesh>
      )}

      {/* Falling Rain Particle Streaks - Silver Gray */}
      {rainCount > 0 && (
        <points>
          <bufferGeometry ref={rainGeoRef}>
            <bufferAttribute
              attach="attributes-position"
              args={[rainPositions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.12}
            color="#cbd5e1"
            transparent
            opacity={0.65}
            depthWrite={false}
          />
        </points>
      )}
    </>
  );
};
