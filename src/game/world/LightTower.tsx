import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

interface LightTowerProps {
  position: [number, number, number];
}

export const LightTower: React.FC<LightTowerProps> = ({ position }) => {
  const timeOfDay = useGameStore((state) => state.timeOfDay);
  const beaconRef = useRef<THREE.Mesh>(null);
  const spotLightRef = useRef<THREE.SpotLight>(null);

  // Night condition: 6:30 PM (18.5) to 5:30 AM (5.5)
  const isNight = timeOfDay < 5.5 || timeOfDay > 18.5;

  // Calculate angle and distance to farm center (0, 0, 0)
  const distToCenter = Math.hypot(position[0], position[2]);
  const angleToCenter = Math.atan2(-position[0], -position[2]);

  // Target object placed in the center of the farm in local rotated space
  const targetObject = useMemo(() => {
    const obj = new THREE.Object3D();
    obj.position.set(0, 0, distToCenter);
    return obj;
  }, [distToCenter]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Red obstruction beacon flashing at top of mast
    if (beaconRef.current) {
      const blink = Math.sin(time * 4.0) > 0.05;
      const mat = beaconRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = blink ? 3.0 : 0.15;
    }

    // Direct spotlight to target object
    if (spotLightRef.current) {
      spotLightRef.current.target = targetObject;
    }
  });

  return (
    <group position={position} rotation={[0, angleToCenter, 0]}>
      {/* Target anchor for the spotlight inside the rotated local coordinate frame */}
      <primitive object={targetObject} />

      {/* --- REINFORCED CONCRETE PEDESTAL BASE --- */}
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.24, 1.3]} />
        <meshStandardMaterial color="#1f232b" roughness={0.9} />
      </mesh>

      {/* Heavy-Duty Industrial Power Transformer / Generator Unit */}
      <mesh position={[0.42, 0.5, 0.35]} castShadow>
        <boxGeometry args={[0.55, 0.75, 0.45]} />
        <meshStandardMaterial color="#2a2e37" roughness={0.65} metalness={0.7} />
      </mesh>
      {/* Generator Status Indicator LED */}
      <mesh position={[0.42, 0.75, 0.58]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color={isNight ? '#22c55e' : '#eab308'} />
      </mesh>

      {/* Service Ladder on Rear Face */}
      {Array.from({ length: 18 }).map((_, i) => (
        <mesh key={`ladder_${i}`} position={[0, 0.4 + i * 0.38, -0.22]}>
          <boxGeometry args={[0.26, 0.025, 0.025]} />
          <meshStandardMaterial color="#64748b" metalness={0.9} />
        </mesh>
      ))}

      {/* --- STEEL LATTICE MAST LEGS (4 Corner Pylons) --- */}
      {[
        { x: 0.35, z: 0.35 },
        { x: -0.35, z: 0.35 },
        { x: 0.35, z: -0.35 },
        { x: -0.35, z: -0.35 },
      ].map((leg, i) => (
        <mesh key={`leg_${i}`} position={[leg.x * 0.72, 3.8, leg.z * 0.72]} castShadow>
          <cylinderGeometry args={[0.04, 0.06, 7.4, 6]} />
          <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.85} />
        </mesh>
      ))}

      {/* Horizontal & Diagonal Cross Bracing Girders */}
      {[1.2, 2.4, 3.6, 4.8, 6.0, 7.2].map((y, i) => (
        <group key={`brace_tier_${i}`} position={[0, y, 0]}>
          {/* Perimeter Beams */}
          <mesh position={[0, 0, 0.25]}>
            <boxGeometry args={[0.52, 0.035, 0.035]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
          <mesh position={[0, 0, -0.25]}>
            <boxGeometry args={[0.52, 0.035, 0.035]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
          <mesh position={[0.25, 0, 0]}>
            <boxGeometry args={[0.035, 0.035, 0.52]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
          <mesh position={[-0.25, 0, 0]}>
            <boxGeometry args={[0.035, 0.035, 0.52]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
        </group>
      ))}

      {/* --- TOP MAINTENANCE & RIGGING PLATFORM (7.5m) --- */}
      <mesh position={[0, 7.45, 0]} castShadow>
        <boxGeometry args={[1.2, 0.1, 1.2]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} metalness={0.8} />
      </mesh>
      {/* Platform Safety Railings */}
      <mesh position={[0, 7.8, 0.58]}>
        <boxGeometry args={[1.16, 0.6, 0.03]} />
        <meshStandardMaterial color="#475569" wireframe />
      </mesh>
      <mesh position={[0, 7.8, -0.58]}>
        <boxGeometry args={[1.16, 0.6, 0.03]} />
        <meshStandardMaterial color="#475569" wireframe />
      </mesh>
      <mesh position={[0.58, 7.8, 0]}>
        <boxGeometry args={[0.03, 0.6, 1.16]} />
        <meshStandardMaterial color="#475569" wireframe />
      </mesh>
      <mesh position={[-0.58, 7.8, 0]}>
        <boxGeometry args={[0.03, 0.6, 1.16]} />
        <meshStandardMaterial color="#475569" wireframe />
      </mesh>

      {/* --- STADIUM FLOODLIGHT BANK (Angled Downward at 45° Towards Field) --- */}
      <group position={[0, 8.0, 0.15]} rotation={[0.7, 0, 0]}>
        {/* Heavy Mounting Rack Backbone */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[1.6, 0.8, 0.14]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.9} />
        </mesh>

        {/* 8 STADIUM HIGH-OUTPUT FLOODLIGHT PODS (2 Rows of 4 Lamps) */}
        {[
          { x: -0.55, y: 0.22 },
          { x: -0.18, y: 0.22 },
          { x: 0.18, y: 0.22 },
          { x: 0.55, y: 0.22 },
          { x: -0.55, y: -0.22 },
          { x: -0.18, y: -0.22 },
          { x: 0.18, y: -0.22 },
          { x: 0.55, y: -0.22 },
        ].map((lamp, idx) => (
          <group key={`stadium_lamp_${idx}`} position={[lamp.x, lamp.y, 0.1]}>
            {/* Lamp Housing with Heat Sink Fins */}
            <mesh castShadow>
              <boxGeometry args={[0.28, 0.28, 0.18]} />
              <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.8} />
            </mesh>
            {/* Cooling Fin Backplate */}
            <mesh position={[0, 0, -0.1]}>
              <boxGeometry args={[0.26, 0.26, 0.05]} />
              <meshStandardMaterial color="#334155" metalness={0.9} />
            </mesh>
            {/* High-Luminance Stadium Reflector / Glass Lens */}
            <mesh position={[0, 0, 0.095]}>
              <planeGeometry args={[0.24, 0.24]} />
              <meshStandardMaterial
                color={isNight ? '#ffffff' : '#64748b'}
                emissive={isNight ? '#fffbeb' : '#000000'}
                emissiveIntensity={isNight ? 5.0 : 0}
                roughness={0.05}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* --- ANTENNA MAST & FLASHING RED OBSTRUCTION BEACON --- */}
      <mesh position={[0, 8.4, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.8, 6]} />
        <meshStandardMaterial color="#64748b" metalness={0.9} />
      </mesh>
      <mesh ref={beaconRef} position={[0, 8.82, 0]}>
        <sphereGeometry args={[0.055, 12, 12]} />
        <meshStandardMaterial
          color="#ef4444"
          emissive="#ef4444"
          emissiveIntensity={2.5}
          roughness={0.1}
        />
      </mesh>

      {/* --- NIGHTTIME HIGH-OUTPUT STADIUM LIGHTING RIG --- */}
      {isNight && (
        <>
          {/* Main Focused Stadium Spotlight Beam Shining Across Field Grid */}
          <spotLight
            ref={spotLightRef}
            position={[0, 8.0, 0.2]}
            intensity={7.5}
            angle={0.65}
            penumbra={0.45}
            distance={36}
            color="#fffbeb"
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-bias={-0.0001}
          />

          {/* Wide-Angle Stadium Field Wash PointLight */}
          <pointLight
            position={[0, 7.8, 1.2]}
            intensity={2.2}
            distance={22}
            color="#fef08a"
          />

          {/* Atmospheric Volumetric Stadium Light Shaft Beam Cone */}
          <group position={[0, 4.0, distToCenter * 0.45]} rotation={[0.62, 0, 0]}>
            <mesh position={[0, 0, 0]}>
              <coneGeometry args={[3.2, 8.0, 24, 1, true]} />
              <meshBasicMaterial
                color="#fffbeb"
                transparent
                opacity={0.075}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>
          </group>
        </>
      )}
    </group>
  );
};
