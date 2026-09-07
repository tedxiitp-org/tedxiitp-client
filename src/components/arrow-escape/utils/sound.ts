/**
 * utils/sound.ts — sound effects for click / success / blocked / win / lose,
 * plus a soft ambient music loop, ALL synthesized at runtime via the Web
 * Audio API rather than loaded from external audio files.
 *
 * Why synthesized instead of .mp3/.wav assets: this environment can't fetch
 * arbitrary binary audio assets from the network, and shipping placeholder
 * silent files would be worse than being upfront about it. Short procedural
 * oscillator "blips" are a common, legitimate technique for exactly this
 * kind of UI feedback and keep the whole game dependency-free. If real
 * sound design assets are available separately, these functions are the
 * only place that would need to change (swap the oscillator calls for
 * `new Audio(url).play()`).
 */

let audioCtx: AudioContext | null = null;
let enabled = true;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtor) return null;
  if (!audioCtx) {
    audioCtx = new AudioCtor();
  }
  if (audioCtx.state === "suspended") {
    // Best-effort; browsers require a user gesture, which button clicks provide.
    void audioCtx.resume();
  }
  return audioCtx;
}

export function setSoundEnabled(value: boolean): void {
  enabled = value;
  if (!value) stopMusic();
}

export function isSoundEnabled(): boolean {
  return enabled;
}

interface BeepOptions {
  freq: number;
  duration: number;
  type?: OscillatorType;
  volume?: number;
  glideTo?: number;
  delay?: number;
}

function beep({ freq, duration, type = "sine", volume = 0.18, glideTo, delay = 0 }: BeepOptions): void {
  if (!enabled) return;
  const ctx = getContext();
  if (!ctx) return;
  try {
    const startAt = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startAt);
    if (glideTo) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, glideTo), startAt + duration);
    }
    gain.gain.setValueAtTime(volume, startAt);
    gain.gain.exponentialRampToValueAtTime(0.001, startAt + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(startAt);
    osc.stop(startAt + duration + 0.02);
  } catch {
    // Audio can fail in odd environments (e.g. autoplay policy edge cases) — never let SFX crash gameplay.
  }
}

export function playClick(): void {
  beep({ freq: 520, duration: 0.05, type: "sine", volume: 0.12 });
}

export function playSuccess(): void {
  beep({ freq: 660, duration: 0.16, type: "sine", glideTo: 990, volume: 0.16 });
}

export function playBlocked(): void {
  beep({ freq: 180, duration: 0.16, type: "square", volume: 0.14 });
}

export function playWin(): void {
  // A quick ascending three-note chime.
  beep({ freq: 523, duration: 0.14, volume: 0.16 });
  beep({ freq: 659, duration: 0.14, volume: 0.16, delay: 0.12 });
  beep({ freq: 784, duration: 0.22, volume: 0.18, delay: 0.24 });
}

export function playLose(): void {
  // A short descending tone.
  beep({ freq: 300, duration: 0.3, type: "sawtooth", glideTo: 120, volume: 0.14 });
}

// --- Optional soft ambient music loop ---
let musicNodes: { oscillators: OscillatorNode[]; gain: GainNode } | null = null;

export function startMusic(): void {
  if (!enabled || musicNodes) return;
  const ctx = getContext();
  if (!ctx) return;
  try {
    const gain = ctx.createGain();
    gain.gain.value = 0.035;
    gain.connect(ctx.destination);

    // Two slow, detuned low oscillators — a barely-there pad, not a melody.
    const freqs = [110, 164.81];
    const oscillators = freqs.map((f) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = f;
      osc.connect(gain);
      osc.start();
      return osc;
    });

    musicNodes = { oscillators, gain };
  } catch {
    musicNodes = null;
  }
}

export function stopMusic(): void {
  if (!musicNodes) return;
  try {
    musicNodes.oscillators.forEach((osc) => osc.stop());
  } catch {
    // already stopped
  }
  musicNodes = null;
}
