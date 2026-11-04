import React from 'react';
import { CropId, GrowthStage } from '../../types/game';
import { CROPS } from '../simulation/cropConfig';

interface CropRendererProps {
  crop: CropId;
  stage: GrowthStage;
  health: number;
}

export const CropRenderer: React.FC<CropRendererProps> = ({ crop, stage, health }) => {
  const config = CROPS[crop];
  const isHealthy = health > 40;
  const leafColor = isHealthy ? config.color : '#a16207'; // sickly yellow-brown if dehydrated

  if (stage === 'empty') return null;

  // Stage 1: Seedling - Tiny sprout emerging from soil
  if (stage === 'seedling') {
    return (
      <group position={[0, 0.05, 0]}>
        {/* Tiny stem */}
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.16, 6]} />
          <meshStandardMaterial color={leafColor} roughness={0.6} />
        </mesh>
        {/* Two tiny leaves */}
        <mesh position={[0.04, 0.15, 0]} rotation={[0, 0, 0.5]}>
          <coneGeometry args={[0.04, 0.1, 5]} />
          <meshStandardMaterial color={leafColor} roughness={0.6} />
        </mesh>
        <mesh position={[-0.04, 0.15, 0]} rotation={[0, 0, -0.5]}>
          <coneGeometry args={[0.04, 0.1, 5]} />
          <meshStandardMaterial color={leafColor} roughness={0.6} />
        </mesh>
      </group>
    );
  }

  // Stage 2: Sprout - Growing bushier foliage
  if (stage === 'sprout') {
    return (
      <group position={[0, 0.08, 0]}>
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.03, 0.04, 0.3, 6]} />
          <meshStandardMaterial color={leafColor} roughness={0.6} />
        </mesh>
        <mesh position={[0.06, 0.22, 0.04]} rotation={[0.4, 0.3, 0.5]}>
          <coneGeometry args={[0.06, 0.18, 5]} />
          <meshStandardMaterial color={config.secondaryColor} roughness={0.6} />
        </mesh>
        <mesh position={[-0.06, 0.22, -0.04]} rotation={[-0.4, -0.3, -0.5]}>
          <coneGeometry args={[0.06, 0.18, 5]} />
          <meshStandardMaterial color={config.secondaryColor} roughness={0.6} />
        </mesh>
      </group>
    );
  }

  // Stages 3 & 4: Crop-specific stylized models
  switch (crop) {
    case 'wheat':
      return (
        <group position={[0, 0.1, 0]}>
          {/* Multiple wheat stalks */}
          {[-0.1, 0, 0.1].map((xOffset, idx) => (
            <group key={idx} position={[xOffset, 0, (idx % 2 === 0 ? 0.06 : -0.06)]} rotation={[0.05 * idx, 0, 0.08 * (idx - 1)]}>
              {/* Stalk */}
              <mesh position={[0, stage === 'mature' ? 0.32 : 0.22, 0]}>
                <cylinderGeometry args={[0.02, 0.025, stage === 'mature' ? 0.64 : 0.44, 5]} />
                <meshStandardMaterial color={stage === 'mature' ? '#ca8a04' : leafColor} roughness={0.5} />
              </mesh>
              {/* Golden Wheat Head if mature */}
              {stage === 'mature' && (
                <mesh position={[0, 0.65, 0]}>
                  <cylinderGeometry args={[0.05, 0.04, 0.28, 6]} />
                  <meshStandardMaterial color={config.fruitColor} roughness={0.4} />
                </mesh>
              )}
            </group>
          ))}
        </group>
      );

    case 'corn':
      return (
        <group position={[0, 0.1, 0]}>
          {/* Main tall stalk */}
          <mesh position={[0, stage === 'mature' ? 0.45 : 0.3, 0]}>
            <cylinderGeometry args={[0.04, 0.06, stage === 'mature' ? 0.9 : 0.6, 7]} />
            <meshStandardMaterial color={leafColor} roughness={0.5} />
          </mesh>
          {/* Broad arching corn leaves */}
          <mesh position={[0.12, 0.35, 0]} rotation={[0, 0, 0.7]}>
            <boxGeometry args={[0.3, 0.02, 0.08]} />
            <meshStandardMaterial color={config.secondaryColor} roughness={0.5} />
          </mesh>
          <mesh position={[-0.12, 0.45, 0]} rotation={[0, 0, -0.7]}>
            <boxGeometry args={[0.3, 0.02, 0.08]} />
            <meshStandardMaterial color={config.secondaryColor} roughness={0.5} />
          </mesh>
          {/* Golden corn cobs if mature */}
          {stage === 'mature' && (
            <>
              <mesh position={[0.08, 0.42, 0.05]} rotation={[0.3, 0.2, 0.4]}>
                <cylinderGeometry args={[0.045, 0.04, 0.22, 7]} />
                <meshStandardMaterial color={config.fruitColor} roughness={0.3} />
              </mesh>
              <mesh position={[-0.08, 0.52, -0.05]} rotation={[-0.3, -0.2, -0.4]}>
                <cylinderGeometry args={[0.045, 0.04, 0.22, 7]} />
                <meshStandardMaterial color={config.fruitColor} roughness={0.3} />
              </mesh>
            </>
          )}
        </group>
      );

    case 'carrot':
      return (
        <group position={[0, 0.08, 0]}>
          {/* Feathery carrot foliage */}
          <group position={[0, stage === 'mature' ? 0.28 : 0.2, 0]}>
            {[0, 1.2, 2.4, 3.6, 4.8].map((angle, i) => (
              <mesh key={i} rotation={[0.4, angle, 0]} position={[0, 0.05, 0]}>
                <coneGeometry args={[0.08, stage === 'mature' ? 0.35 : 0.25, 5]} />
                <meshStandardMaterial color={config.secondaryColor} roughness={0.5} />
              </mesh>
            ))}
          </group>
          {/* Orange carrot top peeking out of soil */}
          {stage === 'mature' && (
            <mesh position={[0, 0.06, 0]}>
              <coneGeometry args={[0.07, 0.16, 8]} />
              <meshStandardMaterial color={config.fruitColor} roughness={0.4} />
            </mesh>
          )}
        </group>
      );

    case 'tomato':
      return (
        <group position={[0, 0.08, 0]}>
          {/* Wooden climbing stake */}
          <mesh position={[0.06, 0.38, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.76, 5]} />
            <meshStandardMaterial color="#854d0e" roughness={0.9} />
          </mesh>
          {/* Bushy vine */}
          <mesh position={[0, stage === 'mature' ? 0.32 : 0.22, 0]}>
            <dodecahedronGeometry args={[stage === 'mature' ? 0.26 : 0.18]} />
            <meshStandardMaterial color={leafColor} roughness={0.6} />
          </mesh>
          {/* Red juicy tomatoes */}
          {stage === 'mature' && (
            <>
              <mesh position={[0.14, 0.32, 0.12]}>
                <sphereGeometry args={[0.07, 8, 8]} />
                <meshStandardMaterial color={config.fruitColor} roughness={0.2} metalness={0.1} />
              </mesh>
              <mesh position={[-0.12, 0.25, 0.1]}>
                <sphereGeometry args={[0.065, 8, 8]} />
                <meshStandardMaterial color={config.fruitColor} roughness={0.2} metalness={0.1} />
              </mesh>
              <mesh position={[0.05, 0.42, -0.12]}>
                <sphereGeometry args={[0.06, 8, 8]} />
                <meshStandardMaterial color={config.fruitColor} roughness={0.2} metalness={0.1} />
              </mesh>
            </>
          )}
        </group>
      );

    case 'potato':
      return (
        <group position={[0, 0.08, 0]}>
          {/* Bushy leafy mound */}
          <mesh position={[0, stage === 'mature' ? 0.22 : 0.15, 0]}>
            <sphereGeometry args={[stage === 'mature' ? 0.24 : 0.16, 7, 7]} />
            <meshStandardMaterial color={leafColor} roughness={0.7} />
          </mesh>
          {/* Leaves */}
          <mesh position={[0.1, 0.2, 0.08]} rotation={[0.3, 0.5, 0.2]}>
            <coneGeometry args={[0.09, 0.22, 5]} />
            <meshStandardMaterial color={config.secondaryColor} roughness={0.6} />
          </mesh>
          {/* Small flowering tops when mature */}
          {stage === 'mature' && (
            <mesh position={[0, 0.36, 0]}>
              <sphereGeometry args={[0.05, 6, 6]} />
              <meshStandardMaterial color="#c084fc" roughness={0.3} />
            </mesh>
          )}
        </group>
      );

    default:
      return null;
  }
};

