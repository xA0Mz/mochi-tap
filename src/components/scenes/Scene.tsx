import { useMemo, type ReactElement } from 'react';
import type { SceneId } from '../../types';

/* ============================================================
   ฉากหลังทั้งหมด วาดในระบบพิกัด 400 x 300
   ด้านล่างสุดของฉาก (y ≈ 300) คือพื้นที่ตัวละครยืน
   เพิ่มฉากใหม่: เขียนฟังก์ชันใหม่ → เพิ่ม case ใน SCENES → เพิ่มชื่อใน SceneId
   คู่มืออยู่ที่ docs/CHARACTER.md หัวข้อ "เพิ่มฉากใหม่"
   ============================================================ */

const W = 400;
const H = 300;

/* ---------------- ชิ้นส่วนที่ใช้ซ้ำ ---------------- */

function Cloud({ x, y, s = 1, o = 0.9, speed = 26 }: { x: number; y: number; s?: number; o?: number; speed?: number }) {
  // g ชั้นนอกคุมตำแหน่ง ชั้นในคุมแอนิเมชัน
  // ถ้าใส่ทั้งสองอย่างใน g เดียว CSS transform จะทับ attribute transform แล้วเมฆจะกระโดดไปมุมจอ
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      <g className="cloud" style={{ animationDuration: `${speed}s` }}>
        <ellipse cx={0} cy={0} rx={26} ry={14} fill="#FFFFFF" />
        <ellipse cx={-18} cy={4} rx={16} ry={10} fill="#FFFFFF" />
        <ellipse cx={18} cy={4} rx={19} ry={11} fill="#FFFFFF" />
        <ellipse cx={4} cy={-9} rx={14} ry={11} fill="#FFFFFF" />
      </g>
    </g>
  );
}

function Tree({ x, y, s = 1, trunk = '#8A5A3B', leaf = '#5FB36A', leafDark = '#4A9A57' }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-4} y={-22} width={8} height={26} rx={3} fill={trunk} />
      <ellipse cx={0} cy={-34} rx={24} ry={20} fill={leaf} />
      <ellipse cx={-12} cy={-28} rx={15} ry={13} fill={leafDark} opacity={0.6} />
      <ellipse cx={11} cy={-42} rx={13} ry={11} fill="#FFFFFF" opacity={0.18} />
    </g>
  );
}

function Flower({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <line x1={0} y1={0} x2={0} y2={-9} stroke="#4A9A57" strokeWidth={1.6} />
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse
          key={a}
          cx={0}
          cy={-13}
          rx={2.6}
          ry={4}
          fill={color}
          transform={`rotate(${a} 0 -9)`}
        />
      ))}
      <circle cx={0} cy={-9} r={2} fill="#FFD764" />
    </g>
  );
}

/** ดาวกระจายแบบสุ่มแต่คงที่ต่อฉาก */
function useStars(seed: number, count: number) {
  return useMemo(() => {
    let h = seed;
    const rand = () => {
      h = (h * 1103515245 + 12345) % 2147483648;
      return h / 2147483648;
    };
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: rand() * W,
      y: rand() * (H * 0.62),
      r: 0.8 + rand() * 1.8,
      delay: rand() * 5,
    }));
  }, [seed, count]);
}

function Stars({ seed, count, color = '#FFF3B0' }: { seed: number; count: number; color?: string }) {
  const stars = useStars(seed, count);
  return (
    <g>
      {stars.map((s) => (
        <circle
          key={s.id}
          className="twinkle"
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill={color}
          style={{ animationDelay: `${s.delay}s` }}
        />
      ))}
    </g>
  );
}

/* ---------------- ทุ่งหญ้า ---------------- */

