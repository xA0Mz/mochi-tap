import { memo, useMemo, type PointerEvent as ReactPointerEvent } from 'react';
import type { AnimationId, FaceId, ZoneId } from '../types';

/* ============================================================
   ตัวละคร วาดด้วย SVG ล้วน ไม่มีไฟล์ภาพ
   อยากปรับหน้าตา สัดส่วน หรือสี → แก้ที่ LOOK ด้านล่างนี้ได้เลย
   คู่มือฉบับเต็มอยู่ที่ docs/CHARACTER.md
   ============================================================ */

export const LOOK = {
  /** ระบบพิกัดของตัวละคร ทุกตัวเลขข้างล่างอิงกับกล่องขนาดนี้ */
  viewBox: { w: 260, h: 260 },

  colors: {
    /** สีตัว */
    body: '#FFFDF8',
    /** สีเงาขอบตัว */
    shade: '#EFE7F2',
    /** สีเส้นตา ปาก คิ้ว */
    ink: '#4A3B52',
    /** สีแก้ม */
    blush: '#FF9FC0',
    /** สีในปาก */
    mouth: '#FF7EA8',
    /** สีน้ำตา */
    tear: '#8FC6F5',
  },

  /** หัว */
  head: { cx: 130, cy: 110, r: 56 },

  /** หู — len ยิ่งมากยิ่งยาว tilt ยิ่งมากยิ่งกางออก */
  ears: { offsetX: 58, cy: 96, len: 40, width: 19, tilt: 16 },

  /** ตัว */
  body: { cx: 130, cy: 178, rx: 54, ry: 48 },

  /** ตา — gap คือระยะห่างจากกึ่งกลางหน้า */
  eyes: { gap: 18, y: 106, rx: 6.5, ry: 8 },

  /** แก้ม */
  cheeks: { offsetX: 32, y: 124, rx: 11, ry: 7 },

  /** ปาก จุดกึ่งกลาง */
  mouth: { x: 130, y: 124 },

  /** หาง */
  tail: { cx: 194, cy: 182, r: 15 },

  /** แขน จะยื่นออกมาตอนท่าปลอบใจ */
  arms: { offsetX: 52, cy: 186, rx: 13, ry: 18 },

  /** เท้า */
  feet: { offsetX: 26, cy: 220, rx: 19, ry: 11 },

  /** ปอยผมบนหัว ตั้ง false ถ้าไม่อยากมี */
  tuft: true,
} as const;

const C = LOOK.colors;
const EYE_L = LOOK.head.cx - LOOK.eyes.gap;
const EYE_R = LOOK.head.cx + LOOK.eyes.gap;
const EYE_Y = LOOK.eyes.y;

interface Props {
  animation: AnimationId;
  face: FaceId;
  /** เปลี่ยนค่านี้เพื่อสั่งให้ CSS animation เริ่มเล่นใหม่ตั้งแต่ต้น */
  animKey: number;
  onZoneTap: (zone: ZoneId) => void;
  reducedMotion?: boolean;
}

/* ---------------- ชิ้นส่วนตา ---------------- */

function OpenEye({ cx, scale = 1 }: { cx: number; scale?: number }) {
  return (
    <g>
      <ellipse cx={cx} cy={EYE_Y} rx={LOOK.eyes.rx * scale} ry={LOOK.eyes.ry * scale} fill={C.ink} />
      <circle cx={cx - 2} cy={EYE_Y - 3} r={2.2 * scale} fill="#FFFFFF" />
    </g>
  );
}

/** ตาโค้งขึ้น = ยิ้ม */
function HappyEye({ cx }: { cx: number }) {
  return (
    <path
      d={`M${cx - 8} ${EYE_Y + 3} q8 -11 16 0`}
      stroke={C.ink}
      strokeWidth={4}
      strokeLinecap="round"
      fill="none"
    />
  );
}

/** ตาโค้งลง = หลับ */
function ClosedEye({ cx }: { cx: number }) {
  return (
    <path
      d={`M${cx - 8} ${EYE_Y - 2} q8 10 16 0`}
      stroke={C.ink}
      strokeWidth={4}
      strokeLinecap="round"
      fill="none"
    />
  );
}

function HeartEye({ cx }: { cx: number }) {
  return (
    <path
      transform={`translate(${cx} ${EYE_Y}) scale(0.9)`}
      d="M0,-3 C-2,-9 -10,-6 -10,0 C-10,6 -3,9 0,12 C3,9 10,6 10,0 C10,-6 2,-9 0,-3 Z"
      fill={C.mouth}
    />
  );
}

