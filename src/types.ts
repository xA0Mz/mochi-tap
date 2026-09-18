// ชนิดข้อมูลกลางที่ใช้ร่วมกันทั้งแอป
// อยากเพิ่มท่าใหม่หรือหน้าใหม่ ให้เพิ่มชื่อในนี้ก่อน แล้วค่อยไปเพิ่ม CSS / SVG ให้ตรงกัน
// ดูขั้นตอนละเอียดได้ที่ docs/CHARACTER.md

/** ท่าทางของตัวละคร — ต้องมี class `.anim-<id>` ใน src/index.css */
export type AnimationId =
  // ท่าพื้นฐาน
  | 'idle'
  | 'jump'
  | 'hop'
  | 'spin'
  | 'shake'
  | 'squish'
  | 'wiggle'
  | 'float'
  | 'tilt'
  | 'party'
  | 'sleep'
  // ท่าเล็ก ๆ ตอนอยู่เฉย (ambient idle)
  | 'lookAround'
  | 'stretch'
  | 'earTwitch'
  | 'hum'
  | 'nod'
  | 'lean'
  | 'sway'
  // ท่าตอนปลอบใจ
  | 'comfort'
  | 'reachOut';

/** สีหน้า — ต้องมี case ตรงกันใน components/Character.tsx */
export type FaceId =
  | 'normal'
  | 'happy'
  | 'blush'
  | 'wink'
  | 'love'
  | 'star'
  | 'surprised'
  | 'dizzy'
  | 'sleepy'
  | 'yawn'
  | 'cry'
  | 'pout'
  // เพิ่มสำหรับโหมดปลอบใจ
  | 'sad'
  | 'worried'
  | 'warm'
  | 'sing'
  | 'determined'
  | 'peek';

/** โซนที่แตะได้บนตัวละคร — `any` = แตะตรงไหนก็ออกท่านี้ได้ */
export type ZoneId = 'head' | 'ears' | 'belly' | 'tail' | 'any';

/** เสียง — สังเคราะห์ด้วย Web Audio ใน lib/audio.ts ไม่ต้องมีไฟล์เสียง */
export type SoundId =
  | 'pop'
  | 'chime'
  | 'boing'
  | 'sparkle'
  | 'snore'
  | 'fanfare'
  | 'wobble'
  | 'giggle'
  | 'blip'
  | 'soft'
  | 'sad'
  | 'hug'
  | 'note'
  | 'question';

export interface Reaction {
  id: string;
  animation: AnimationId;
  face: FaceId;
  /** น้ำหนักตอนแตะ ยิ่งมากยิ่งออกบ่อย — 0 = ไม่เข้าการสุ่มตอนแตะ */
  weight: number;
  /** น้ำหนักตอนอยู่เฉย ๆ — 0 หรือไม่ใส่ = ไม่เข้าการสุ่มท่าแอมเบียนต์ */
  idleWeight?: number;
  /** ข้อความที่จะสุ่มขึ้นในกรอบคำพูด ปล่อยว่างได้ถ้าไม่อยากให้มีข้อความ */
  messages: string[];
  /** ระยะเวลาที่ค้างท่านี้ก่อนกลับไป idle (มิลลิวินาที) */
  duration: number;
  sound?: SoundId;
  /** จำกัดว่าท่านี้ออกได้เฉพาะเมื่อแตะโซนไหน ไม่ใส่ = ทุกโซน */
  zones?: ZoneId[];
  /** อิโมจิที่จะกระเด็นออกมา */
  particles?: string[];
}

export type SpecialEvent =
  | { id: string; trigger: 'firstVisit'; reaction: string; message?: string }
  | { id: string; trigger: 'clickCount'; at: number; reaction: string; message?: string }
  | { id: string; trigger: 'rapidClick'; threshold: number; withinMs: number; reaction: string; message?: string }
  | { id: string; trigger: 'idle'; afterMs: number; reaction: string; message?: string }
  | { id: string; trigger: 'returnAfter'; days: number; reaction: string; message?: string }
  | { id: string; trigger: 'timeOfDay'; fromHour: number; toHour: number; reaction: string; message?: string };

/** ชื่อฉาก — ต้องมี case ตรงกันใน components/scenes/Scene.tsx */
export type SceneId = 'meadow' | 'bedroom' | 'beach' | 'night' | 'cafe' | 'sakura' | 'space';

export interface Background {
  id: string;
  name: string;
  scene: SceneId;
  /** ไล่สีท้องฟ้า บนลงล่าง อย่างน้อย 2 สี */
  sky: string[];
  /** ต้องแตะสะสมกี่ครั้งถึงปลดล็อก 0 = เปิดตั้งแต่แรก */
  unlockAt: number;
  /** true = ใช้ตัวอักษรสีอ่อนบนพื้นหลังเข้ม */
  dark?: boolean;
}

/** ---------- โหมดปลอบใจ ---------- */

/** ตัวเลือกย่อยหลังจากเลือกอารมณ์แล้ว */
export interface ComfortChoice {
  id: string;
  label: string;
  reaction: string;
  /** คำตอบของน้อง พูดทีละบรรทัด */
  lines: string[];
  /** ข้อความปิดท้ายหลังพูดจบ ไม่ใส่ = ใช้ค่าเริ่มต้น */
  closing?: string;
}

export interface ComfortTopic {
  id: string;
  label: string;
  emoji: string;
  /** บทพูดตอนเพิ่งเลือกหัวข้อ พูดทีละบรรทัด */
  opening: { reaction: string; line: string }[];
  /** ตัวเลือกที่โผล่หลังพูดจบ */
  choices: ComfortChoice[];
}

/** ---------- ผลลัพธ์จาก engine ---------- */

export interface EngineResult {
  reaction: Reaction;
  /** null = ไม่ต้องขึ้นกรอบคำพูด (ใช้กับท่าแอมเบียนต์) */
  message: string | null;
  /** มาจากสถานการณ์พิเศษหรือมาจากการสุ่ม ใช้ตกแต่งกรอบคำพูดให้ต่างกัน */
  special: boolean;
}

export interface TapContext {
  zone: ZoneId;
  totalTaps: number;
  rapidCount: number;
  recentIds: string[];
}

export interface VisitInfo {
  isFirstVisit: boolean;
  daysSinceLastVisit: number;
  hour: number;
}
