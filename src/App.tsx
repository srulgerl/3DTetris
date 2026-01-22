import { GameScene } from './components/game/GameScene';
import { UI } from './components/ui/UI';

function App() {
    return (
        <div className="relative w-screen h-screen bg-black overflow-hidden font-mono antialiased">
            <GameScene />
            <UI />
        </div>
    )
}

export default App
