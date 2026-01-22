import { useGameStore } from '../../stores/gameStore';

export const UI = () => {
    const { score, level, linesCleared, status, startNewGame, resumeGame } = useGameStore();

    if (status === 'MENU' || status === 'GAMEOVER') {
        return (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white z-10 p-8 backdrop-blur-sm">
                <h1 className="text-6xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
                    3D TETRIS
                </h1>

                {status === 'GAMEOVER' && (
                    <div className="mb-8 text-center text-red-500">
                        <h2 className="text-4xl">GAME OVER</h2>
                        <p className="text-xl text-white mt-2">Final Score: {score}</p>
                    </div>
                )}

                <button
                    onClick={startNewGame}
                    className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-xl font-bold transition-all shadow-[0_0_20px_rgba(8,145,178,0.5)]"
                >
                    {status === 'MENU' ? 'START GAME' : 'PLAY AGAIN'}
                </button>

                <div className="mt-12 text-sm text-gray-400 max-w-md text-center">
                    <h3 className="text-white font-bold mb-2">Controls</h3>
                    <p>WASD / QE to Rotate</p>
                    <p>Arrows to Move</p>
                    <p>SPACE to Hard Drop</p>
                    <p>SHIFT to Soft Drop</p>
                    <p>Mouse Drag to Rotate Camera</p>
                </div>
            </div>
        );
    }

    return (
        <div className="absolute top-0 left-0 p-8 text-white z-10 w-full pointer-events-none">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold text-cyan-400">{score.toLocaleString()}</h2>
                    <p className="text-gray-400">SCORE</p>
                </div>

                <div className="text-right">
                    <div className="mb-4">
                        <h3 className="text-2xl font-bold text-purple-400">{level}</h3>
                        <p className="text-gray-400">LEVEL</p>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-green-400">{linesCleared}</h3>
                        <p className="text-gray-400">LINES</p>
                    </div>
                </div>
            </div>

            {status === 'PAUSED' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
                    <div className="bg-black/80 p-8 rounded-lg text-center backdrop-blur-md border border-white/10">
                        <h2 className="text-4xl font-bold mb-4">PAUSED</h2>
                        <button
                            onClick={resumeGame}
                            className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded transition-colors"
                        >
                            RESUME
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
