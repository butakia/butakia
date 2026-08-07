let cachedAudio: HTMLAudioElement | null = null;
let unlocked = false;

function getAudio(): HTMLAudioElement {
  if (!cachedAudio) {
    cachedAudio = new Audio("/sounds/page-flip.m4a");
    cachedAudio.preload = "auto";
  }
  return cachedAudio;
}

/**
 * Mobile browsers (especially iOS Safari) only allow audio playback that starts
 * synchronously inside a real user gesture (tap/click) — react-pageflip's `onFlip`
 * callback fires a tick or two after the gesture that triggered it, which is late
 * enough to get silently blocked. Playing (and instantly pausing) the element inside
 * the very first tap/click on the page "unlocks" it for the rest of the session, so
 * later programmatic `.play()` calls from `playPageFlipSound` succeed normally.
 */
export function unlockPageFlipSound() {
  if (unlocked || typeof window === "undefined") return;
  const audio = getAudio();
  const unlock = () => {
    if (unlocked) return;
    unlocked = true;
    audio
      .play()
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
      })
      .catch(() => {
        // Still locked (e.g. iOS requiring a stricter gesture) — next real flip's
        // play() call will simply retry the unlock on its own.
        unlocked = false;
      });
  };
  document.addEventListener("pointerdown", unlock, { once: true, passive: true });
  document.addEventListener("keydown", unlock, { once: true });
}

export function playPageFlipSound(volume = 0.6) {
  try {
    const audio = getAudio();
    audio.volume = Math.min(1, Math.max(0, volume));
    // Restart from the beginning even if a previous flip's sound is still playing.
    audio.currentTime = 0;
    void audio.play().catch(() => {
      // Autoplay/interaction restrictions — ignore, sound is a nice-to-have.
    });
  } catch {
    // Audio unavailable — never break the reader over a sound effect.
  }
}
