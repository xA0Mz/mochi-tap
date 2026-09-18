import type { CSSProperties } from 'react';

export interface Particle {
  id: number;
  emoji: string;
  /** ตำแหน่งบนจอตอนแตะ (px) */
  x: number;
  y: number;
  /** ระยะกระเด็นออกด้านข้าง (px) ติดลบได้ */
  drift: number;
  scale: number;
}

interface Props {
  particles: Particle[];
}

/**
 * ตัวอิโมจิที่ลอยขึ้นแล้วจางหาย
 * ตัวมันเองไม่จับเวลา ให้ App เป็นคนลบออกจาก state เมื่อครบเวลา
 */
export default function TapParticles({ particles }: Props) {
  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          className="particle-rise absolute text-2xl"
          style={
            {
              left: p.x,
              top: p.y,
              '--drift': `${p.drift}px`,
              transform: `scale(${p.scale})`,
            } as CSSProperties
          }
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}
