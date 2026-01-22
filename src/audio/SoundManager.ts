import { Howl } from 'howler';

class SoundManager {
    private sounds: Record<string, Howl> = {};
    private muted: boolean = false;

    constructor() {
        // Placeholders - in a real app we'd load actual assets. 
        // For this demo, we'll try to use synthesized beeps or silent failures if no assets.
        // I will use some online placeholders or simple data URIs if possible, 
        // but for now let's assume assets exist in /public/sounds or similar.
        // Actually, since I can't easily fetch generic assets, I will create simple oscillators? 
        // No, Howler plays files. I will point to non-existent files which will 
        // just fail silently or log errors, but the structure is there.
        // Ideally, I should assume the user will add sounds.

        this.sounds = {
            move: new Howl({ src: ['/sounds/move.mp3'], volume: 0.5 }),
            rotate: new Howl({ src: ['/sounds/rotate.mp3'], volume: 0.5 }),
            drop: new Howl({ src: ['/sounds/drop.mp3'], volume: 0.8 }),
            clear: new Howl({ src: ['/sounds/clear.mp3'], volume: 1.0 }),
            levelup: new Howl({ src: ['/sounds/levelup.mp3'], volume: 1.0 }),
            gameover: new Howl({ src: ['/sounds/gameover.mp3'], volume: 1.0 }),
            bgm: new Howl({ src: ['/sounds/music.mp3'], volume: 0.3, loop: true }),
        };
    }

    play(key: string) {
        if (this.muted) return;
        if (this.sounds[key]) {
            this.sounds[key].play();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        Howler.mute(this.muted);
    }

    startMusic() {
        if (!this.sounds.bgm.playing()) {
            this.sounds.bgm.play();
        }
    }

    stopMusic() {
        this.sounds.bgm.stop();
    }

    setRate(rate: number) {
        this.sounds.bgm.rate(rate);
    }
}

export const soundManager = new SoundManager();
