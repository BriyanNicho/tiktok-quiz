import { useCallback } from 'react';
import { Howl } from 'howler';

// Preload sounds
// Note: You need to place actual mp3 files in /public/sounds/
const sounds = {
    correct: new Howl({ src: ['/sounds/correct.mp3'], volume: 0.5 }),
    wrong: new Howl({ src: ['/sounds/wrong.mp3'], volume: 0.4 }),
    tick: new Howl({ src: ['/sounds/tick.mp3'], volume: 0.3 }),
    gift: new Howl({ src: ['/sounds/gift.mp3'], volume: 0.6 }),
    winner: new Howl({ src: ['/sounds/winner.mp3'], volume: 0.7 }),
    combo: new Howl({ src: ['/sounds/combo.mp3'], volume: 0.6 })
};

export function useSoundEffects() {

    const play = useCallback((type) => {
        if (sounds[type]) {
            sounds[type].play();
        }
    }, []);

    // Helper specific functions
    const playCorrect = () => play('correct');
    const playWrong = () => play('wrong');
    const playTick = () => play('tick');
    const playGift = () => play('gift');
    const playWinner = () => play('winner');
    const playCombo = () => play('combo');

    return {
        play,
        playCorrect,
        playWrong,
        playTick,
        playGift,
        playWinner,
        playCombo
    };
}
