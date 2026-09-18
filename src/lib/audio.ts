import type { SoundId } from '../types';

// เสียงทั้งหมดสังเคราะห์สด ๆ ด้วย Web Audio API
// ข้อดีคือไม่ต้องโหลดไฟล์ mp3 เลย ขนาดแอปเล็กและไม่มีดีเลย์ตอนแตะ

let ctx: AudioContext | null = null;

/**
 * ต้องเรียกครั้งแรกจากการแตะของผู้ใช้เท่านั้น
 * iOS/Safari บล็อกเสียงที่ไม่ได้เกิดจาก user gesture
 */
export function unlockAudio(): void {
  try {
    if (!ctx) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      ctx = new Ctor();
    }
    if (ctx.state === 'suspended') void ctx.resume();
  } catch {
    ctx = null;
  }
}

type Note = { freq: number; at: number; dur: number; type?: OscillatorType; gain?: number };

function playNotes(notes: Note[]): void {
  if (!ctx) return;
  const now = ctx.currentTime;

  for (const n of notes) {
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    const peak = n.gain ?? 0.09;

    osc.type = n.type ?? 'sine';
    osc.frequency.setValueAtTime(n.freq, now + n.at);

    // ทำ envelope สั้น ๆ กันเสียงแตก
    amp.gain.setValueAtTime(0.0001, now + n.at);
    amp.gain.exponentialRampToValueAtTime(peak, now + n.at + 0.015);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + n.at + n.dur);

    osc.connect(amp).connect(ctx.destination);
    osc.start(now + n.at);
    osc.stop(now + n.at + n.dur + 0.05);
  }
}

const RECIPES: Record<SoundId, Note[]> = {
  // ---- เสียงตอนแตะ ----
  pop: [
    { freq: 660, at: 0, dur: 0.12, type: 'triangle' },
    { freq: 990, at: 0.05, dur: 0.12 },
  ],
  chime: [
    { freq: 784, at: 0, dur: 0.22 },
    { freq: 1047, at: 0.09, dur: 0.26 },
  ],
  boing: [
    { freq: 220, at: 0, dur: 0.1, type: 'sawtooth', gain: 0.06 },
    { freq: 420, at: 0.07, dur: 0.12, type: 'triangle' },
    { freq: 300, at: 0.16, dur: 0.14, type: 'triangle' },
  ],
  sparkle: [
    { freq: 1175, at: 0, dur: 0.1 },
    { freq: 1568, at: 0.07, dur: 0.1 },
    { freq: 2093, at: 0.14, dur: 0.14, gain: 0.06 },
  ],
  wobble: [
    { freq: 500, at: 0, dur: 0.12 },
    { freq: 380, at: 0.1, dur: 0.14 },
    { freq: 460, at: 0.22, dur: 0.14 },
  ],
  snore: [
    { freq: 150, at: 0, dur: 0.45, type: 'sawtooth', gain: 0.04 },
    { freq: 110, at: 0.4, dur: 0.4, type: 'sawtooth', gain: 0.035 },
  ],
  fanfare: [
    { freq: 523, at: 0, dur: 0.16, type: 'triangle' },
    { freq: 659, at: 0.12, dur: 0.16, type: 'triangle' },
    { freq: 784, at: 0.24, dur: 0.18, type: 'triangle' },
    { freq: 1047, at: 0.36, dur: 0.34, type: 'triangle' },
  ],

  /** หัวเราะ — โน้ตสั้นถี่ไล่ขึ้นแล้วลง */
  giggle: [
    { freq: 880, at: 0, dur: 0.07, type: 'triangle', gain: 0.07 },
    { freq: 1047, at: 0.08, dur: 0.07, type: 'triangle', gain: 0.07 },
    { freq: 988, at: 0.16, dur: 0.07, type: 'triangle', gain: 0.06 },
    { freq: 1175, at: 0.24, dur: 0.09, type: 'triangle', gain: 0.06 },
  ],

  /** ปุ๊ก สั้นมาก ใช้กับ UI */
  blip: [{ freq: 740, at: 0, dur: 0.07, type: 'square', gain: 0.045 }],

  /** เสียงนุ่ม ๆ ใช้ตอนปลอบใจ — คอร์ดเมเจอร์เบา ๆ */
  soft: [
    { freq: 392, at: 0, dur: 0.5, gain: 0.05 },
    { freq: 523, at: 0.02, dur: 0.5, gain: 0.04 },
    { freq: 659, at: 0.04, dur: 0.5, gain: 0.03 },
  ],

  /** เศร้าแบบอ่อนโยน ไม่ใช่เสียงหดหู่ — ไล่ลงสองโน้ต */
  sad: [
    { freq: 587, at: 0, dur: 0.34, gain: 0.055 },
    { freq: 494, at: 0.2, dur: 0.42, gain: 0.05 },
  ],

  /** กอด — คอร์ดอุ่น ๆ ค้างยาว */
  hug: [
    { freq: 349, at: 0, dur: 0.75, gain: 0.05 },
    { freq: 440, at: 0.06, dur: 0.72, gain: 0.04 },
    { freq: 523, at: 0.12, dur: 0.7, gain: 0.032 },
    { freq: 698, at: 0.2, dur: 0.6, gain: 0.02 },
  ],

  /** ฮัมเพลง — สี่โน้ตง่าย ๆ */
  note: [
    { freq: 523, at: 0, dur: 0.2, type: 'triangle', gain: 0.06 },
    { freq: 659, at: 0.18, dur: 0.2, type: 'triangle', gain: 0.06 },
    { freq: 587, at: 0.36, dur: 0.2, type: 'triangle', gain: 0.055 },
    { freq: 784, at: 0.54, dur: 0.3, type: 'triangle', gain: 0.05 },
  ],

  /** เอ๊ะ? — โน้ตเดียวไล่ขึ้นเหมือนเสียงสูงท้ายประโยคคำถาม */
  question: [
    { freq: 523, at: 0, dur: 0.12, type: 'triangle' },
    { freq: 784, at: 0.1, dur: 0.18, type: 'triangle' },
  ],
};

export function playSound(id: SoundId | undefined, enabled: boolean): void {
  if (!enabled || !id || !ctx) return;
  try {
    playNotes(RECIPES[id]);
  } catch {
    /* เล่นไม่ได้ก็ไม่เป็นไร */
  }
}
