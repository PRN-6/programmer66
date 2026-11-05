import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { CropRenderer } from './CropRenderer';

export const FarmGrid: React.FC = () => {
  const tiles = useGameStore((s) => s.tiles);
  const gridWidth = useGameStore((s) => s.gridWidth);
  const gridHeight = useGameStore((s) => s.gridHeight);
  const selectedTileCoord = useGameStore((s) => s.selectedTileCoord);
  const selectTile = useGameStore((s) => s.selectTile);

  const [hoveredCoord, setHoveredCoord] = useState<{ x: number; y: number } | null>(null);

  // Center the grid around origin
  const offsetX = (gridWidth - 1) * 0.5;
  const offsetZ = (gridHeight - 1) * 0.5;

  const handleTileClick = (x: number, y: number) => {
    selectTile(x, y);

    const state = useGameStore.getState();
    const { activeTool, selectedSeed } = state;

    if (activeTool === 'plant') {
      state.plantCrop(x, y, selectedSeed);
    } else if (activeTool === 'water') {
      state.waterTile(x, y);
    } else if (activeTool === 'harvest') {
      state.harvestTile(x, y);
    } else if (activeTool === 'fertilize') {
      state.fertilizeTile(x, y);
    } else if (activeTool === 'clear') {
      state.clearWeeds(x, y);
    }
  };

  return (
    <group position={[-offsetX * 1.2, 0, -offsetZ * 1.2]}>
      {Object.values(tiles).map((tile) => {
        if (!tile.unlocked) return null;

        const posX = tile.x * 1.2;
        const posZ = tile.y * 1.2;
        const isSelected = selectedTileCoord?.x === tile.x && selectedTileCoord?.y === tile.y;
        const isHovered = hoveredCoord?.x === tile.x && hoveredCoord?.y === tile.y;

        // Natural soil moisture dynamics
        // Moisture 0: #a16207 (warm dry amber-brown) -> Moisture 100: #3b1d11 (deep moist rich loam)
        const moistureFactor = tile.moisture / 100;
        const r = Math.round(165 - moistureFactor * 105);
        const g = Math.round(100 - moistureFactor * 70);
        const b = Math.round(35 - moistureFactor * 20);
        const soilColor = `rgb(${r}, ${g}, ${b})`;

        return (
          <group key={`${tile.x}_${tile.y}`} position={[posX, 0, posZ]}>
            {/* Raised soil bed */}
            <mesh
              position={[0, 0.05, 0]}
              receiveShadow
              castShadow
              onClick={(e) => {
                e.stopPropagation();
                handleTileClick(tile.x, tile.y);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredCoord({ x: tile.x, y: tile.y });
              }}
              onPointerOut={() => {
                setHoveredCoord(null);
              }}
            >
              <boxGeometry args={[1.08, 0.1, 1.08]} />
              <meshStandardMaterial
                color={soilColor}
                roughness={0.9}
                metalness={0.05}
              />
            </mesh>

            {/* Natural wooden furrow borders */}
            <mesh position={[0, 0.06, 0.52]}>
              <boxGeometry args={[1.12, 0.06, 0.04]} />
              <meshStandardMaterial color="#78350f" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.06, -0.52]}>
              <boxGeometry args={[1.12, 0.06, 0.04]} />
              <meshStandardMaterial color="#78350f" roughness={0.8} />
            </mesh>
            <mesh position={[0.52, 0.06, 0]}>
              <boxGeometry args={[0.04, 0.06, 1.08]} />
              <meshStandardMaterial color="#78350f" roughness={0.8} />
            </mesh>
            <mesh position={[-0.52, 0.06, 0]}>
              <boxGeometry args={[0.04, 0.06, 1.08]} />
              <meshStandardMaterial color="#78350f" roughness={0.8} />
            </mesh>

            {/* Weeds if infested */}
            {tile.weedLevel > 20 && (
              <group position={[0.2, 0.1, 0.2]}>
                <mesh rotation={[0, 0.5, 0.2]}>
                  <coneGeometry args={[0.08, 0.15, 4]} />
                  <meshStandardMaterial color="#36453b" roughness={0.8} />
                </mesh>
              </group>
            )}

            {/* Crop Visualization */}
            {tile.crop && (
              <CropRenderer
                crop={tile.crop}
                stage={tile.stage}
                health={tile.health}
              />
            )}

            {/* Selection Outline / Ring - Silver / White */}
            {isSelected && (
              <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.55, 0.62, 32]} />
                <meshBasicMaterial color="#e4e4e7" />
              </mesh>
            )}

            {/* Hover Outline - Subtle Gray */}
            {isHovered && !isSelected && (
              <mesh position={[0, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.54, 0.58, 32]} />
                <meshBasicMaterial color="#71717a" transparent opacity={0.8} />
              </mesh>
            )}

            {/* Water Moisture Sheen when wet */}
            {tile.moisture > 75 && (
              <mesh position={[0, 0.102, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[1.0, 1.0]} />
                <meshStandardMaterial
                  color="#94a3b8"
                  roughness={0.15}
                  metalness={0.8}
                  transparent
                  opacity={0.18}
                />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
};
