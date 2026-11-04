import React, { useRef, useEffect } from 'react';
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
  const rotorsRef = useRef<THREE.Group[]>([]);
  const toolGroupRef = useRef<THREE.Group>(null);
  const isInitializedRef = useRef(false);

  const offsetX = (gridWidth - 1) * 0.5;
  const offsetZ = (gridHeight - 1) * 0.5;

  const targetWorldX = (robot.x - offsetX) * 1.2;
  const targetWorldZ = (robot.y - offsetZ) * 1.2;

  // Initialize position once on mount
  useEffect(() => {
    if (groupRef.current && !isInitializedRef.current) {
      groupRef.current.position.set(targetWorldX, 0.88, targetWorldZ);
      isInitializedRef.current = true;
    }
  }, [targetWorldX, targetWorldZ]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (!isInitializedRef.current) {
      groupRef.current.position.set(targetWorldX, 0.88, targetWorldZ);
      isInitializedRef.current = true;
      return;
    }

    const time = state.clock.getElapsedTime();

    // Smooth movement interpolation toward target grid tile
    const currentX = groupRef.current.position.x;
    const currentZ = groupRef.current.position.z;

    const diffX = targetWorldX - currentX;
    const diffZ = targetWorldZ - currentZ;
    const dist = Math.hypot(diffX, diffZ);

    const isMoving = dist > 0.03;

    if (dist > 0.001) {
      // Responsive, smooth flight interpolation
      const lerpFactor = THREE.MathUtils.clamp(delta * 9.5, 0, 1);
      groupRef.current.position.x += diffX * lerpFactor;
      groupRef.current.position.z += diffZ * lerpFactor;
    }

    // Hover flight altitude & dynamic bobbing
    const hoverY = 0.88;
    const bob = isMoving ? Math.sin(time * 14) * 0.045 : Math.sin(time * 3.5) * 0.025;
    groupRef.current.position.y = hoverY + bob;

    // Drone banking / tilt into direction of flight
    if (isMoving) {
      const targetAngle = Math.atan2(diffX, diffZ);
      // Smooth yaw rotation towards heading
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetAngle,
        THREE.MathUtils.clamp(delta * 10, 0, 1)
      );

      // Pitch forward slightly while moving
      const tiltPitch = Math.min(0.28, dist * 0.45);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        tiltPitch,
        THREE.MathUtils.clamp(delta * 8, 0, 1)
      );
      groupRef.current.rotation.z = THREE.MathUtils.lerp(
        groupRef.current.rotation.z,
        0,
        THREE.MathUtils.clamp(delta * 8, 0, 1)
      );
    } else {
      // Gentle idle sway
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        Math.sin(time * 2) * 0.025,
        THREE.MathUtils.clamp(delta * 4, 0, 1)
      );
      groupRef.current.rotation.z = THREE.MathUtils.lerp(
        groupRef.current.rotation.z,
        Math.cos(time * 2) * 0.025,
        THREE.MathUtils.clamp(delta * 4, 0, 1)
      );
    }

    // High-speed rotor blade spinning animation
    const rotorSpeed = isMoving || robot.currentTool !== 'idle' ? 50 : 32;
    rotorsRef.current.forEach((rotor, idx) => {
      if (rotor) {
        const dir = idx % 2 === 0 ? 1 : -1;
        rotor.rotation.y += delta * rotorSpeed * dir;
      }
    });

    // Tool animation dynamics
    if (toolGroupRef.current) {
      if (robot.currentTool === 'watering') {
        toolGroupRef.current.scale.set(
          1 + Math.sin(time * 16) * 0.1,
          1,
          1 + Math.sin(time * 16) * 0.1
        );
      } else if (robot.currentTool === 'harvesting') {
        toolGroupRef.current.rotation.y += delta * 18;
      } else if (robot.currentTool === 'planting') {
        toolGroupRef.current.scale.set(
          1,
          1 + Math.sin(time * 20) * 0.06,
          1
        );
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* --- CENTRAL DRONE AVIONICS FUSELAGE --- */}
      <mesh castShadow>
        <boxGeometry args={[0.34, 0.14, 0.38]} />
        <meshStandardMaterial color="#22252a" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Aerodynamic Top Canopy Dome */}
      <mesh position={[0, 0.08, 0]} castShadow>
        <sphereGeometry args={[0.16, 16, 12]} />
        <meshStandardMaterial color="#383d47" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Front Glowing Optical Sensor / Visor */}
      <mesh position={[0, 0.02, 0.2]}>
        <boxGeometry args={[0.18, 0.05, 0.04]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#38bdf8"
          emissiveIntensity={2.5}
          roughness={0.1}
        />
      </mesh>

      {/* Top GPS / Status LED Beacon */}
      <mesh position={[0, 0.23, -0.04]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial
          color={robot.currentTool !== 'idle' ? '#22c55e' : '#f59e0b'}
          emissive={robot.currentTool !== 'idle' ? '#22c55e' : '#f59e0b'}
          emissiveIntensity={2}
        />
      </mesh>

      {/* --- 4 DIAGONAL CARBON-FIBER ROTOR ARMS & PROPELLERS --- */}
      {[
        { x: 0.28, z: 0.28, angle: Math.PI / 4 },
        { x: -0.28, z: 0.28, angle: -Math.PI / 4 },
        { x: 0.28, z: -0.28, angle: (3 * Math.PI) / 4 },
        { x: -0.28, z: -0.28, angle: -(3 * Math.PI) / 4 },
      ].map((arm, i) => (
        <group key={`rotor_arm_${i}`}>
          {/* Carbon Fiber Boom */}
          <mesh
            position={[arm.x * 0.55, 0.02, arm.z * 0.55]}
            rotation={[0, -arm.angle, 0]}
          >
            <cylinderGeometry args={[0.018, 0.018, 0.42, 6]} />
            <meshStandardMaterial color="#181a1e" metalness={0.9} roughness={0.2} />
          </mesh>

          {/* Motor Pod Housing */}
          <mesh position={[arm.x, 0.04, arm.z]}>
            <cylinderGeometry args={[0.05, 0.05, 0.08, 12]} />
            <meshStandardMaterial color="#2d3139" metalness={0.8} />
          </mesh>

          {/* Rotor Arm Tip LED Light */}
          <mesh position={[arm.x * 1.15, 0.02, arm.z * 1.15]}>
            <sphereGeometry args={[0.02, 6, 6]} />
            <meshStandardMaterial
              color={i < 2 ? '#38bdf8' : '#ef4444'}
              emissive={i < 2 ? '#38bdf8' : '#ef4444'}
              emissiveIntensity={2}
            />
          </mesh>

          {/* Fast-Spinning Rotor Propeller */}
          <group
            ref={(el) => {
              if (el) rotorsRef.current[i] = el;
            }}
            position={[arm.x, 0.09, arm.z]}
          >
            {/* Propeller Blade 1 */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.34, 0.008, 0.035]} />
              <meshStandardMaterial color="#94a3b8" roughness={0.3} metalness={0.5} transparent opacity={0.85} />
            </mesh>
            {/* Propeller Blade 2 */}
            <mesh position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
              <boxGeometry args={[0.34, 0.008, 0.035]} />
              <meshStandardMaterial color="#94a3b8" roughness={0.3} metalness={0.5} transparent opacity={0.85} />
            </mesh>
          </group>
        </group>
      ))}

      {/* --- UNDER-CHASSIS ARTICULATED TOOL POD --- */}
      <group position={[0, -0.08, 0]}>
        {/* Tool gimbal mount */}
        <mesh>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#16181b" metalness={0.9} />
        </mesh>

        {/* --- DOWNWARD WORKING ANIMATIONS --- */}
        <group ref={toolGroupRef}>
          {/* WATERING ANIMATION: High-tech downward cone water spray jet */}
          {robot.currentTool === 'watering' && (
            <group position={[0, -0.38, 0]}>
              {/* Conical spray beam */}
              <mesh position={[0, 0, 0]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[0.42, 0.75, 16, 1, true]} />
                <meshStandardMaterial
                  color="#38bdf8"
                  emissive="#0284c7"
                  emissiveIntensity={0.8}
                  transparent
                  opacity={0.45}
                  roughness={0.1}
                  side={THREE.DoubleSide}
                />
              </mesh>
              {/* Inner intense water stream */}
              <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.03, 0.18, 0.75, 8]} />
                <meshBasicMaterial color="#7dd3fc" transparent opacity={0.7} />
              </mesh>
              {/* Splash ring on the soil */}
              <mesh position={[0, -0.36, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.35, 0.44, 24]} />
                <meshBasicMaterial color="#38bdf8" transparent opacity={0.75} />
              </mesh>
            </group>
          )}

          {/* PLANTING ANIMATION: Downward seed injector laser / beam */}
          {robot.currentTool === 'planting' && (
            <group position={[0, -0.38, 0]}>
              {/* Intense laser needle */}
              <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 0.75, 8]} />
                <meshBasicMaterial color="#4ade80" />
              </mesh>
              {/* Targeting ring on soil */}
              <mesh position={[0, -0.36, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.2, 0.28, 24]} />
                <meshBasicMaterial color="#4ade80" transparent opacity={0.8} />
              </mesh>
            </group>
          )}

          {/* HARVESTING ANIMATION: Rotating golden tractor cutter beam */}
          {robot.currentTool === 'harvesting' && (
            <group position={[0, -0.38, 0]}>
              {/* Energy slice ring */}
              <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.32, 0.025, 8, 24]} />
                <meshStandardMaterial
                  color="#fbbf24"
                  emissive="#f59e0b"
                  emissiveIntensity={2}
                />
              </mesh>
              <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.25, 0.35, 24]} />
                <meshBasicMaterial color="#fef08a" transparent opacity={0.6} />
              </mesh>
            </group>
          )}

          {/* FERTILIZING ANIMATION: Purple nutrient spray */}
          {robot.currentTool === 'fertilizing' && (
            <group position={[0, -0.38, 0]}>
              <mesh position={[0, 0, 0]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[0.35, 0.75, 12, 1, true]} />
                <meshStandardMaterial
                  color="#c084fc"
                  emissive="#a855f7"
                  emissiveIntensity={1}
                  transparent
                  opacity={0.4}
                  side={THREE.DoubleSide}
                />
              </mesh>
            </group>
          )}

          {/* CLEARING ANIMATION: Ruby plasma pulse beam */}
          {robot.currentTool === 'clearing' && (
            <group position={[0, -0.38, 0]}>
              <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.025, 0.025, 0.75, 8]} />
                <meshBasicMaterial color="#f43f5e" />
              </mesh>
              <mesh position={[0, -0.36, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.22, 0.32, 24]} />
                <meshBasicMaterial color="#f43f5e" transparent opacity={0.8} />
              </mesh>
            </group>
          )}

          {/* Dynamic downward illumination during tool execution */}
          {robot.currentTool !== 'idle' && (
            <pointLight
              position={[0, -0.2, 0]}
              distance={2.5}
              intensity={2.0}
              color={
                robot.currentTool === 'watering'
                  ? '#38bdf8'
                  : robot.currentTool === 'planting'
                  ? '#4ade80'
                  : robot.currentTool === 'harvesting'
                  ? '#fbbf24'
                  : robot.currentTool === 'fertilizing'
                  ? '#c084fc'
                  : '#f43f5e'
              }
            />
          )}
        </group>
      </group>

      {/* --- GROUND TARGETING RETICLE & SHADOW --- */}
      {/* Downward projected HUD ring on the soil right beneath drone */}
      <mesh position={[0, -0.76, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.35, 0.4, 32]} />
        <meshBasicMaterial
          color={robot.currentTool !== 'idle' ? '#ffffff' : '#71717a'}
          transparent
          opacity={0.5}
        />
      </mesh>
      {/* Soft ground shadow circle */}
      <mesh position={[0, -0.77, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.28, 24]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.35} />
      </mesh>
    </group>
  );
};