function Meadow() {
  return (
    <g>
      {/* ดวงอาทิตย์ */}
      <circle cx={340} cy={52} r={26} fill="#FFE08A" opacity={0.95} />
      <circle cx={340} cy={52} r={38} fill="#FFE08A" opacity={0.25} />

      <Cloud x={70} y={54} s={1} speed={30} />
      <Cloud x={230} y={38} s={0.75} o={0.8} speed={38} />
      <Cloud x={330} y={96} s={0.6} o={0.7} speed={24} />

      {/* เนินไกล */}
      <path d={`M0 214 q70 -42 150 -8 q80 34 140 -10 q60 -24 110 2 V${H} H0 Z`} fill="#BFE8A8" />
      <path d={`M0 238 q90 -34 180 -4 q90 30 220 -12 V${H} H0 Z`} fill="#A2DC92" />

      {/* ต้นไม้ */}
      <Tree x={44} y={244} s={1.1} />
      <Tree x={352} y={250} s={0.9} />
      <Tree x={300} y={238} s={0.6} leaf="#6FBE78" />

      {/* รั้วไม้ */}
      <g stroke="#C9A27A" strokeWidth={4} strokeLinecap="round">
        <line x1={96} y1={252} x2={96} y2={272} />
        <line x1={120} y1={250} x2={120} y2={270} />
        <line x1={144} y1={252} x2={144} y2={272} />
        <line x1={90} y1={258} x2={150} y2={257} strokeWidth={3} />
      </g>

      {/* พื้นหญ้า */}
      <path d={`M0 262 q100 -16 200 -2 q100 14 200 -4 V${H} H0 Z`} fill="#8FD37E" />

      {/* หญ้าปลายแหลม */}
      <g stroke="#6FBE6A" strokeWidth={2} strokeLinecap="round">
        {[20, 62, 104, 186, 228, 266, 312, 378].map((x, i) => (
          <path key={x} d={`M${x} ${292 - (i % 3)} q3 -10 6 -14`} fill="none" />
        ))}
      </g>

      <Flower x={34} y={288} color="#FF8FB5" />
      <Flower x={168} y={284} color="#FFF0A0" />
      <Flower x={258} y={290} color="#C3A6F5" />
      <Flower x={366} y={286} color="#FF8FB5" />

      {/* ผีเสื้อ */}
      <g transform="translate(206 200)">
        <g className="flutter">
          <ellipse cx={-4} cy={0} rx={5} ry={3.4} fill="#FFC1DC" />
          <ellipse cx={4} cy={0} rx={5} ry={3.4} fill="#FFC1DC" />
          <circle cx={0} cy={0} r={1.4} fill="#7A5C86" />
        </g>
      </g>
    </g>
  );
}

/* ---------------- ห้องนอน ---------------- */

