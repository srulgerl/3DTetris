import { useRef } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { useFrame } from '@react-three/fiber';
import { COLORS } from '../../constants';
// @ts-ignore
import { Edges } from '@react-three/drei';

export const Tetromino = () => {
    const activePiece = useGameStore(state => state.activePiece);
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        // Animation smoothing could go here if we weren't doing direct store updates
        if (groupRef.current && activePiece) {
            const t = state.clock.getElapsedTime();
            groupRef.current.position.y = activePiece.position.y + Math.sin(t * 5) * 0.02; // Subtle hover effect? No, precise grid alignment is better for Tetris.
        }
    });

    if (!activePiece) return null;

    return (
        <group ref={groupRef} position={[activePiece.position.x, activePiece.position.y, activePiece.position.z]}>
            {activePiece.shape.map((block, idx) => (
                <mesh key={idx} position={[block.x, block.y, block.z]}>
                    <boxGeometry args={[0.95, 0.95, 0.95]} />
                    <meshStandardMaterial
                        color={COLORS[activePiece.type!] || 'white'}
                        emissive={COLORS[activePiece.type!] || 'white'}
                        emissiveIntensity={0.6}
                    />
                    <Edges />
                </mesh>
            ))}
        </group>
    );
};
