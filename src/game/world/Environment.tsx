import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const Environment: React.FC = () => {
  const windmillBladesRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (windmillBladesRef.current) {
      windmillBladesRef.current.rotation.z += delta * 1.0;
    }
  });

  return (
    <group>
      {/* Expansive Terrain Base - Sleek Dark Slate / Charcoal */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[48, 0.2, 48]} />
        <meshStandardMaterial color="#1a1c20" roughness={0.92} metalness={0.08} />
      </mesh>

      {/* Farm boundary stone / gravel pathway */}
      <mesh position={[0, -0.04, 0]} receiveShadow>
        <boxGeometry args={[11, 0.21, 11]} />
        <meshStandardMaterial color="#26282e" roughness={0.95} />
      </mesh>

      {/* Inner field ground clearing */}
      <mesh position={[0, -0.03, 0]} receiveShadow>
        <boxGeometry args={[9.5, 0.22, 9.5]} />
        <meshStandardMaterial color="#1f2227" roughness={0.88} />
      </mesh>

      {/* --- RUSTIC CHARCOAL FARMHOUSE --- */}
      <group position={[-8, 0, -4]} rotation={[0, 0.4, 0]}>
        {/* Main Building Base */}
        <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.2, 2.4, 2.8]} />
          <meshStandardMaterial color="#2a2d33" roughness={0.8} />
        </mesh>
        {/* Pitched Roof */}
        <mesh position={[0, 2.9, 0]} rotation={[0, 0, 0]} castShadow>
          <coneGeometry args={[2.5, 1.4, 4]} />
          <meshStandardMaterial color="#181a1e" roughness={0.6} />
        </mesh>
        {/* Chimney */}
        <mesh position={[0.9, 3.1, 0.5]} castShadow>
          <boxGeometry args={[0.4, 1.0, 0.4]} />
          <meshStandardMaterial color="#363942" roughness={0.9} />
        </mesh>
        {/* Wooden Porch */}
        <mesh position={[0, 0.2, 1.6]} castShadow receiveShadow>
          <boxGeometry args={[3.4, 0.2, 0.8]} />
          <meshStandardMaterial color="#1e2025" roughness={0.8} />
        </mesh>
        {/* Front Door */}
        <mesh position={[0, 0.9, 1.41]}>
          <boxGeometry args={[0.7, 1.4, 0.05]} />
          <meshStandardMaterial color="#15171b" roughness={0.7} />
        </mesh>
        {/* Windows with soft warm interior glow */}
        <mesh position={[-0.8, 1.3, 1.41]}>
          <boxGeometry args={[0.6, 0.6, 0.05]} />
          <meshStandardMaterial color="#fef08a" roughness={0.2} emissive="#fef08a" emissiveIntensity={0.35} />
        </mesh>
        <mesh position={[0.8, 1.3, 1.41]}>
          <boxGeometry args={[0.6, 0.6, 0.05]} />
          <meshStandardMaterial color="#fef08a" roughness={0.2} emissive="#fef08a" emissiveIntensity={0.35} />
        </mesh>
      </group>

      {/* --- WEATHERED GRAPHITE BARN --- */}
      <group position={[7.5, 0, -6]} rotation={[0, -0.3, 0]}>
        {/* Barn walls */}
        <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.2, 3.6, 3.4]} />
          <meshStandardMaterial color="#22252a" roughness={0.8} />
        </mesh>
        {/* Gambrel Barn Roof */}
        <mesh position={[0, 4.0, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <cylinderGeometry args={[2.4, 2.4, 4.4, 4]} />
          <meshStandardMaterial color="#16181b" roughness={0.6} />
        </mesh>
        {/* Big Sliding Barn Doors */}
        <mesh position={[0, 1.2, 1.72]}>
          <boxGeometry args={[1.8, 2.4, 0.06]} />
          <meshStandardMaterial color="#131518" roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.2, 1.76]}>
          <boxGeometry args={[1.6, 0.08, 0.05]} />
          <meshStandardMaterial color="#474d57" roughness={0.6} />
        </mesh>
      </group>

      {/* --- STONE WINDMILL WITH ROTATING BLADES --- */}
      <group position={[-7.5, 0, 6]}>
        {/* Tapered Stone Tower */}
        <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.8, 1.4, 5, 8]} />
          <meshStandardMaterial color="#333740" roughness={0.85} />
        </mesh>
        {/* Cap Dome */}
        <mesh position={[0, 5.2, 0]} castShadow>
          <sphereGeometry args={[0.9, 8, 8]} />
          <meshStandardMaterial color="#1f2228" roughness={0.6} />
        </mesh>
        {/* Rotating Blades */}
        <group ref={windmillBladesRef} position={[0, 5.2, 0.95]}>
          {/* Center Hub */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.2, 8]} />
            <meshStandardMaterial color="#181a1e" />
          </mesh>
          {/* 4 Weathered Sail Blades */}
          {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, idx) => (
            <group key={idx} rotation={[0, 0, angle]}>
              <mesh position={[0, 1.6, 0]}>
                <boxGeometry args={[0.3, 2.8, 0.03]} />
                <meshStandardMaterial color="#4b505c" roughness={0.7} />
              </mesh>
              <mesh position={[0, 1.6, -0.01]}>
                <boxGeometry args={[0.08, 3.2, 0.05]} />
                <meshStandardMaterial color="#1c1e22" roughness={0.8} />
              </mesh>
            </group>
          ))}
        </group>
      </group>

      {/* --- WATER POND & DOCK --- */}
      <group position={[7.5, 0, 5]}>
        {/* Pond depression ring */}
        <mesh position={[0, 0.02, 0]} receiveShadow>
          <cylinderGeometry args={[2.5, 2.8, 0.1, 16]} />
          <meshStandardMaterial color="#1a1c21" roughness={0.8} />
        </mesh>
        {/* Shimmering Obsidian Water Surface */}
        <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[2.3, 24]} />
          <meshStandardMaterial
            color="#0f172a"
            roughness={0.12}
            metalness={0.85}
            transparent
            opacity={0.9}
          />
        </mesh>
        {/* Small Dark Wood Pier */}
        <mesh position={[-1.2, 0.14, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.4, 0.08, 0.8]} />
          <meshStandardMaterial color="#25282f" roughness={0.8} />
        </mesh>
      </group>

      {/* --- WOODEN POST FENCES (Dark Weathered Timber) --- */}
      {[-5.2, 5.2].map((x) =>
        [-4, -2, 0, 2, 4].map((z) => (
          <group key={`fence_v_${x}_${z}`} position={[x, 0.35, z]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.05, 0.05, 0.7, 6]} />
              <meshStandardMaterial color="#2d3037" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.15, 0]}>
              <boxGeometry args={[0.04, 0.06, 2.0]} />
              <meshStandardMaterial color="#24262c" roughness={0.8} />
            </mesh>
            <mesh position={[0, -0.15, 0]}>
              <boxGeometry args={[0.04, 0.06, 2.0]} />
              <meshStandardMaterial color="#24262c" roughness={0.8} />
            </mesh>
          </group>
        ))
      )}

      {/* --- STYLIZED PINE & OAK TREES (Muted Nordic Pine & Bark) --- */}
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
          {/* Trunk */}
          <mesh position={[0, 0.8, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.3, 1.6, 6]} />
            <meshStandardMaterial color="#1a1c20" roughness={0.9} />
          </mesh>
          {tree.type === 'pine' ? (
            // Layered Pine foliage
            <>
              <mesh position={[0, 2.0, 0]} castShadow>
                <coneGeometry args={[1.2, 1.4, 6]} />
                <meshStandardMaterial color="#1c241e" roughness={0.8} />
              </mesh>
              <mesh position={[0, 2.8, 0]} castShadow>
                <coneGeometry args={[0.9, 1.2, 6]} />
                <meshStandardMaterial color="#222d25" roughness={0.8} />
              </mesh>
              <mesh position={[0, 3.5, 0]} castShadow>
                <coneGeometry args={[0.6, 1.0, 6]} />
                <meshStandardMaterial color="#29362c" roughness={0.8} />
              </mesh>
            </>
          ) : (
            // Round Oak foliage
            <mesh position={[0, 2.2, 0]} castShadow>
              <dodecahedronGeometry args={[1.4]} />
              <meshStandardMaterial color="#243027" roughness={0.8} />
            </mesh>
          )}
        </group>
      ))}

      {/* --- SCATTERED FIELD ROCKS (Granite Slate) --- */}
      {[
        { x: -6, z: 2, s: 0.3 },
        { x: 6, z: -2, s: 0.4 },
        { x: 5, z: 3, s: 0.25 },
        { x: -5, z: -7, s: 0.35 },
      ].map((rock, i) => (
        <mesh key={`rock_${i}`} position={[rock.x, rock.s * 0.4, rock.z]} scale={[rock.s, rock.s * 0.7, rock.s]} castShadow>
          <dodecahedronGeometry args={[1]} />
          <meshStandardMaterial color="#3f434d" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
};