function Bedroom() {
  return (
    <g>
      {/* ผนัง ลายเส้นแนวตั้ง */}
      <rect x={0} y={0} width={W} height={246} fill="#FFE8EF" />
      <g stroke="#FBD5E2" strokeWidth={8}>
        {[24, 72, 120, 168, 216, 264, 312, 360].map((x) => (
          <line key={x} x1={x} y1={0} x2={x} y2={246} />
        ))}
      </g>

      {/* หน้าต่าง */}
      <g>
        <rect x={238} y={46} width={104} height={86} rx={10} fill="#BFE6FF" stroke="#E8B6C8" strokeWidth={5} />
        <circle cx={266} cy={72} r={9} fill="#FFFFFF" opacity={0.85} />
        <ellipse cx={310} cy={86} rx={16} ry={9} fill="#FFFFFF" opacity={0.7} />
        <path d="M238 118 q30 -14 52 -2 q26 14 52 0 v16 h-104 z" fill="#A8DC9A" />
        <line x1={290} y1={46} x2={290} y2={132} stroke="#E8B6C8" strokeWidth={4} />
        <line x1={238} y1={89} x2={342} y2={89} stroke="#E8B6C8" strokeWidth={4} />
      </g>
      {/* ผ้าม่าน */}
      <path d="M228 36 q14 50 4 104 q-18 4 -22 -6 V40 Z" fill="#FFC4D6" />
      <path d="M352 36 q-14 50 -4 104 q18 4 22 -6 V40 Z" fill="#FFC4D6" />

      {/* ชั้นหนังสือ */}
      <rect x={34} y={96} width={92} height={7} rx={3} fill="#D9A97F" />
      <g>
        <rect x={42} y={68} width={9} height={28} rx={2} fill="#FF9FC0" />
        <rect x={53} y={72} width={8} height={24} rx={2} fill="#9FD9C9" />
        <rect x={63} y={64} width={10} height={32} rx={2} fill="#FFD37E" />
        <rect x={75} y={74} width={7} height={22} rx={2} fill="#B7A6F0" />
      </g>
      {/* ต้นไม้กระถางบนชั้น */}
      <g transform="translate(106 96)">
        <path d="M-7 0 h14 l-2 -12 h-10 z" fill="#E08A5A" />
        <ellipse cx={-4} cy={-18} rx={6} ry={8} fill="#7FC98C" />
        <ellipse cx={4} cy={-16} rx={5} ry={7} fill="#6BBA79" />
      </g>

      {/* กรอบรูป */}
      <g transform="translate(168 62)">
        <rect x={-18} y={-16} width={36} height={32} rx={4} fill="#FFFFFF" stroke="#E8B6C8" strokeWidth={3} />
        <circle cx={0} cy={-2} r={6} fill="#FFD9E6" />
        <path d="M-12 10 q12 -14 24 0 z" fill="#BFE6FF" />
      </g>

      {/* โคมไฟตั้งพื้น */}
      <g transform="translate(372 150)">
        <rect x={-3} y={0} width={6} height={96} fill="#C9A27A" />
        <path d="M-22 0 h44 l-10 -28 h-24 z" fill="#FFE0A8" />
        <ellipse cx={0} cy={4} rx={26} ry={8} fill="#FFF3CF" opacity={0.55} />
      </g>

      {/* เตียง */}
      <g transform="translate(20 168)">
        <rect x={0} y={28} width={140} height={54} rx={10} fill="#E8CBB4" />
        <rect x={6} y={14} width={128} height={30} rx={12} fill="#FFF3F6" />
        <rect x={6} y={30} width={128} height={26} rx={10} fill="#FFB8CE" />
        <rect x={16} y={6} width={44} height={22} rx={10} fill="#FFFFFF" />
        <rect x={-6} y={0} width={10} height={86} rx={5} fill="#D9A97F" />
      </g>

      {/* พื้นห้อง */}
      <rect x={0} y={246} width={W} height={54} fill="#E6C6A4" />
      <g stroke="#D8B48F" strokeWidth={2}>
        {[256, 268, 280, 292].map((y) => (
          <line key={y} x1={0} y1={y} x2={W} y2={y} />
        ))}
      </g>
      {/* พรม */}
      <ellipse cx={200} cy={282} rx={118} ry={22} fill="#FFD3E0" />
      <ellipse cx={200} cy={282} rx={92} ry={16} fill="#FFE5EE" />
    </g>
  );
}

/* ---------------- ชายหาด ---------------- */

