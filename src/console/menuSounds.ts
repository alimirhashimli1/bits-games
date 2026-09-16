import { playTone } from '@shared/audio/sfx';

export type MenuSound = 'move' | 'start' | 'denied';

const MENU_SOUNDS: Readonly<Record<MenuSound, () => void>> = {
  move: () => playTone({ frequency: 880, duration: 0.04 }),
  start: () => {
    playTone({ frequency: 523, duration: 0.08 });
    playTone({ frequency: 784, duration: 0.08, delay: 0.08 });
    playTone({ frequency: 1047, duration: 0.2, delay: 0.16 });
  },
  denied: () => playTone({ frequency: 200, duration: 0.18, waveform: 'sawtooth', slideTo: 80 }),
};

export function playMenuSound(sound: MenuSound): void {
  MENU_SOUNDS[sound]();
}
