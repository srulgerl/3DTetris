import { useMemo } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { GRID_SIZE, COLORS } from '../../constants';
// @ts-ignore
import { Instance, Instances } from '@react-three/drei';

export const Well = () => {
    const grid = useGameStore(state => state.grid);

    // We can use InstancedMesh for performance, but mapped components are easier for state updates initially.
    // For 6x6x16 = 576 blocks max, individual meshes are fine.

    // Flatten grid for rendering
    const blocks = useMemo(() => {
        const b = [];
        for (let y = 0; y < GRID_SIZE.HEIGHT; y++) {
            for (let z = 0; z < GRID_SIZE.ROWS; z++) {
                for (let x = 0; x < GRID_SIZE.COLS; x++) {
                    const cell = grid[y][z][x];
                    if (cell) {
                        b.push({ x, y, z, ...cell });
                    }
                }
            }
        }
        return b;
    }, [grid]);

    return (
        <group>
            {/* Grid Container Visualization (Wireframe) */}
            <mesh position={[GRID_SIZE.COLS / 2 - 0.5, GRID_SIZE.HEIGHT / 2 - 0.5, GRID_SIZE.ROWS / 2 - 0.5]}>
                <boxGeometry args={[GRID_SIZE.COLS, GRID_SIZE.HEIGHT, GRID_SIZE.ROWS]} />
                <meshBasicMaterial color={COLORS.BORDER} wireframe transparent opacity={0.3} />
            </mesh>

            {/* Floor */}
            <mesh position={[GRID_SIZE.COLS / 2 - 0.5, -0.6, GRID_SIZE.ROWS / 2 - 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[GRID_SIZE.COLS, GRID_SIZE.ROWS]} />
                <meshBasicMaterial color={COLORS.GRID} transparent opacity={0.5} />
            </mesh>

            {/* Placed Blocks */}
            {blocks.map((block) => (
                <mesh
                    key={block.id || `${block.x}-${block.y}-${block.z}`}
                    position={[block.x, block.y, block.z]}
                >
                    <boxGeometry args={[0.95, 0.95, 0.95]} />
                    <meshStandardMaterial
                        color={block.isSpecial ? 'white' : block.color}
                        emissive={block.isSpecial ? 'white' : block.color}
                        emissiveIntensity={block.isSpecial ? 1 : 0.5}
                    />
                </mesh>
            ))}
        </group>
    );
};