function Beach() {
  return (
    <g>
      <circle cx={318} cy={56} r={28} fill="#FFE39A" />
      <circle cx={318} cy={56} r={42} fill="#FFE39A" opacity={0.28} />

      <Cloud x={90} y={44} s={0.85} o={0.85} speed={34} />
      <Cloud x={230} y={68} s={0.6} o={0.7} speed={28} />

      {/* นกนางนวล */}
      <g stroke="#FFFFFF" strokeWidth={2.4} fill="none" strokeLinecap="round" opacity={0.9}>
        <path className="flutter" d="M120 92 q7 -7 14 0 q7 -7 14 0" />
        <path d="M168 76 q5 -5 10 0 q5 -5 10 0" />
      </g>

      {/* ทะเล */}
      <rect x={0} y={168} width={W} height={70} fill="#4FB8E0" />
      <rect x={0} y={168} width={W} height={20} fill="#3FA6D4" />
      <g stroke="#FFFFFF" strokeWidth={2.6} fill="none" strokeLinecap="round" opacity={0.75}>
        <path className="wave" d="M10 196 q12 -6 24 0 q12 6 24 0" />
        <path className="wave" d="M150 206 q12 -6 24 0 q12 6 24 0" style={{ animationDelay: '1.1s' }} />
        <path className="wave" d="M280 192 q12 -6 24 0 q12 6 24 0" style={{ animationDelay: '2s' }} />
      </g>
      {/* แสงสะท้อนน้ำ */}
      <ellipse cx={318} cy={186} rx={30} ry={5} fill="#FFF6D0" opacity={0.6} />

      {/* คลื่นซัดฝั่ง */}
      <path d={`M0 238 q60 -14 120 0 q70 14 140 -2 q70 -14 140 4 V${H} H0 Z`} fill="#F6E3B4" />
      <path d="M0 238 q60 -14 120 0 q70 14 140 -2 q70 -14 140 4 v8 q-70 -16 -140 -2 q-70 14 -140 0 q-60 -12 -120 2 z" fill="#FFFFFF" opacity={0.75} />

      {/* ทราย */}
      <rect x={0} y={264} width={W} height={36} fill="#F2DCA9" />

      {/* ต้นมะพร้าว */}
      <g transform="translate(46 268)">
        <path d="M0 0 q-6 -34 4 -56" stroke="#A9714A" strokeWidth={7} fill="none" strokeLinecap="round" />
        <g transform="translate(4 -56)">
          <ellipse cx={-18} cy={-2} rx={20} ry={7} fill="#4FA85F" transform="rotate(-18)" />
          <ellipse cx={18} cy={-2} rx={20} ry={7} fill="#4FA85F" transform="rotate(18)" />
          <ellipse cx={0} cy={-12} rx={18} ry={7} fill="#5FB86C" />
          <circle cx={-4} cy={2} r={4} fill="#8A5A3B" />
        </g>
      </g>

      {/* ร่มชายหาด */}
      <g transform="translate(330 272)">
        <line x1={0} y1={0} x2={0} y2={-36} stroke="#C9A27A" strokeWidth={3.4} />
        <path d="M-30 -34 a30 22 0 0 1 60 0 z" fill="#FF8FA8" />
        <path d="M-30 -34 a30 22 0 0 1 20 0 z" fill="#FFFFFF" opacity={0.85} />
        <path d="M10 -34 a30 22 0 0 1 20 0 z" fill="#FFFFFF" opacity={0.85} />
      </g>

      {/* ลูกบอลกับเปลือกหอย */}
      <circle cx={288} cy={284} r={9} fill="#FFD764" />
      <path d="M279 284 a9 9 0 0 1 18 0 z" fill="#FF8FA8" opacity={0.8} />
      <g transform="translate(120 286)">
        <path d="M0 0 a9 8 0 0 1 16 0 z" fill="#FFE1E9" stroke="#F0B7C8" strokeWidth={1.2} />
        <path d="M8 0 v-8 M4 0 l2 -7 M12 0 l-2 -7" stroke="#F0B7C8" strokeWidth={1} />
      </g>
    </g>
  );
}

/* ---------------- ท้องฟ้ากลางคืน ---------------- */

function Night() {
  return (
    <g>
      <Stars seed={7} count={44} />

      {/* พระจันทร์เสี้ยว */}
      <g transform="translate(320 58)">
        <circle cx={0} cy={0} r={28} fill="#FFF2C2" />
        <circle cx={12} cy={-6} r={24} fill="#22235A" />
        <circle cx={-10} cy={6} r={3.4} fill="#F0E0A8" opacity={0.7} />
        <circle cx={-4} cy={-12} r={2.4} fill="#F0E0A8" opacity={0.6} />
      </g>

      {/* ดาวตก */}
      <g className="shooting-star">
        <line x1={0} y1={0} x2={30} y2={12} stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" opacity={0.85} />
        <circle cx={32} cy={13} r={2.2} fill="#FFFFFF" />
      </g>

      {/* เนินเขาเงาดำ */}
      <path d={`M0 224 q80 -46 168 -12 q90 34 232 -14 V${H} H0 Z`} fill="#2C2A5E" />
      <path d={`M0 254 q100 -30 200 -6 q100 24 200 -10 V${H} H0 Z`} fill="#211F4A" />

      {/* ต้นสนเงาดำ */}
      <g fill="#181739">
        {[
          [40, 258, 1],
          [76, 266, 0.7],
          [336, 262, 0.9],
          [370, 270, 0.6],
        ].map(([x, y, s], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
            <path d="M0 0 l-14 0 l14 -34 l14 34 z" />
            <path d="M0 -14 l-11 0 l11 -26 l11 26 z" />
            <rect x={-2.5} y={-2} width={5} height={10} />
          </g>
        ))}
      </g>

      {/* หิ่งห้อย */}
      <g fill="#FFF3A0">
        {[
          [120, 250, 0],
          [160, 236, 1.2],
          [230, 254, 2.4],
          [272, 240, 0.6],
          [196, 262, 1.8],
        ].map(([x, y, d], i) => (
          <circle
            key={i}
            className="firefly"
            cx={x}
            cy={y}
            r={2.6}
            style={{ animationDelay: `${d}s` }}
          />
        ))}
      </g>
    </g>
  );
}