function StarEye({ cx }: { cx: number }) {
  return (
    <path
      transform={`translate(${cx} ${EYE_Y}) scale(0.95)`}
      d="M0,-10 L2.9,-3.3 L10,-3.3 L4.3,1.3 L6.5,8.4 L0,4.2 L-6.5,8.4 L-4.3,1.3 L-10,-3.3 L-2.9,-3.3 Z"
      fill="#FFC846"
      stroke="#F0A62E"
      strokeWidth={1.2}
      strokeLinejoin="round"
    />
  );
}

function DizzyEye({ cx }: { cx: number }) {
  return (
    <g stroke={C.ink} strokeWidth={3.4} strokeLinecap="round">
      <line x1={cx - 6} y1={EYE_Y - 6} x2={cx + 6} y2={EYE_Y + 6} />
      <line x1={cx + 6} y1={EYE_Y - 6} x2={cx - 6} y2={EYE_Y + 6} />
    </g>
  );
}

/** คิ้ว — angle บวก = ปลายในตก (กังวล เศร้า) ติดลบ = ปลายในยก (มุ่งมั่น งอน) */
function Brows({ angle, lift = 0 }: { angle: number; lift?: number }) {
  const y = EYE_Y - 15 - lift;
  return (
    <g stroke={C.ink} strokeWidth={3} strokeLinecap="round">
      <line x1={EYE_L - 9} y1={y - angle} x2={EYE_L + 4} y2={y + angle} />
      <line x1={EYE_R + 9} y1={y - angle} x2={EYE_R - 4} y2={y + angle} />
    </g>
  );
}

/** เปลือกตาสำหรับกะพริบอัตโนมัติ ซ่อนอยู่เกือบตลอดเวลา */
function BlinkLid({ cx, delay }: { cx: number; delay: number }) {
  return (
    <ellipse
      className="blink-lid"
      cx={cx}
      cy={EYE_Y}
      rx={LOOK.eyes.rx + 2}
      ry={LOOK.eyes.ry + 2}
      fill={C.body}
      style={{ animationDelay: `${delay}s` }}
    />
  );
}

/** หน้าไหนที่ตาเปิดอยู่ ถึงจะกะพริบได้ */
const BLINKABLE: FaceId[] = [
  'normal',
  'blush',
  'pout',
  'surprised',
  'peek',
  'determined',
  'worried',
];

function Eyes({ face }: { face: FaceId }) {
  switch (face) {
    case 'happy':
    case 'sing':
      return (
        <>
          <HappyEye cx={EYE_L} />
          <HappyEye cx={EYE_R} />
        </>
      );
    case 'warm':
      return (
        <>
          <HappyEye cx={EYE_L} />
          <HappyEye cx={EYE_R} />
          <Brows angle={2.5} lift={3} />
        </>
      );
    case 'wink':
      return (
        <>
          <HappyEye cx={EYE_L} />
          <OpenEye cx={EYE_R} />
        </>
      );
    case 'love':
      return (
        <>
          <HeartEye cx={EYE_L} />
          <HeartEye cx={EYE_R} />
        </>
      );
    case 'star':
      return (
        <>
          <StarEye cx={EYE_L} />
          <StarEye cx={EYE_R} />
        </>
      );
    case 'dizzy':
      return (
        <>
          <DizzyEye cx={EYE_L} />
          <DizzyEye cx={EYE_R} />
        </>
      );
    case 'sleepy':
    case 'yawn':
      return (
        <>
          <ClosedEye cx={EYE_L} />
          <ClosedEye cx={EYE_R} />
        </>
      );
    case 'surprised':
      return (
        <>
          <OpenEye cx={EYE_L} scale={1.3} />
          <OpenEye cx={EYE_R} scale={1.3} />
        </>
      );
    case 'cry':
      return (
        <>
          <ClosedEye cx={EYE_L} />
          <ClosedEye cx={EYE_R} />
          <ellipse className="tear" cx={EYE_L - 2} cy={EYE_Y + 16} rx={4} ry={6} fill={C.tear} />
          <ellipse
            className="tear"
            cx={EYE_R + 2}
            cy={EYE_Y + 14}
            rx={3.4}
            ry={5}
            fill={C.tear}
            style={{ animationDelay: '0.6s' }}
          />
          <Brows angle={3} lift={2} />
        </>
      );
    case 'sad':
      return (
        <>
          <OpenEye cx={EYE_L} scale={0.9} />
          <OpenEye cx={EYE_R} scale={0.9} />
          <Brows angle={4} lift={3} />
        </>
      );
    case 'worried':
      return (
        <>
          <OpenEye cx={EYE_L} scale={0.95} />
          <OpenEye cx={EYE_R} scale={0.95} />
          <Brows angle={3.5} lift={2} />
        </>
      );
    case 'determined':
      return (
        <>
          <OpenEye cx={EYE_L} />
          <OpenEye cx={EYE_R} />
          <Brows angle={-3.5} lift={1} />
        </>
      );
    case 'peek':
      // ตามองขึ้นข้างบน เหมือนกำลังเหม่อ
      return (
        <g transform="translate(0 -3)">
          <OpenEye cx={EYE_L} scale={0.85} />
          <OpenEye cx={EYE_R} scale={0.85} />
        </g>
      );
    case 'pout':
      return (
        <>
          <OpenEye cx={EYE_L} />
          <OpenEye cx={EYE_R} />
          <Brows angle={-3} />
        </>
      );
    case 'blush':
    case 'normal':
    default:
      return (
        <>
          <OpenEye cx={EYE_L} />
          <OpenEye cx={EYE_R} />
        </>
      );
  }
}

