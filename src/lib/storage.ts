// อ่าน/เขียน localStorage แบบกันพัง
// Safari โหมดส่วนตัว หรือเบราว์เซอร์ที่ปิดคุกกี้ จะ throw ตอนเขียน
// ทุกฟังก์ชันในนี้จึงห่อ try/catch ไว้ แอปยังเล่นได้แค่ไม่จำค่า

const PREFIX = 'mochi-tap:';

export const KEYS = {
  totalTaps: 'totalTaps',
  firstVisitAt: 'firstVisitAt',
  lastVisitAt: 'lastVisitAt',
  backgroundId: 'backgroundId',
  customBackground: 'customBackground',
  soundOn: 'soundOn',
  seenMilestones: 'seenMilestones',
  /** หัวข้อในโหมดปลอบใจที่เคยเลือกแล้ว ใช้ปลดล็อกป้ายพิเศษของ Dev */
  visitedComfortTopics: 'visitedComfortTopics',
  /** เคยโชว์เอฟเฟกต์ตอนปลดล็อกป้ายของ Dev ไปแล้วหรือยัง (โชว์แค่ครั้งแรกครั้งเดียว) */
  devBadgeGlowShown: 'devBadgeGlowShown',
} as const;

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    // เต็ม หรือเขียนไม่ได้ — ปล่อยผ่าน ไม่ต้องทำให้แอปล้ม
    return false;
  }
}

export function removeKey(key: string): void {
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {
    /* ไม่ต้องทำอะไร */
  }
}

/** ล้างข้อมูลทั้งหมดของแอปนี้ โดยไม่แตะคีย์ของเว็บอื่น */
export function clearAll(): void {
  try {
    const keys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(PREFIX)) keys.push(k);
    }
    keys.forEach((k) => window.localStorage.removeItem(k));
  } catch {
    /* ไม่ต้องทำอะไร */
  }
}