/* ---------------- คาเฟ่ ---------------- */

function Cafe() {
  return (
    <g>
      {/* ผนัง */}
      <rect x={0} y={0} width={W} height={236} fill="#EFDCC6" />
      <rect x={0} y={150} width={W} height={10} fill="#D8BFA2" />

      {/* หน้าต่างบานใหญ่ */}
      <g>
        <rect x={252} y={40} width={116} height={102} rx={8} fill="#CFE9F5" stroke="#B08C66" strokeWidth={6} />
        <path d="M252 104 q28 -12 48 -2 q24 12 68 -4 v44 h-116 z" fill="#B8D9C0" opacity={0.7} />
        <line x1={310} y1={40} x2={310} y2={142} stroke="#B08C66" strokeWidth={5} />
        <circle cx={278} cy={66} r={8} fill="#FFFFFF" opacity={0.8} />
      </g>

      {/* โคมไฟห้อย */}
      {[96, 164].map((x, i) => (
        <g key={x} transform={`translate(${x} 0)`}>
          <line x1={0} y1={0} x2={0} y2={46 + i * 10} stroke="#8A6A4A" strokeWidth={2.4} />
          <path d={`M-18 ${46 + i * 10} h36 l-8 -20 h-20 z`} fill="#E8A87C" />
          <ellipse cx={0} cy={50 + i * 10} rx={20} ry={6} fill="#FFE9C4" opacity={0.5} />
        </g>
      ))}

      {/* ชั้นวางแก้ว */}
      <rect x={28} y={112} width={104} height={7} rx={3} fill="#B08C66" />
      <g>
        {[38, 58, 78, 98, 116].map((x, i) => (
          <g key={x} transform={`translate(${x} 112)`}>
            <path d="M-6 0 v-12 h12 v12 z" fill={['#FFFFFF', '#FFD3DF', '#CFE9F5', '#FFFFFF', '#FFE6B8'][i]} />
            <path d="M6 -10 q6 2 0 7" stroke="#D8BFA2" strokeWidth={1.6} fill="none" />
          </g>
        ))}
      </g>

      {/* ป้ายเมนู */}
      <g transform="translate(196 74)">
        <rect x={-26} y={-24} width={52} height={48} rx={5} fill="#5B4636" />
        <g stroke="#F2E4D3" strokeWidth={2} strokeLinecap="round" opacity={0.85}>
          <line x1={-16} y1={-12} x2={12} y2={-12} />
          <line x1={-16} y1={-2} x2={16} y2={-2} />
          <line x1={-16} y1={8} x2={6} y2={8} />
        </g>
      </g>

      {/* เคาน์เตอร์ */}
      <rect x={0} y={192} width={W} height={20} fill="#9C7650" />
      <rect x={0} y={202} width={W} height={34} fill="#835F3F" />

      {/* เครื่องชงกาแฟ */}
      <g transform="translate(316 192)">
        <rect x={-26} y={-44} width={52} height={44} rx={6} fill="#C0CAD4" />
        <rect x={-18} y={-38} width={36} height={14} rx={3} fill="#8D9AA8" />
        <circle cx={-12} cy={-12} r={4} fill="#5B6773" />
        <circle cx={12} cy={-12} r={4} fill="#5B6773" />
        <rect x={-4} y={-8} width={8} height={8} fill="#5B6773" />
      </g>

      {/* ถ้วยกาแฟกับเค้กบนเคาน์เตอร์ */}
      <g transform="translate(92 192)">
        <path d="M-10 0 v-12 h20 v12 z" fill="#FFFFFF" />
        <path d="M10 -10 q7 3 0 8" stroke="#E0D2C0" strokeWidth={2} fill="none" />
        <ellipse cx={0} cy={-12} rx={10} ry={3} fill="#C08B5C" />
        <path className="steam" d="M-3 -18 q4 -6 0 -12" stroke="#FFFFFF" strokeWidth={2} fill="none" opacity={0.6} />
        <path className="steam" d="M4 -18 q4 -6 0 -12" stroke="#FFFFFF" strokeWidth={2} fill="none" opacity={0.5} style={{ animationDelay: '1.2s' }} />
      </g>
      <g transform="translate(140 192)">
        <path d="M-11 0 l3 -14 h16 l3 14 z" fill="#FFF0D6" />
        <path d="M-9 -8 h18" stroke="#FF9FC0" strokeWidth={3} />
        <circle cx={0} cy={-17} r={3} fill="#FF7EA8" />
      </g>

      {/* ต้นไม้มุมห้อง */}
      <g transform="translate(374 236)">
        <path d="M-12 0 h24 l-4 -22 h-16 z" fill="#C97F52" />
        <ellipse cx={-6} cy={-34} rx={11} ry={15} fill="#5FA96C" />
        <ellipse cx={7} cy={-30} rx={9} ry={13} fill="#6FBB78" />
      </g>

      {/* พื้นไม้ */}
      <rect x={0} y={236} width={W} height={64} fill="#B98A60" />
      <g stroke="#A67A52" strokeWidth={2}>
        {[246, 260, 274, 288].map((y) => (
          <line key={y} x1={0} y1={y} x2={W} y2={y} />
        ))}
      </g>
    </g>
  );
}