function Mouth({ face }: { face: FaceId }) {
  const { x, y } = LOOK.mouth;

  switch (face) {
    case 'happy':
    case 'star':
      return (
        <g>
          <path d={`M${x - 11} ${y - 2} q11 16 22 0 z`} fill={C.mouth} />
          <path d={`M${x - 7} ${y + 2} q7 7 14 0 z`} fill="#E8517C" opacity={0.6} />
        </g>
      );
    case 'sing':
      return (
        <g>
          <ellipse cx={x} cy={y + 4} rx={8} ry={10} fill={C.mouth} />
          <ellipse cx={x} cy={y + 7} rx={4} ry={5} fill="#E8517C" opacity={0.55} />
        </g>
      );
    case 'warm':
    case 'love':
      return (
        <path
          d={`M${x - 10} ${y - 2} q10 12 20 0`}
          stroke={C.ink}
          strokeWidth={3.4}
          fill="none"
          strokeLinecap="round"
        />
      );
    case 'surprised':
      return <ellipse cx={x} cy={y + 2} rx={6} ry={7} fill={C.mouth} />;
    case 'yawn':
      return (
        <g>
          <ellipse cx={x} cy={y + 6} rx={11} ry={14} fill={C.mouth} />
          <ellipse cx={x} cy={y + 11} rx={6} ry={7} fill="#E8517C" opacity={0.55} />
        </g>
      );
    case 'sleepy':
      return (
        <path
          d={`M${x - 6} ${y + 2} q6 6 12 0`}
          stroke={C.ink}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
        />
      );
    case 'dizzy':
      return (
        <path
          d={`M${x - 12} ${y + 4} q5 -6 10 0 q5 6 10 0`}
          stroke={C.ink}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
        />
      );
    case 'cry':
    case 'sad':
      return (
        <path
          d={`M${x - 9} ${y + 6} q9 -8 18 0`}
          stroke={C.ink}
          strokeWidth={3.2}
          fill="none"
          strokeLinecap="round"
        />
      );
    case 'worried':
      return (
        <path
          d={`M${x - 10} ${y + 4} q5 -5 10 0 q5 5 10 0`}
          stroke={C.ink}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
        />
      );
    case 'determined':
      return (
        <path
          d={`M${x - 8} ${y + 1} q8 7 16 0`}
          stroke={C.ink}
          strokeWidth={3.4}
          fill="none"
          strokeLinecap="round"
        />
      );
    case 'peek':
      return <ellipse cx={x} cy={y + 2} rx={3.5} ry={3} fill={C.ink} opacity={0.75} />;
    case 'pout':
      return (
        <path
          d={`M${x - 9} ${y + 5} q9 -7 18 0`}
          stroke={C.ink}
          strokeWidth={3.2}
          fill="none"
          strokeLinecap="round"
        />
      );
    case 'blush':
    case 'normal':
    default:
      return (
        <path
          d={`M${x - 9} ${y - 2} q4.5 6 9 0 q4.5 6 9 0`}
          stroke={C.ink}
          strokeWidth={3.2}
          fill="none"
          strokeLinecap="round"
        />
      );
  }
}

