/**
 * SD-QUEST ZERO-DEPENDENCY WEB AUDIO SOUND SYNTHESIZER
 * Generates dark fantasy system audio cues purely through Web Audio API.
 * 100% offline-compatible, 0 external asset latency.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Quest Complete Sound: Deep resonant metallic system chime with mana shimmer.
 */
export function playQuestCompleteSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Primary Chime
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = "sine";
  osc1.frequency.setValueAtTime(523.25, now); // C5
  osc1.frequency.exponentialRampToValueAtTime(1046.5, now + 0.15); // C6

  gain1.gain.setValueAtTime(0.25, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

  osc1.connect(gain1);
  gain1.connect(ctx.destination);

  osc1.start(now);
  osc1.stop(now + 0.8);

  // Mana Harmonic Shimmer
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = "triangle";
  osc2.frequency.setValueAtTime(659.25, now + 0.05); // E5
  osc2.frequency.exponentialRampToValueAtTime(1318.5, now + 0.25); // E6

  gain2.gain.setValueAtTime(0.15, now + 0.05);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

  osc2.connect(gain2);
  gain2.connect(ctx.destination);

  osc2.start(now + 0.05);
  osc2.stop(now + 0.9);
}

/**
 * Set Complete Sound: Heavy iron clank / satisfying plate thud.
 */
export function playSetCompleteSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Low frequency thud
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(160, now);
  osc.frequency.exponentialRampToValueAtTime(45, now + 0.15);

  gain.gain.setValueAtTime(0.35, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.3);

  // High metal click
  const click = ctx.createOscillator();
  const clickGain = ctx.createGain();
  click.type = "sine";
  click.frequency.setValueAtTime(1200, now);
  click.frequency.exponentialRampToValueAtTime(400, now + 0.05);

  clickGain.gain.setValueAtTime(0.18, now);
  clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  click.connect(clickGain);
  clickGain.connect(ctx.destination);

  click.start(now);
  click.stop(now + 0.08);
}

/**
 * Level Up / Awakening Sound: Majestic rising fanfare chord.
 */
export function playLevelUpSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [
    { freq: 440.0, time: 0.0 },  // A4
    { freq: 554.37, time: 0.12 }, // C#5
    { freq: 659.25, time: 0.24 }, // E5
    { freq: 880.0, time: 0.36 },  // A5
    { freq: 1108.73, time: 0.5 }, // C#6
  ];

  notes.forEach(({ freq, time }) => {
    const now = ctx.currentTime + time;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.7);
  });
}

/**
 * Rest Timer Done Sound: Urgent battle bell / combat gong.
 */
export function playTimerCompleteSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(880, now);
  osc.frequency.exponentialRampToValueAtTime(440, now + 0.4);

  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.7);
}

/**
 * Grace Coin Purge Sound: Crystalline purification chime with high-frequency shimmer.
 */
export function playGraceCoinPurgeSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Crystal fundamental note
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = "sine";
  osc1.frequency.setValueAtTime(783.99, now); // G5
  osc1.frequency.exponentialRampToValueAtTime(1567.98, now + 0.12); // G6

  gain1.gain.setValueAtTime(0.3, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

  osc1.connect(gain1);
  gain1.connect(ctx.destination);

  osc1.start(now);
  osc1.stop(now + 0.9);

  // Shimmer overtone
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = "triangle";
  osc2.frequency.setValueAtTime(1174.66, now + 0.04); // D6
  osc2.frequency.exponentialRampToValueAtTime(2349.32, now + 0.2); // D7

  gain2.gain.setValueAtTime(0.2, now + 0.04);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

  osc2.connect(gain2);
  gain2.connect(ctx.destination);

  osc2.start(now + 0.04);
  osc2.stop(now + 1.1);
}

export const soundEffects = {
  chime: playQuestCompleteSound,
  clank: playSetCompleteSound,
  fanfare: playLevelUpSound,
  gong: playTimerCompleteSound,
  purify: playGraceCoinPurgeSound,
};


