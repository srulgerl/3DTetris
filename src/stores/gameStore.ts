import { create } from 'zustand';
import { GRID_SIZE, TETROMINOS, SCORING, BlockType, Coordinate } from '../constants';
import { v4 as uuidv4 } from 'uuid';
import { soundManager } from '../audio/SoundManager';

// Types
type GridCell = {
    color: string;
    type: BlockType;
    isSpecial?: boolean; // For Rule C
    id?: string; // For stable React keys
};

// 3D Grid: [y][z][x] -> access as grid[y][z][x]
type Grid = (GridCell | null)[][][];

interface GameState {
    grid: Grid;
    score: number;
    level: number;
    linesCleared: number;
    highScore: number;
    status: 'MENU' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';

    // Active Piece
    activePiece: {
        type: BlockType;
        position: Coordinate; // x, y (height), z
        shape: Coordinate[]; // current rotated shape offsets
        rotationIndex: number;
    } | null;

    // Actions
    startNewGame: () => void;
    pauseGame: () => void;
    resumeGame: () => void;
    movePiece: (dx: number, dy: number, dz: number) => void;
    rotatePiece: (axis: 'x' | 'y' | 'z', direction: 1 | -1) => void;
    hardDrop: () => void;
    tick: () => void; // Game loop tick (gravity)

    // Internal (but exposed for hooks if needed)
    spawnNewPiece: () => void;
    lockPiece: () => void;
}

// Helpers
const createEmptyGrid = (): Grid =>
    Array.from({ length: GRID_SIZE.HEIGHT }, () =>
        Array.from({ length: GRID_SIZE.ROWS }, () =>
            Array(GRID_SIZE.COLS).fill(null)
        )
    );

const getRandomTetromino = () => {
    const types = Object.keys(TETROMINOS) as BlockType[];
    const type = types[Math.floor(Math.random() * types.length)];
    return {
        type,
        ...TETROMINOS[type!]
    };
};

const checkCollision = (grid: Grid, position: Coordinate, shape: Coordinate[]) => {
    for (const block of shape) {
        const x = position.x + block.x;
        const y = position.y + block.y;
        const z = position.z + block.z;

        // Boundary check
        if (x < 0 || x >= GRID_SIZE.COLS ||
            z < 0 || z >= GRID_SIZE.ROWS ||
            y < 0) {
            return true;
        }

        // Grid check
        if (y < GRID_SIZE.HEIGHT && grid[y] && grid[y][z] && grid[y][z][x] !== null) {
            return true;
        }
    }
    return false;
};

const rotatePoint = (point: Coordinate, axis: 'x' | 'y' | 'z', dir: 1 | -1): Coordinate => {
    const { x, y, z } = point;
    // 90 degree rotations
    if (axis === 'x') {
        return { x, y: -z * dir, z: y * dir };
    } else if (axis === 'y') {
        return { x: z * dir, y, z: -x * dir };
    } else { // z
        return { x: -y * dir, y: x * dir, z };
    }
};

