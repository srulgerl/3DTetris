import { useEffect, useCallback } from 'react';
import { useGameStore } from '../stores/gameStore';

export const useKeyboardControls = () => {
    const { movePiece, rotatePiece, hardDrop, pauseGame, resumeGame, status, startNewGame } = useGameStore();

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (status === 'GAMEOVER') {
            if (e.key === 'Enter') startNewGame();
            return;
        }

        // Global toggles
        if (e.key === 'p' || e.key === 'Escape') {
            if (status === 'PLAYING') pauseGame();
            else if (status === 'PAUSED') resumeGame();
            return;
        }

        if (status !== 'PLAYING') return;

        switch (e.key) {
            // Movement (Arrow Keys)
            case 'ArrowUp':
                movePiece(0, 0, -1); // Forward (Z-)
                break;
            case 'ArrowDown':
                movePiece(0, 0, 1); // Backward (Z+)
                break;
            case 'ArrowLeft':
                movePiece(-1, 0, 0); // Left (X-)
                break;
            case 'ArrowRight':
                movePiece(1, 0, 0); // Right (X+)
                break;

            // Soft Drop
            case 'Shift':
                movePiece(0, -1, 0);
                break;

            // Hard Drop
            case ' ':
                hardDrop();
                break;

            // Rotation
            case 'q':
                rotatePiece('y', 1);
                break;
            case 'e':
                rotatePiece('y', -1);
                break;
            case 'w':
                rotatePiece('x', 1);
                break;
            case 's':
                rotatePiece('x', -1);
                break;
            case 'a':
                rotatePiece('z', 1);
                break;
            case 'd':
                rotatePiece('z', -1);
                break;
        }
    }, [movePiece, rotatePiece, hardDrop, pauseGame, resumeGame, status, startNewGame]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
};
