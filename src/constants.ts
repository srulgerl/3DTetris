export const GRID_SIZE = {
    COLS: 6,
    ROWS: 6,
    HEIGHT: 16,
};

export const COLORS = {
    // Classic Tetris colors
    I: '#00f0ff', // Cyan
    O: '#ffff00', // Yellow
    T: '#a000ff', // Purple
    S: '#00ff00', // Green
    Z: '#ff0000', // Red
    J: '#0000ff', // Blue
    L: '#ff7f00', // Orange

    // Visual style
    GHOST: '#ffffff40',
    GRID: '#2a2a2a',
    BORDER: '#444444',
    BACKGROUND: '#050505',
};

// Types
export type BlockType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L' | null;
export type Coordinate = { x: number; y: number; z: number };

// Shapes defined as offsets from a center [0,0,0]
// We assume 'y' is UP/DOWN (height in grid), but in standard Tetris logic 'y' usually means 'row' (vertical).
// In 3D engine (Three.js), Y is typically UP. Let's stick to X=Horizontal, Z=Depth, Y=Vertical (Height).
// But for grid coordinates, let's map: 
// Grid index [z][y][x] ? or [height][depth][width]?
// Let's use coordinate system:
// x: 0..COLS-1 (Width)
// z: 0..ROWS-1 (Depth)
// y: 0..HEIGHT-1 (Height/Vertical Stack)

export const TETROMINOS: Record<string, { shape: Coordinate[]; color: string }> = {
    I: {
        shape: [
            { x: -1, y: 0, z: 0 },
            { x: 0, y: 0, z: 0 },
            { x: 1, y: 0, z: 0 },
            { x: 2, y: 0, z: 0 },
        ],
        color: COLORS.I,
    },
    O: {
        shape: [
            { x: 0, y: 0, z: 0 },
            { x: 1, y: 0, z: 0 },
            { x: 0, y: 0, z: 1 },
            { x: 1, y: 0, z: 1 },
        ],
        color: COLORS.O,
    },
    T: {
        shape: [
            { x: -1, y: 0, z: 0 },
            { x: 0, y: 0, z: 0 },
            { x: 1, y: 0, z: 0 },
            { x: 0, y: 0, z: 1 },
        ],
        color: COLORS.T,
    },
    S: {
        shape: [
            { x: 0, y: 0, z: 0 },
            { x: 1, y: 0, z: 0 },
            { x: -1, y: 0, z: 1 },
            { x: 0, y: 0, z: 1 },
        ],
        color: COLORS.S,
    },
    Z: {
        shape: [
            { x: -1, y: 0, z: 0 },
            { x: 0, y: 0, z: 0 },
            { x: 0, y: 0, z: 1 },
            { x: 1, y: 0, z: 1 },
        ],
        color: COLORS.Z,
    },
    J: {
        shape: [
            { x: -1, y: 0, z: 0 }, // Left
            { x: 0, y: 0, z: 0 },  // Center
            { x: 1, y: 0, z: 0 },  // Right
            { x: -1, y: 0, z: 1 }, // Tail (Back-Left)
        ],
        color: COLORS.J,
    },
    L: {
        shape: [
            { x: -1, y: 0, z: 0 },
            { x: 0, y: 0, z: 0 },
            { x: 1, y: 0, z: 0 },
            { x: 1, y: 0, z: 1 }, // Tail (Back-Right)
        ],
        color: COLORS.L,
    },
};

export const SCORING = {
    SINGLE: 100,
    DOUBLE: 300,
    TRIPLE: 500,
    TETRIS: 800,
    SOFT_DROP: 1,
    HARD_DROP: 2,
};

export const GAME_SPEED = {
    START: 1000,
    DECREMENT: 50,
    MIN: 100,
};