export const useGameStore = create<GameState>((set, get) => ({
    grid: createEmptyGrid(),
    score: 0,
    level: 1,
    linesCleared: 0,
    highScore: parseInt(localStorage.getItem('tetris3d_highscore') || '0'),
    status: 'MENU',
    activePiece: null,

    startNewGame: () => {
        soundManager.startMusic();
        set({
            grid: createEmptyGrid(),
            score: 0,
            level: 1,
            linesCleared: 0,
            status: 'PLAYING',
            activePiece: null,
        });
        get().spawnNewPiece();
    },

    pauseGame: () => {
        set((state) => ({ status: state.status === 'PLAYING' ? 'PAUSED' : state.status }));
    },
    resumeGame: () => set((state) => ({ status: state.status === 'PAUSED' ? 'PLAYING' : state.status })),

    movePiece: (dx, dy, dz) => {
        const { grid, activePiece, status } = get();
        if (status !== 'PLAYING' || !activePiece) return;

        const newPos = {
            x: activePiece.position.x + dx,
            y: activePiece.position.y + dy,
            z: activePiece.position.z + dz
        };

        if (!checkCollision(grid, newPos, activePiece.shape)) {
            set({ activePiece: { ...activePiece, position: newPos } });
            soundManager.play('move');
        }
    },

    rotatePiece: (axis, dir) => {
        const { grid, activePiece, status } = get();
        if (status !== 'PLAYING' || !activePiece) return;

        const newShape = activePiece.shape.map(p => rotatePoint(p, axis, dir));

        // Wall kick/Correction
        const kicks = [
            { x: 0, y: 0, z: 0 },
            { x: dir, y: 0, z: 0 }, { x: -dir, y: 0, z: 0 }, // Shift X
            { x: 0, y: 0, z: dir }, { x: 0, y: 0, z: -dir }, // Shift Z
            { x: 0, y: 1, z: 0 },  // Shift Y up (rare but useful at bottom)
        ];

        for (const kick of kicks) {
            const testPos = {
                x: activePiece.position.x + kick.x,
                y: activePiece.position.y + kick.y,
                z: activePiece.position.z + kick.z
            };
            if (!checkCollision(grid, testPos, newShape)) {
                set({
                    activePiece: {
                        ...activePiece,
                        position: testPos,
                        shape: newShape
                    }
                });
                soundManager.play('rotate');
                return;
            }
        }
    },

    hardDrop: () => {
        const { grid, activePiece, status } = get();
        if (status !== 'PLAYING' || !activePiece) return;

        let y = activePiece.position.y;
        // Move down until collision
        while (!checkCollision(grid, { ...activePiece.position, y: y - 1 }, activePiece.shape)) {
            y--;
        }

        set({ activePiece: { ...activePiece, position: { ...activePiece.position, y } } });
        soundManager.play('drop');
        get().lockPiece();
    },

    tick: () => {
        const { status, activePiece, grid } = get();
        if (status !== 'PLAYING') return;

        if (!activePiece) {
            get().spawnNewPiece();
        } else {
            const newPos = { ...activePiece.position, y: activePiece.position.y - 1 };
            if (checkCollision(grid, newPos, activePiece.shape)) {
                get().lockPiece();
            } else {
                set({ activePiece: { ...activePiece, position: newPos } });
            }
        }
    },

    spawnNewPiece: () => {
        const { grid } = get();
        const pieceData = getRandomTetromino();
        const startPos = {
            x: Math.floor(GRID_SIZE.COLS / 2),
            y: GRID_SIZE.HEIGHT,
            z: Math.floor(GRID_SIZE.ROWS / 2)
        };

        if (checkCollision(grid, startPos, pieceData.shape)) {
            set({ status: 'GAMEOVER' });
            soundManager.play('gameover');
        } else {
            set({
                activePiece: {
                    type: pieceData.type,
                    position: startPos,
                    shape: pieceData.shape,
                    rotationIndex: 0
                }
            });
        }
    },

    lockPiece: () => {
        const { grid, activePiece, score, linesCleared, level } = get();
        if (!activePiece) return;

        const newGrid = grid.map(layer => layer.map(row => [...row]));

        // Lock blocks
        for (const block of activePiece.shape) {
            const x = activePiece.position.x + block.x;
            const y = activePiece.position.y + block.y;
            const z = activePiece.position.z + block.z;

            // Check for Game Over (Stack overflow)
            if (y >= GRID_SIZE.HEIGHT) {
                set({ status: 'GAMEOVER' });
                soundManager.play('gameover');
                return;
            }

            if (y >= 0 && y < GRID_SIZE.HEIGHT && z >= 0 && z < GRID_SIZE.ROWS && x >= 0 && x < GRID_SIZE.COLS) {
                newGrid[y][z][x] = {
                    color: TETROMINOS[activePiece.type!]?.color || 'white',
                    type: activePiece.type,
                    id: uuidv4()
                };
            }
        }

        // Check clears (Full 6x6 layers)
        let clearedCount = 0;
        const remainingLayers: (GridCell | null)[][][] = [];

        for (let y = 0; y < GRID_SIZE.HEIGHT; y++) {
            let isFull = true;
            for (let z = 0; z < GRID_SIZE.ROWS; z++) {
                for (let x = 0; x < GRID_SIZE.COLS; x++) {
                    if (!newGrid[y][z][x]) {
                        isFull = false;
                        break;
                    }
                }
                if (!isFull) break;
            }

            if (isFull) {
                clearedCount++;
            } else {
                remainingLayers.push(newGrid[y]);
            }
        }

        while (remainingLayers.length < GRID_SIZE.HEIGHT) {
            remainingLayers.push(
                Array.from({ length: GRID_SIZE.ROWS }, () => Array(GRID_SIZE.COLS).fill(null))
            );
        }

        // Rule C
        const C = 3;
        const previousTotal = linesCleared;
        const newTotal = linesCleared + clearedCount;
        const shouldInject = Math.floor(newTotal / C) > Math.floor(previousTotal / C);

        if (shouldInject) {
            const filledCells: { y: number, z: number, x: number }[] = [];
            remainingLayers.forEach((layer, y) => {
                layer.forEach((row, z) => {
                    row.forEach((cell, x) => {
                        if (cell) filledCells.push({ y, z, x });
                    });
                });
            });

            if (filledCells.length > 0) {
                const rand = filledCells[Math.floor(Math.random() * filledCells.length)];
                const cell = remainingLayers[rand.y][rand.z][rand.x];
                if (cell) cell!.isSpecial = true;
            }
        }

        const points = [0, SCORING.SINGLE, SCORING.DOUBLE, SCORING.TRIPLE, SCORING.TETRIS];
        const newScore = score + (points[clearedCount] || (clearedCount * 200)) * level;
        const newLevel = Math.floor(newTotal / 10) + 1;

        if (clearedCount > 0) soundManager.play('clear');
        if (newLevel > level) soundManager.play('levelup');
        soundManager.setRate(1 + (newLevel - 1) * 0.1);

        set({
            grid: remainingLayers,
            score: newScore,
            linesCleared: newTotal,
            level: newLevel,
            activePiece: null,
        });

        const currentHigh = get().highScore;
        if (newScore > currentHigh) {
            localStorage.setItem('tetris3d_highscore', newScore.toString());
            set({ highScore: newScore });
        }
    },
}));
