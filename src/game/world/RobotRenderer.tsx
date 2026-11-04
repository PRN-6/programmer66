import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RobotState } from '../../types/game';

interface RobotRendererProps {
  robot: RobotState;
  gridWidth: number;
  gridHeight: number;
}

export const RobotRenderer: React.FC<RobotRendererProps> = ({ robot, gridWidth, gridHeight }) => {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const antennaRef = useRef<THREE.Mesh>(null);
  const armRef = useRef<THREE.Group>(null);

  const offsetX = (gridWidth - 1) * 0.5;
  const offsetZ = (gridHeight - 1) * 0.5;

  const targetWorldX = (robot.x - offsetX) * 1.2;
  const targetWorldZ = (robot.y - offsetZ) * 1.2;

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Smooth movement interpolation toward target grid tile
    const currentX = groupRef.current.position.x;
    const currentZ = groupRef.current.position.z;

    const diffX = targetWorldX - currentX;
    const diffZ = targetWorldZ - currentZ;

    groupRef.current.position.x += diffX * Math.min(1, delta * robot.speed * 3.5);
    groupRef.current.position.z += diffZ * Math.min(1, delta * robot.speed * 3.5);

    // Rotate facing direction towards movement
    if (Math.abs(diffX) > 0.01 || Math.abs(diffZ) > 0.01) {
      const angle = Math.atan2(diffX, diffZ);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, angle, delta * 10);
    }

    // Gentle mechanical idle/walk bobbing
    const time = state.clock.getElapsedTime();
    const isMoving = Math.abs(diffX) > 0.05 || Math.abs(diffZ) > 0.05;
    const bob = isMoving ? Math.sin(time * 12) * 0.04 : Math.sin(time * 2) * 0.015;
    groupRef.current.position.y = 0.2 + bob;

    // Rotate scanner dish
    if (antennaRef.current) {
      antennaRef.current.rotation.y += delta * 3.0;
    }

    // Articulate tool arm based on active tool
    if (armRef.current) {
      if (robot.currentTool === 'watering') {
        armRef.current.rotation.x = THREE.MathUtils.lerp(armRef.current.rotation.x, 0.8 + Math.sin(time * 8) * 0.15, delta * 8);
      } else if (robot.currentTool === 'harvesting') {
        armRef.current.rotation.y = THREE.MathUtils.lerp(armRef.current.rotation.y, Math.sin(time * 10) * 0.5, delta * 8);
      } else if (robot.currentTool === 'planting') {
        armRef.current.rotation.x = THREE.MathUtils.lerp(armRef.current.rotation.x, 1.1, delta * 8);
      } else {
        armRef.current.rotation.x = THREE.MathUtils.lerp(armRef.current.rotation.x, 0.2, delta * 5);
        armRef.current.rotation.y = THREE.MathUtils.lerp(armRef.current.rotation.y, 0, delta * 5);
      }
    }
  });

  return (
    <group ref={groupRef} position={[targetWorldX, 0.2, targetWorldZ]}>
      {/* Caterpillar treads / Wheels */}
      <mesh position={[0.22, 0, 0]} castShadow>
        <boxGeometry args={[0.12, 0.16, 0.5]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>
      <mesh position={[-0.22, 0, 0]} castShadow>
        <boxGeometry args={[0.12, 0.16, 0.5]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>

      {/* Main Chassis Body */}
      <mesh position={[0, 0.16, 0]} castShadow>
        <boxGeometry args={[0.36, 0.24, 0.42]} />
        <meshStandardMaterial color={robot.color} roughness={0.3} metalness={0.6} />
      </mesh>

      {/* Head / Sensor Dome */}
      <group ref={headRef} position={[0, 0.35, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.15, 16, 12]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.2} metalness={0.8} />
        </mesh>

        {/* Glowing Visor Eye */}
        <mesh position={[0, 0.02, 0.12]}>
          <boxGeometry args={[0.18, 0.06, 0.04]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#38bdf8"
            emissiveIntensity={2}
            roughness={0.1}
          />
        </mesh>

        {/* Rotating Scanner Antenna */}
        <mesh ref={antennaRef} position={[0, 0.18, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.1, 6]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.23, 0]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={1.5} />
        </mesh>
      </group>

      {/* Articulated Multi-Tool Arm */}
      <group ref={armRef} position={[0.22, 0.2, 0.1]}>
        {/* Arm segment */}
        <mesh position={[0, 0, 0.12]} rotation={[0.4, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.025, 0.22, 6]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} />
        </mesh>

        {/* Tool Nozzle / Sickle */}
        <mesh position={[0, -0.08, 0.22]}>
          <coneGeometry args={[0.05, 0.12, 8]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Tool Spray Effect when watering */}
        {robot.currentTool === 'watering' && (
          <mesh position={[0, -0.16, 0.25]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} />
          </mesh>
        )}
      </group>

      {/* Floating Status Ring / Shadow */}
      <mesh position={[0, -0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.35, 24]} />
        <meshBasicMaterial color={robot.color} transparent opacity={0.4} />
      </mesh>
    </group>
  );
};

