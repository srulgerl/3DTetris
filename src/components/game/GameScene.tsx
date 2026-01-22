import { Canvas, useFrame } from '@react-three/fiber';
// @ts-ignore
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import { Well } from './Well';
import { Tetromino } from './Tetromino';
import { GhostPiece } from './GhostPiece';
import { useKeyboardControls } from '../../hooks/useKeyboardControls';
import { useGameStore } from '../../stores/gameStore';
import { GAME_SPEED } from '../../constants';
// @ts-ignore
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useRef } from 'react';

const GameLoop = () => {
    const { tick, level, status } = useGameStore();
    const lastTick = useRef(0);

    // Speed calculation: (1000 - (level-1)*50) capped at 100ms
    const speed = Math.max(GAME_SPEED.MIN, GAME_SPEED.START - (level - 1) * GAME_SPEED.DECREMENT);

    useFrame((state) => {
        if (status !== 'PLAYING') return;

        const time = state.clock.getElapsedTime() * 1000;
        if (time - lastTick.current > speed) {
            tick();
            lastTick.current = time;
        }
    });

    return null;
};

export const GameScene = () => {
    useKeyboardControls();

    return (
        <Canvas shadows dpr={[1, 2]}>
            {/* Camera & Controls */}
            <PerspectiveCamera makeDefault position={[10, 20, 10]} fov={50} />
            <OrbitControls target={[3, 8, 3]} /> {/* Look at center of well (approx 3, 8, 3) */}

            {/* Lighting */}
            <ambientLight intensity={0.2} />
            <pointLight position={[10, 20, 10]} intensity={1} castShadow />
            <pointLight position={[-10, 10, -10]} intensity={0.5} color="blue" />

            {/* Game Elements */}
            <Well />
            <Tetromino />
            <GhostPiece />
            <GameLoop />

            {/* Environment */}
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

            {/* Post Processing */}
            <EffectComposer>
                <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} height={300} intensity={1.5} />
            </EffectComposer>
        </Canvas>
    );
};