function Character({ animation, face, animKey, onZoneTap, reducedMotion = false }: Props) {
  const cheekOpacity = face === 'blush' || face === 'love' || face === 'warm' ? 1 : 0.5;
  const animClass = reducedMotion ? 'anim-idle' : `anim-${animation}`;
  const canBlink = !reducedMotion && BLINKABLE.includes(face);

  // สุ่มจังหวะกะพริบต่อหนึ่งท่า จะได้ไม่กะพริบเป็นจังหวะเดิมทุกครั้ง
  const blinkDelay = useMemo(() => Math.random() * 3, []);

  const tap = (zone: ZoneId) => (e: ReactPointerEvent<SVGElement>) => {
    e.stopPropagation();
    onZoneTap(zone);
  };

  const earLeftX = LOOK.head.cx - LOOK.ears.offsetX;
  const earRightX = LOOK.head.cx + LOOK.ears.offsetX;

  return (
    // key ทำให้ div ถูกสร้างใหม่ทุกครั้งที่เล่นท่าใหม่ CSS animation จึงเริ่มจากเฟรมแรกเสมอ
    <div key={animKey} className={`character ${animClass}`}>
      <svg
        viewBox={`0 0 ${LOOK.viewBox.w} ${LOOK.viewBox.h}`}
        className="h-full w-full select-none overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="bodyShade" cx="38%" cy="32%" r="78%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="72%" stopColor={C.body} />
            <stop offset="100%" stopColor={C.shade} />
          </radialGradient>
        </defs>

        {/* เงาใต้ตัว ทำให้รู้สึกว่ามีน้ำหนักจริง */}
        <ellipse cx={LOOK.head.cx} cy={236} rx={54} ry={9} fill={C.ink} opacity={0.14} />

        {/* หาง */}
        <circle
          className="tail"
          cx={LOOK.tail.cx}
          cy={LOOK.tail.cy}
          r={LOOK.tail.r}
          fill="url(#bodyShade)"
          stroke={C.shade}
          strokeWidth={1.5}
        />

        {/* หู */}
        <g className="ear ear-left">
          <ellipse
            cx={earLeftX}
            cy={LOOK.ears.cy}
            rx={LOOK.ears.width}
            ry={LOOK.ears.len}
            fill="url(#bodyShade)"
            transform={`rotate(${-LOOK.ears.tilt} ${earLeftX} ${LOOK.ears.cy})`}
          />
          <ellipse
            cx={earLeftX - 2}
            cy={LOOK.ears.cy + 16}
            rx={9}
            ry={16}
            fill={C.blush}
            opacity={0.28}
            transform={`rotate(${-LOOK.ears.tilt} ${earLeftX} ${LOOK.ears.cy})`}
          />
        </g>
        <g className="ear ear-right">
          <ellipse
            cx={earRightX}
            cy={LOOK.ears.cy}
            rx={LOOK.ears.width}
            ry={LOOK.ears.len}
            fill="url(#bodyShade)"
            transform={`rotate(${LOOK.ears.tilt} ${earRightX} ${LOOK.ears.cy})`}
          />
          <ellipse
            cx={earRightX + 2}
            cy={LOOK.ears.cy + 16}
            rx={9}
            ry={16}
            fill={C.blush}
            opacity={0.28}
            transform={`rotate(${LOOK.ears.tilt} ${earRightX} ${LOOK.ears.cy})`}
          />
        </g>

        {/* เท้า */}
        <ellipse
          cx={LOOK.head.cx - LOOK.feet.offsetX}
          cy={LOOK.feet.cy}
          rx={LOOK.feet.rx}
          ry={LOOK.feet.ry}
          fill="url(#bodyShade)"
        />
        <ellipse
          cx={LOOK.head.cx + LOOK.feet.offsetX}
          cy={LOOK.feet.cy}
          rx={LOOK.feet.rx}
          ry={LOOK.feet.ry}
          fill="url(#bodyShade)"
        />

        {/* ตัว */}
        <ellipse
          cx={LOOK.body.cx}
          cy={LOOK.body.cy}
          rx={LOOK.body.rx}
          ry={LOOK.body.ry}
          fill="url(#bodyShade)"
        />

        {/* แขน — ยื่นออกมาตอนท่า comfort กับ reachOut */}
        <ellipse
          className="arm arm-left"
          cx={LOOK.head.cx - LOOK.arms.offsetX}
          cy={LOOK.arms.cy}
          rx={LOOK.arms.rx}
          ry={LOOK.arms.ry}
          fill="url(#bodyShade)"
        />
        <ellipse
          className="arm arm-right"
          cx={LOOK.head.cx + LOOK.arms.offsetX}
          cy={LOOK.arms.cy}
          rx={LOOK.arms.rx}
          ry={LOOK.arms.ry}
          fill="url(#bodyShade)"
        />

        {/* หัว */}
        <g className="head">
          <circle cx={LOOK.head.cx} cy={LOOK.head.cy} r={LOOK.head.r} fill="url(#bodyShade)" />
          {LOOK.tuft && (
            <path
              d={`M${LOOK.head.cx} ${LOOK.head.cy - LOOK.head.r + 2} q-8 -16 6 -22 q-2 12 8 16 q-6 4 -14 6 z`}
              fill="url(#bodyShade)"
            />
          )}

          <ellipse
            cx={LOOK.head.cx - LOOK.cheeks.offsetX}
            cy={LOOK.cheeks.y}
            rx={LOOK.cheeks.rx}
            ry={LOOK.cheeks.ry}
            fill={C.blush}
            opacity={cheekOpacity}
          />
          <ellipse
            cx={LOOK.head.cx + LOOK.cheeks.offsetX}
            cy={LOOK.cheeks.y}
            rx={LOOK.cheeks.rx}
            ry={LOOK.cheeks.ry}
            fill={C.blush}
            opacity={cheekOpacity}
          />

          {/* ตาและปากอยู่กลุ่มเดียวกัน จะได้ขยับพร้อมกันตอนมองซ้ายขวา */}
          <g className="face-parts">
            <Eyes face={face} />
            {canBlink && (
              <>
                <BlinkLid cx={EYE_L} delay={blinkDelay} />
                <BlinkLid cx={EYE_R} delay={blinkDelay} />
              </>
            )}
            <Mouth face={face} />
          </g>

          {(face === 'sleepy' || face === 'yawn') && (
            <g className="zzz" fill={C.ink} opacity={0.65} fontSize="20" fontWeight="700">
              <text x={186} y={62}>
                z
              </text>
              <text x={202} y={44}>
                z
              </text>
            </g>
          )}

          {face === 'sing' && (
            <g className="notes" fill={C.ink} opacity={0.7} fontSize="22">
              <text x={192} y={70}>
                ♪
              </text>
              <text x={212} y={50} fontSize="16">
                ♫
              </text>
            </g>
          )}
        </g>

        {/* ---- โซนแตะ มองไม่เห็นแต่กดได้ อันหลังอยู่บนสุด ---- */}
        <g fill="transparent" pointerEvents="all" style={{ cursor: 'pointer' }}>
          <rect
            x={0}
            y={0}
            width={LOOK.viewBox.w}
            height={LOOK.viewBox.h}
            onPointerDown={tap('any')}
          />
          <ellipse
            cx={LOOK.body.cx}
            cy={LOOK.body.cy + 8}
            rx={LOOK.body.rx + 2}
            ry={LOOK.body.ry + 4}
            onPointerDown={tap('belly')}
          />
          <circle cx={LOOK.head.cx} cy={LOOK.head.cy} r={LOOK.head.r} onPointerDown={tap('head')} />
          <ellipse
            cx={earLeftX}
            cy={LOOK.ears.cy}
            rx={LOOK.ears.width + 3}
            ry={LOOK.ears.len + 2}
            transform={`rotate(${-LOOK.ears.tilt} ${earLeftX} ${LOOK.ears.cy})`}
            onPointerDown={tap('ears')}
          />
          <ellipse
            cx={earRightX}
            cy={LOOK.ears.cy}
            rx={LOOK.ears.width + 3}
            ry={LOOK.ears.len + 2}
            transform={`rotate(${LOOK.ears.tilt} ${earRightX} ${LOOK.ears.cy})`}
            onPointerDown={tap('ears')}
          />
          <circle
            cx={LOOK.tail.cx}
            cy={LOOK.tail.cy}
            r={LOOK.tail.r + 3}
            onPointerDown={tap('tail')}
          />
        </g>
      </svg>
    </div>
  );
}

export default memo(Character);
