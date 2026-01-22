import { useGameStore } from '../../stores/gameStore';
import { COLORS, GRID_SIZE } from '../../constants';

// Helper to check collision (duplicated from store for projection logic, 
// ideally export logic from store or utils)
const checkCollision = (grid: any, position: any, shape: any) => {
    for (const block of shape) {
        const x = position.x + block.x;
        const y = position.y + block.y;
        const z = position.z + block.z;
        if (x < 0 || x >= GRID_SIZE.COLS || z < 0 || z >= GRID_SIZE.ROWS || y < 0) return true;
        if (y < GRID_SIZE.HEIGHT && grid[y] && grid[y][z] && grid[y][z][x] !== null) return true;
    }
    return false;
};

export const GhostPiece = () => {
    const { activePiece, grid } = useGameStore();

    if (!activePiece) return null;

    // Calculate ghost position
    let ghostY = activePiece.position.y;
    while (!checkCollision(grid, { ...activePiece.position, y: ghostY - 1 }, activePiece.shape)) {
        ghostY--;
    }

    return (
        <group position={[activePiece.position.x, ghostY, activePiece.position.z]}>
            {activePiece.shape.map((block, idx) => (
                <mesh key={idx} position={[block.x, block.y, block.z]}>
                    <boxGeometry args={[0.95, 0.95, 0.95]} />
                    <meshStandardMaterial
                        color={COLORS.GHOST}
                        transparent
                        opacity={0.3}
                        wireframe
                    />
                </mesh>
            ))}
        </group>
    );
};