/* ---------------- ซากุระ ---------------- */

function SakuraBlossom({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={0} rx={26} ry={20} fill="#FFC2D9" />
      <ellipse cx={-18} cy={6} rx={17} ry={14} fill="#FFB0CE" />
      <ellipse cx={18} cy={5} rx={19} ry={15} fill="#FFD0E2" />
      <ellipse cx={2} cy={-12} rx={16} ry={13} fill="#FFDCE9" />
    </g>
  );
}

function Sakura() {
  const petals = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        x: (i * 37) % W,
        delay: (i * 1.3) % 9,
        duration: 8 + ((i * 3) % 6),
        s: 0.7 + ((i * 7) % 5) / 10,
      })),
    [],
  );

  return (
    <g>
      {/* ภูเขาไกล */}
      <path d={`M0 200 q70 -58 140 -10 q60 42 120 -4 q70 -50 140 6 V${H} H0 Z`} fill="#D9E9F2" />
      <path d={`M0 224 q90 -34 180 -6 q100 28 220 -12 V${H} H0 Z`} fill="#C8E2D2" />

      {/* ลำธาร */}
      <path d={`M0 268 q100 -18 200 -2 q100 16 200 -6 V${H} H0 Z`} fill="#A8D8E8" />
      <g stroke="#FFFFFF" strokeWidth={1.8} opacity={0.6} fill="none">
        <path d="M40 278 q10 -4 20 0" />
        <path d="M180 284 q10 -4 20 0" />
        <path d="M300 276 q10 -4 20 0" />
      </g>

      {/* พื้นหญ้า */}
      <path d={`M0 252 q100 -14 200 -2 q100 12 200 -6 v26 q-100 18 -200 6 q-100 -12 -200 2 Z`} fill="#BFE0A8" />

      {/* ต้นซากุระใหญ่ซ้าย */}
      <g transform="translate(52 256)">
        <path d="M0 0 q-4 -34 2 -52 M2 -30 q-16 -8 -24 -20 M2 -38 q16 -10 26 -22" stroke="#8A6250" strokeWidth={6} fill="none" strokeLinecap="round" />
        <SakuraBlossom x={2} y={-64} s={1.15} />
        <SakuraBlossom x={-28} y={-52} s={0.8} />
        <SakuraBlossom x={32} y={-56} s={0.85} />
      </g>

      {/* ต้นซากุระขวา */}
      <g transform="translate(348 262)">
        <path d="M0 0 q6 -30 -2 -46 M-2 -26 q14 -8 22 -18" stroke="#8A6250" strokeWidth={5} fill="none" strokeLinecap="round" />
        <SakuraBlossom x={-2} y={-58} s={0.95} />
        <SakuraBlossom x={24} y={-48} s={0.7} />
      </g>

      {/* โคมหิน */}
      <g transform="translate(288 270)">
        <rect x={-9} y={-10} width={18} height={10} fill="#C4C0B4" />
        <rect x={-11} y={-24} width={22} height={14} rx={3} fill="#D6D2C6" />
        <rect x={-7} y={-20} width={14} height={9} rx={2} fill="#FFE9A8" />
        <path d="M-15 -24 h30 l-6 -8 h-18 z" fill="#B7B3A6" />
        <circle cx={0} cy={-34} r={3.4} fill="#C4C0B4" />
      </g>

      {/* ม้านั่ง */}
      <g transform="translate(150 272)">
        <rect x={-30} y={-10} width={60} height={6} rx={3} fill="#B07F5A" />
        <rect x={-30} y={-20} width={60} height={5} rx={2.5} fill="#C08F68" />
        <rect x={-26} y={-4} width={5} height={12} fill="#96683F" />
        <rect x={21} y={-4} width={5} height={12} fill="#96683F" />
      </g>

      {/* กลีบซากุระร่วง */}
      <g fill="#FF9FC0">
        {petals.map((p) => (
          <ellipse
            key={p.id}
            className="petal-fall"
            cx={p.x}
            cy={-10}
            rx={4 * p.s}
            ry={2.6 * p.s}
            style={{ animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s` }}
          />
        ))}
      </g>
    </g>
  );
}

/* ---------------- อวกาศ ---------------- */

function Space() {
  return (
    <g>
      {/* เนบิวลา */}
      <ellipse cx={90} cy={90} rx={110} ry={70} fill="#6B3E9E" opacity={0.3} />
      <ellipse cx={300} cy={150} rx={120} ry={80} fill="#2E4C9E" opacity={0.28} />
      <ellipse cx={200} cy={60} rx={80} ry={48} fill="#B45AA0" opacity={0.18} />

      <Stars seed={19} count={60} color="#DCD3FF" />

      {/* ดาวเคราะห์มีวงแหวน */}
      <g transform="translate(316 80)">
        <ellipse cx={0} cy={0} rx={52} ry={13} fill="#C8A6F0" opacity={0.55} transform="rotate(-18)" />
        <circle cx={0} cy={0} r={30} fill="#F0A26A" />
        <path d="M-30 4 a30 30 0 0 0 60 -6 a30 30 0 0 1 -60 6 z" fill="#D98A54" opacity={0.7} />
        <circle cx={-10} cy={-10} r={6} fill="#FFC79A" opacity={0.7} />
        <ellipse cx={0} cy={0} rx={52} ry={13} fill="none" stroke="#E4CCFF" strokeWidth={3} opacity={0.75} transform="rotate(-18)" />
      </g>

      {/* ดวงจันทร์เล็ก */}
      <g transform="translate(76 178)">
        <circle cx={0} cy={0} r={18} fill="#CFC9E8" />
        <circle cx={-6} cy={-4} r={4} fill="#B6AFD6" />
        <circle cx={6} cy={6} r={3} fill="#B6AFD6" />
      </g>

      {/* ดาวหาง */}
      <g className="shooting-star">
        <line x1={0} y1={0} x2={38} y2={14} stroke="#C8E6FF" strokeWidth={2.4} strokeLinecap="round" opacity={0.85} />
        <circle cx={40} cy={15} r={3} fill="#FFFFFF" />
      </g>

      {/* ก้อนหินลอย */}
      <g fill="#4A3F6E">
        <path className="drift" d="M140 246 l14 -8 l14 8 l-6 12 h-16 z" />
        <path className="drift" d="M244 262 l10 -6 l12 6 l-5 10 h-13 z" style={{ animationDelay: '2.4s' }} />
      </g>

      {/* พื้นดาวเคราะห์ */}
      <path d={`M0 272 q100 -26 200 -6 q100 20 200 -10 V${H} H0 Z`} fill="#3A2B5C" />
      <path d={`M0 286 q120 -16 240 -2 q80 10 160 -6 V${H} H0 Z`} fill="#2C2048" />
      <g fill="#241A3C">
        <ellipse cx={96} cy={288} rx={18} ry={5} />
        <ellipse cx={264} cy={292} rx={22} ry={6} />
      </g>
    </g>
  );
}

/* ---------------- ตัวเลือกฉาก ---------------- */

const SCENES: Record<SceneId, () => ReactElement> = {
  meadow: Meadow,
  bedroom: Bedroom,
  beach: Beach,
  night: Night,
  cafe: Cafe,
  sakura: Sakura,
  space: Space,
};

export default function Scene({ id }: { id: SceneId }) {
  const Chosen = SCENES[id] ?? Meadow;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMax slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <Chosen />
    </svg>
  );
}
