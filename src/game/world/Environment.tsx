import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LightTower } from './LightTower';

export const Environment: React.FC = () => {
  const windmillBladesRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (windmillBladesRef.current) {
      windmillBladesRef.current.rotation.z += delta * 1.0;
    }
  });

  return (
    <group>
      {/* Expansive Terrain Base - Natural Lush Green Countryside Pasture */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[48, 0.2, 48]} />
        <meshStandardMaterial color="#22c55e" roughness={0.85} metalness={0.05} />
      </mesh>

      {/* Farm boundary dirt & gravel pathway */}
      <mesh position={[0, -0.04, 0]} receiveShadow>
        <boxGeometry args={[11, 0.21, 11]} />
        <meshStandardMaterial color="#ca8a04" roughness={0.92} />
      </mesh>

      {/* Inner field ground clearing - Fresh grass clearing */}
      <mesh position={[0, -0.03, 0]} receiveShadow>
        <boxGeometry args={[9.5, 0.22, 9.5]} />
        <meshStandardMaterial color="#16a34a" roughness={0.8} />
      </mesh>

      {/* --- RUSTIC COZY FARMHOUSE --- */}
      <group position={[-8, 0, -4]} rotation={[0, 0.4, 0]}>
        {/* Main Building Base (Warm Cream Timber) */}
        <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.2, 2.4, 2.8]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.7} />
        </mesh>
        {/* Pitched Terracotta Red Roof */}
        <mesh position={[0, 2.9, 0]} rotation={[0, 0, 0]} castShadow>
          <coneGeometry args={[2.5, 1.4, 4]} />
          <meshStandardMaterial color="#b91c1c" roughness={0.6} />
        </mesh>
        {/* Brick Chimney */}
        <mesh position={[0.9, 3.1, 0.5]} castShadow>
          <boxGeometry args={[0.4, 1.0, 0.4]} />
          <meshStandardMaterial color="#7f1d1d" roughness={0.9} />
        </mesh>
        {/* Natural Wooden Porch */}
        <mesh position={[0, 0.2, 1.6]} castShadow receiveShadow>
          <boxGeometry args={[3.4, 0.2, 0.8]} />
          <meshStandardMaterial color="#92400e" roughness={0.8} />
        </mesh>
        {/* Walnut Front Door */}
        <mesh position={[0, 0.9, 1.41]}>
          <boxGeometry args={[0.7, 1.4, 0.05]} />
          <meshStandardMaterial color="#78350f" roughness={0.7} />
        </mesh>
        {/* Windows with warm glowing glass */}
        <mesh position={[-0.8, 1.3, 1.41]}>
          <boxGeometry args={[0.6, 0.6, 0.05]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.2} emissive="#0284c7" emissiveIntensity={0.25} />
        </mesh>
        <mesh position={[0.8, 1.3, 1.41]}>
          <boxGeometry args={[0.6, 0.6, 0.05]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.2} emissive="#0284c7" emissiveIntensity={0.25} />
        </mesh>
      </group>

      {/* --- ICONIC CLASSIC RED BARN --- */}
      <group position={[7.5, 0, -6]} rotation={[0, -0.3, 0]}>
        {/* Barn walls (Vibrant Barn Red) */}
        <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.2, 3.6, 3.4]} />
          <meshStandardMaterial color="#dc2626" roughness={0.65} />
        </mesh>
        {/* Gambrel Barn Roof */}
        <mesh position={[0, 4.0, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <cylinderGeometry args={[2.4, 2.4, 4.4, 4]} />
          <meshStandardMaterial color="#991b1b" roughness={0.55} />
        </mesh>
        {/* Big Sliding Barn Doors with White X Trim */}
        <mesh position={[0, 1.2, 1.72]}>
          <boxGeometry args={[1.8, 2.4, 0.06]} />
          <meshStandardMaterial color="#7f1d1d" roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.2, 1.76]}>
          <boxGeometry args={[1.6, 0.1, 0.05]} />
          <meshStandardMaterial color="#ffffff" roughness={0.4} />
        </mesh>
        <mesh position={[0, 1.2, 1.76]} rotation={[0, 0, 0.6]}>
          <boxGeometry args={[1.8, 0.08, 0.05]} />
          <meshStandardMaterial color="#ffffff" roughness={0.4} />
        </mesh>
        <mesh position={[0, 1.2, 1.76]} rotation={[0, 0, -0.6]}>
          <boxGeometry args={[1.8, 0.08, 0.05]} />
          <meshStandardMaterial color="#ffffff" roughness={0.4} />
        </mesh>
      </group>

      {/* --- TRADITIONAL STONE WINDMILL --- */}
      <group position={[-7.5, 0, 6]}>
        {/* Tapered Stone Tower */}
        <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.8, 1.4, 5, 8]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
        </mesh>
        {/* Cap Dome */}
        <mesh position={[0, 5.2, 0]} castShadow>
          <sphereGeometry args={[0.9, 8, 8]} />
          <meshStandardMaterial color="#b45309" roughness={0.6} />
        </mesh>
        {/* Rotating Blades */}
        <group ref={windmillBladesRef} position={[0, 5.2, 0.95]}>
          {/* Center Hub */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.2, 8]} />
            <meshStandardMaterial color="#78350f" />
          </mesh>
          {/* 4 Wooden Sail Blades */}
          {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, idx) => (
            <group key={idx} rotation={[0, 0, angle]}>
              <mesh position={[0, 1.6, 0]}>
                <boxGeometry args={[0.3, 2.8, 0.03]} />
                <meshStandardMaterial color="#fef3c7" roughness={0.7} />
              </mesh>
              <mesh position={[0, 1.6, -0.01]}>
                <boxGeometry args={[0.08, 3.2, 0.05]} />
                <meshStandardMaterial color="#78350f" roughness={0.8} />
              </mesh>
            </group>
          ))}
        </group>
      </group>

      {/* --- NATURAL SPARKLING WATER POND & DOCK --- */}
      <group position={[7.5, 0, 5]}>
        {/* Pond depression ring bank */}
        <mesh position={[0, 0.02, 0]} receiveShadow>
          <cylinderGeometry args={[2.5, 2.8, 0.1, 16]} />
          <meshStandardMaterial color="#15803d" roughness={0.85} />
        </mesh>
        {/* Clear Blue Shimmering Water Surface */}
        <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[2.3, 24]} />
          <meshStandardMaterial
            color="#0284c7"
            roughness={0.08}
            metalness={0.9}
            transparent
            opacity={0.88}
          />
        </mesh>
        {/* Natural Wooden Pier */}
        <mesh position={[-1.2, 0.14, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.4, 0.08, 0.8]} />
          <meshStandardMaterial color="#92400e" roughness={0.8} />
        </mesh>
      </group>

      {/* --- NATURAL RUSTIC SPLIT-RAIL WOODEN FENCES --- */}
      {[-5.2, 5.2].map((x) =>
        [-4, -2, 0, 2, 4].map((z) => (
          <group key={`fence_v_${x}_${z}`} position={[x, 0.35, z]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.05, 0.05, 0.7, 6]} />
              <meshStandardMaterial color="#92400e" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.15, 0]}>
              <boxGeometry args={[0.04, 0.06, 2.0]} />
              <meshStandardMaterial color="#b45309" roughness={0.8} />
            </mesh>
            <mesh position={[0, -0.15, 0]}>
              <boxGeometry args={[0.04, 0.06, 2.0]} />
              <meshStandardMaterial color="#b45309" roughness={0.8} />
            </mesh>
          </group>
        ))
      )}

      {/* --- NIGHTTIME AGRICULTURAL FLOODLIGHT TOWERS --- */}
      {/* North-West Perimeter Light Tower */}
      <group rotation={[0, 0.65, 0]}>
        <LightTower position={[-6.2, 0, -6.0]} targetPosition={[0, 0, 0]} />
      </group>
      {/* South-East Perimeter Light Tower */}
      <group rotation={[0, Math.PI + 0.65, 0]}>
        <LightTower position={[6.2, 0, 6.0]} targetPosition={[0, 0, 0]} />
      </group>

      {/* --- LUSH NATURAL PINE & OAK TREES --- */}
      {[
        { x: -12, z: -10, scale: 1.3, type: 'pine' },
        { x: -14, z: -4, scale: 1.1, type: 'oak' },
        { x: -11, z: 10, scale: 1.2, type: 'oak' },
        { x: -13, z: 5, scale: 1.4, type: 'pine' },
        { x: 12, z: -11, scale: 1.3, type: 'pine' },
        { x: 14, z: -3, scale: 1.2, type: 'oak' },
        { x: 13, z: 9, scale: 1.1, type: 'pine' },
        { x: 9, z: 12, scale: 1.0, type: 'oak' },
      ].map((tree, i) => (
        <group key={`tree_${i}`} position={[tree.x, 0, tree.z]} scale={[tree.scale, tree.scale, tree.scale]}>
          {/* Natural Wood Trunk */}
          <mesh position={[0, 0.8, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.3, 1.6, 6]} />
            <meshStandardMaterial color="#78350f" roughness={0.9} />
          </mesh>
          {tree.type === 'pine' ? (
            // Layered Vibrant Pine Foliage
            <>
              <mesh position={[0, 2.0, 0]} castShadow>
                <coneGeometry args={[1.2, 1.4, 6]} />
                <meshStandardMaterial color="#166534" roughness={0.7} />
              </mesh>
              <mesh position={[0, 2.8, 0]} castShadow>
                <coneGeometry args={[0.9, 1.2, 6]} />
                <meshStandardMaterial color="#15803d" roughness={0.7} />
              </mesh>
              <mesh position={[0, 3.5, 0]} castShadow>
                <coneGeometry args={[0.6, 1.0, 6]} />
                <meshStandardMaterial color="#22c55e" roughness={0.7} />
              </mesh>
            </>
          ) : (
            // Round Lush Oak Foliage
            <mesh position={[0, 2.2, 0]} castShadow>
              <dodecahedronGeometry args={[1.4]} />
              <meshStandardMaterial color="#15803d" roughness={0.7} />
            </mesh>
          )}
        </group>
      ))}

      {/* --- SCATTERED FIELD ROCKS (Natural Slate) --- */}
      {[
        { x: -6, z: 2, s: 0.3 },
        { x: 6, z: -2, s: 0.4 },
        { x: 5, z: 3, s: 0.25 },
        { x: -5, z: -7, s: 0.35 },
      ].map((rock, i) => (
        <mesh key={`rock_${i}`} position={[rock.x, rock.s * 0.4, rock.z]} scale={[rock.s, rock.s * 0.7, rock.s]} castShadow>
          <dodecahedronGeometry args={[1]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
};
