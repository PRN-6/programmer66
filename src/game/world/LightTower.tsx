import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

interface LightTowerProps {
  position: [number, number, number];
  targetPosition?: [number, number, number];
}

export const LightTower: React.FC<LightTowerProps> = ({
  position,
  targetPosition = [0, 0, 0],
}) => {
  const timeOfDay = useGameStore((state) => state.timeOfDay);
  const beaconRef = useRef<THREE.Mesh>(null);
  const spotLightRef = useRef<THREE.SpotLight>(null);
  const targetObjectRef = useRef<THREE.Object3D>(new THREE.Object3D());

  // Night condition: 6:30 PM (18.5) to 5:30 AM (5.5)
  const isNight = timeOfDay < 5.5 || timeOfDay > 18.5;

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Red obstruction beacon blinking at top
    if (beaconRef.current) {
      const blink = Math.sin(time * 3.5) > 0.1;
      const mat = beaconRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = blink ? 2.5 : 0.2;
    }

    // SpotLight targeting center of farm
    if (spotLightRef.current && targetObjectRef.current) {
      targetObjectRef.current.position.set(...targetPosition);
      spotLightRef.current.target = targetObjectRef.current;
    }
  });

  return (
    <group position={position}>
      {/* Target anchor for the spotlight */}
      <primitive object={targetObjectRef.current} />

      {/* Concrete Foundation Base */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.2, 1.2]} />
        <meshStandardMaterial color="#22252a" roughness={0.9} />
      </mesh>

      {/* Power Generator & Control Cabinet at base */}
      <mesh position={[0.4, 0.45, 0.35]} castShadow>
        <boxGeometry args={[0.5, 0.7, 0.4]} />
        <meshStandardMaterial color="#2d3038" roughness={0.7} metalness={0.6} />
      </mesh>
      {/* Cabinet Green Power LED */}
      <mesh position={[0.4, 0.65, 0.56]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color="#22c55e" />
      </mesh>

      {/* Main Steel Lattice Mast Legs (4 Corner Struts) */}
      {[
        { x: 0.3, z: 0.3 },
        { x: -0.3, z: 0.3 },
        { x: 0.3, z: -0.3 },
        { x: -0.3, z: -0.3 },
      ].map((leg, i) => (
        <mesh key={`leg_${i}`} position={[leg.x * 0.7, 3.0, leg.z * 0.7]} castShadow>
          <cylinderGeometry args={[0.035, 0.05, 5.8, 6]} />
          <meshStandardMaterial color="#383d47" roughness={0.6} metalness={0.8} />
        </mesh>
      ))}

      {/* Horizontal Cross Bracing Rungs */}
      {[1.2, 2.4, 3.6, 4.8].map((y, i) => (
        <group key={`brace_${i}`} position={[0, y, 0]}>
          <mesh position={[0, 0, 0.22]}>
            <boxGeometry args={[0.45, 0.03, 0.03]} />
            <meshStandardMaterial color="#272a31" metalness={0.8} />
          </mesh>
          <mesh position={[0, 0, -0.22]}>
            <boxGeometry args={[0.45, 0.03, 0.03]} />
            <meshStandardMaterial color="#272a31" metalness={0.8} />
          </mesh>
          <mesh position={[0.22, 0, 0]}>
            <boxGeometry args={[0.03, 0.03, 0.45]} />
            <meshStandardMaterial color="#272a31" metalness={0.8} />
          </mesh>
          <mesh position={[-0.22, 0, 0]}>
            <boxGeometry args={[0.03, 0.03, 0.45]} />
            <meshStandardMaterial color="#272a31" metalness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Observation / Maintenance Platform at Top */}
      <mesh position={[0, 5.85, 0]} castShadow>
        <boxGeometry args={[1.0, 0.08, 1.0]} />
        <meshStandardMaterial color="#272a31" roughness={0.7} metalness={0.7} />
      </mesh>
      {/* Platform Safety Railings */}
      <mesh position={[0, 6.1, 0.48]}>
        <boxGeometry args={[0.96, 0.4, 0.02]} />
        <meshStandardMaterial color="#474d59" wireframe />
      </mesh>
      <mesh position={[0, 6.1, -0.48]}>
        <boxGeometry args={[0.96, 0.4, 0.02]} />
        <meshStandardMaterial color="#474d59" wireframe />
      </mesh>

      {/* Floodlight Fixture Rig Head (Angled Downward Toward Farm) */}
      <group position={[0, 6.3, 0]} rotation={[0.45, 0, 0]}>
        {/* Heavy Mounting Crossbar */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.1, 0.08, 0.12]} />
          <meshStandardMaterial color="#1a1c22" metalness={0.9} />
        </mesh>

        {/* 4 Heavy-Duty Floodlight Housings */}
        {[-0.42, -0.14, 0.14, 0.42].map((x, idx) => (
          <group key={`lamp_${idx}`} position={[x, -0.1, 0.06]}>
            {/* Lamp Casing */}
            <mesh castShadow>
              <boxGeometry args={[0.22, 0.22, 0.16]} />
              <meshStandardMaterial color="#22252c" roughness={0.5} metalness={0.8} />
            </mesh>
            {/* Luminous Light Face / Lens */}
            <mesh position={[0, 0, 0.09]}>
              <planeGeometry args={[0.18, 0.18]} />
              <meshStandardMaterial
                color={isNight ? '#fffbeb' : '#52525b'}
                emissive={isNight ? '#fef08a' : '#000000'}
                emissiveIntensity={isNight ? 3.5 : 0}
                roughness={0.1}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* Antenna Mast with Flashing Red Warning Beacon */}
      <mesh position={[0, 6.6, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.6, 6]} />
        <meshStandardMaterial color="#52525b" metalness={0.9} />
      </mesh>
      <mesh ref={beaconRef} position={[0, 6.92, 0]}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshStandardMaterial
          color="#ef4444"
          emissive="#ef4444"
          emissiveIntensity={2}
          roughness={0.2}
        />
      </mesh>

      {/* Dynamic 3D SpotLight Cast Onto the Farm Grid at Night */}
      {isNight && (
        <>
          <spotLight
            ref={spotLightRef}
            position={[0, 6.2, 0]}
            intensity={4.2}
            angle={0.7}
            penumbra={0.65}
            distance={28}
            color="#fef9c3"
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-bias={-0.0001}
          />

          {/* Ambient Warm Fill Light near the base */}
          <pointLight
            position={[0, 6.0, 0]}
            intensity={0.8}
            distance={8}
            color="#fef08a"
          />

          {/* Volumetric Soft Translucent Light Beam Cone */}
          <group position={[0, 3.2, 1.2]} rotation={[0.42, 0, 0]}>
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.3, 2.6, 6.0, 16, 1, true]} />
              <meshBasicMaterial
                color="#fef08a"
                transparent
                opacity={0.06}
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

