import type { Background as Bg } from '../types';
import type { Tilt } from '../hooks/useParallax';
import Scene from './scenes/Scene';

interface Props {
  background: Bg;
  /** รูปที่ผู้ใช้อัปโหลดเอง (data URL) — ถ้ามี จะทับฉากสำเร็จรูป */
  customImage: string | null;
  tilt: Tilt;
  reducedMotion: boolean;
}

/**
 * พื้นหลังสามชั้น
 *  1. ไล่สีท้องฟ้า (อยู่กับที่)
 *  2. ฉาก SVG (ขยับตามการเอียงเครื่องเล็กน้อย)
 *  3. ไล่สีทับบาง ๆ ให้ตัวละครเด่นขึ้น
 */
export default function Background({ background, customImage, tilt, reducedMotion }: Props) {
  const shift = reducedMotion ? { x: 0, y: 0 } : tilt;

  if (customImage) {
    return (
      <div className="fixed inset-0 -z-10 overflow-hidden bg-ink">
        <img
          src={customImage}
          alt=""
          className="h-full w-full object-cover"
          style={{ transform: `scale(1.1) translate(${shift.x * -10}px, ${shift.y * -8}px)` }}
        />
        {/* ทำให้ตัวอักษรบนพื้นหลังรูปยังอ่านออก */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-black/30" />
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden"
      style={{ background: `linear-gradient(180deg, ${background.sky.join(', ')})` }}
    >
      <div
        className="absolute inset-0"
        style={{ transform: `translate(${shift.x * -10}px, ${shift.y * -7}px) scale(1.06)` }}
      >
        <Scene id={background.scene} />
      </div>

      {/* เงาจาง ๆ ด้านล่างให้ตัวละครลอยเด่นขึ้นจากฉาก */}
      <div
        className={`absolute inset-x-0 bottom-0 h-1/3 ${
          background.dark ? 'bg-gradient-to-t from-black/30' : 'bg-gradient-to-t from-white/25'
        } to-transparent`}
      />
    </div>
  );
}
