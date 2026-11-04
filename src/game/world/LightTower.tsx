import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

interface LightTowerProps {
  position: [number, number, number];
  target?: THREE.Object3D;
}

export const LightTower: React.FC<LightTowerProps> = ({ position, target }) => {
  const timeOfDay = useGameStore((state) => state.timeOfDay);
  const beaconRef = useRef<THREE.Mesh>(null);
  const spotLightRef = useRef<THREE.SpotLight>(null);

  // Night condition: 6:30 PM (18.5) to 5:30 AM (5.5)
  const isNight = timeOfDay < 5.5 || timeOfDay > 18.5;

  // Geometry calculations to accurately aim from tower head to farm center (0, 0, 0)
  const towerHeight = 7.8;
  const distToCenter = Math.hypot(position[0], position[2]);
  const angleToCenter = Math.atan2(-position[0], -position[2]);

  // Lamp mounting offset & target calculations
  const lampZOffset = 0.2;
  const groundTargetDist = distToCenter;
  const effectiveHorizDist = Math.max(0.1, groundTargetDist - lampZOffset);

  // Downward pitch angle for floodlight rack so lamp faces aim straight at farm center
  const rackPitch = Math.atan2(towerHeight, effectiveHorizDist);

  // Volumetric light cylinder beam:
  // Cylinder top (+beamLength/2) begins at lamps [0, towerHeight, lampZOffset]
  // Cylinder bottom (-beamLength/2) lands at farm center [0, 0, distToCenter]
  const startVec = useMemo(() => new THREE.Vector3(0, towerHeight, lampZOffset), [towerHeight]);
  const endVec = useMemo(() => new THREE.Vector3(0, 0, distToCenter), [distToCenter]);
  const beamLength = useMemo(() => startVec.distanceTo(endVec), [startVec, endVec]);
  const beamMid = useMemo(
    () => new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5),
    [startVec, endVec]
  );
  const beamAngleX = -Math.atan2(effectiveHorizDist, towerHeight);

  // Fallback local target if scene-level target is omitted
  const localTarget = useMemo(() => {
    const obj = new THREE.Object3D();
    obj.position.set(0, 0, distToCenter);
    return obj;
  }, [distToCenter]);

  const activeTarget = target || localTarget;

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Red obstruction beacon flashing at top of mast
    if (beaconRef.current) {
      const blink = Math.sin(time * 4.0) > 0.05;
      const mat = beaconRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = blink ? 3.0 : 0.15;
    }

    // Direct spotlight to farm center target
    if (spotLightRef.current && activeTarget) {
      spotLightRef.current.target = activeTarget;
    }
  });

  return (
    <group position={position} rotation={[0, angleToCenter, 0]}>
      {/* Target anchor if using local coordinates */}
      {!target && <primitive object={localTarget} />}

      {/* --- REINFORCED CONCRETE PEDESTAL BASE --- */}
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.24, 1.3]} />
        <meshStandardMaterial color="#1f232b" roughness={0.9} />
      </mesh>

      {/* Heavy-Duty Industrial Power Transformer / Generator Unit */}
      <mesh position={[0.42, 0.5, -0.3]} castShadow>
        <boxGeometry args={[0.55, 0.75, 0.45]} />
        <meshStandardMaterial color="#2a2e37" roughness={0.65} metalness={0.7} />
      </mesh>
      {/* Generator Status Indicator LED */}
      <mesh position={[0.42, 0.75, -0.06]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color={isNight ? '#22c55e' : '#eab308'} />
      </mesh>

      {/* Service Ladder on Rear Face (Away from farm center) */}
      {Array.from({ length: 18 }).map((_, i) => (
        <mesh key={`ladder_${i}`} position={[0, 0.4 + i * 0.38, -0.26]}>
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

      {/* --- STADIUM FLOODLIGHT BANK (Angled Downward Towards Field Center) --- */}
      <group position={[0, 7.8, lampZOffset]} rotation={[rackPitch, 0, 0]}>
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
          <group key={`stadium_lamp_${idx}`} position={[lamp.x, lamp.y, 0.08]}>
            {/* Lamp Housing with Heat Sink Fins */}
            <mesh castShadow>
              <boxGeometry args={[0.28, 0.28, 0.16]} />
              <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.8} />
            </mesh>
            {/* Cooling Fin Backplate */}
            <mesh position={[0, 0, -0.09]}>
              <boxGeometry args={[0.26, 0.26, 0.04]} />
              <meshStandardMaterial color="#334155" metalness={0.9} />
            </mesh>
            {/* High-Luminance Luminous Glass Lens facing forward-downward towards farm */}
            <mesh position={[0, 0, 0.085]}>
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
          {/* Main Focused Stadium Spotlight Beam Shining Directly Across Field Grid */}
          <spotLight
            ref={spotLightRef}
            position={[0, towerHeight, lampZOffset]}
            intensity={9.5}
            angle={0.65}
            penumbra={0.35}
            distance={40}
            color="#fffef0"
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-bias={-0.0001}
          />

          {/* Wide-Angle Stadium Field Wash PointLight */}
          <pointLight
            position={[0, towerHeight - 0.2, lampZOffset + 0.8]}
            intensity={2.8}
            distance={25}
            color="#fffef0"
          />

          {/* Volumetric Stadium Light Shaft: Starts at lamps (narrow) and expands onto farm grid (wide) */}
          <group position={beamMid.toArray()} rotation={[beamAngleX, 0, 0]}>
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.4, 4.4, beamLength, 24, 1, true]} />
              <meshBasicMaterial
                color="#fffef0"
                transparent
                opacity={0.065}
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
