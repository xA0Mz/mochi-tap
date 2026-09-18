import reactionsData from '../data/reactions.json';
import eventsData from '../data/events.json';
import type { EngineResult, Reaction, SpecialEvent, TapContext, VisitInfo } from '../types';
import { pickOne, weightedPick, weightedPickAvoiding } from './random';

// JSON ไม่มี type ติดมา จึง cast ครั้งเดียวตรงนี้
export const REACTIONS = reactionsData as unknown as Reaction[];
export const EVENTS = eventsData as unknown as SpecialEvent[];

const byId = new Map(REACTIONS.map((r) => [r.id, r]));

/** ท่าสำรองเผื่อหา id ไม่เจอ จะได้ไม่ค้างทั้งจอ */
const FALLBACK: Reaction = {
  id: 'fallback',
  animation: 'jump',
  face: 'happy',
  weight: 1,
  duration: 900,
  messages: ['ว่าไงง~'],
};

export function getReaction(id: string): Reaction {
  return byId.get(id) ?? FALLBACK;
}

/**
 * สร้างผลลัพธ์หนึ่งชุด
 * ถ้าไม่ส่ง message มาและท่านั้นไม่มีข้อความเลย จะได้ null = ไม่ขึ้นกรอบคำพูด
 */
export function build(
  reaction: Reaction,
  message: string | undefined,
  special: boolean,
): EngineResult {
  return {
    reaction,
    message: message ?? pickOne(reaction.messages) ?? null,
    special,
  };
}

/** สร้างผลลัพธ์จาก id ของท่า ใช้ตอนสั่งท่าตรง ๆ เช่นในโหมดปลอบใจ */
export function resultFrom(reactionId: string, message?: string): EngineResult {
  return build(getReaction(reactionId), message, true);
}

/** ช่วงเวลาข้ามเที่ยงคืนได้ เช่น 22 ถึง 5 */
function hourInRange(hour: number, from: number, to: number): boolean {
  return from <= to ? hour >= from && hour < to : hour >= from || hour < to;
}

/**
 * ท่าทักทายตอนเปิดเว็บ
 * ลำดับ: เข้าครั้งแรก > หายไปนาน > ช่วงเวลาของวัน > ไม่ทักอะไรเลย
 */
export function pickGreeting(visit: VisitInfo): EngineResult | null {
  const first = EVENTS.find((e) => e.trigger === 'firstVisit');
  if (visit.isFirstVisit && first) {
    return build(getReaction(first.reaction), first.message, true);
  }

  const back = EVENTS.filter(
    (e): e is Extract<SpecialEvent, { trigger: 'returnAfter' }> => e.trigger === 'returnAfter',
  )
    .filter((e) => visit.daysSinceLastVisit >= e.days)
    .sort((a, b) => b.days - a.days)[0];
  if (back) return build(getReaction(back.reaction), back.message, true);

  const timed = EVENTS.filter(
    (e): e is Extract<SpecialEvent, { trigger: 'timeOfDay' }> => e.trigger === 'timeOfDay',
  ).find((e) => hourInRange(visit.hour, e.fromHour, e.toHour));
  if (timed) return build(getReaction(timed.reaction), timed.message, true);

  return null;
}

/**
 * ท่าตอนแตะ
 * ลำดับ: แตะครบหลักไมล์ > แตะรัวเกินกำหนด > สุ่มถ่วงน้ำหนักตามโซนที่แตะ
 */
export function pickTapReaction(ctx: TapContext, seenMilestones: readonly number[]): EngineResult {
  const milestone = EVENTS.filter(
    (e): e is Extract<SpecialEvent, { trigger: 'clickCount' }> => e.trigger === 'clickCount',
  ).find((e) => e.at === ctx.totalTaps && !seenMilestones.includes(e.at));
  if (milestone) return build(getReaction(milestone.reaction), milestone.message, true);

  const rapid = EVENTS.filter(
    (e): e is Extract<SpecialEvent, { trigger: 'rapidClick' }> => e.trigger === 'rapidClick',
  ).find((e) => ctx.rapidCount >= e.threshold);
  if (rapid) return build(getReaction(rapid.reaction), rapid.message, true);

  const pool = REACTIONS.filter((r) => {
    if (r.weight <= 0) return false;
    if (!r.zones || r.zones.length === 0) return true;
    return r.zones.includes(ctx.zone) || r.zones.includes('any');
  });

  const picked = weightedPickAvoiding(pool, ctx.recentIds) ?? FALLBACK;
  return build(picked, undefined, false);
}

/**
 * ท่าเล็ก ๆ ที่น้องทำเองตอนไม่มีใครแตะ เช่น มองซ้ายขวา กระดิกหู ยืดเส้น
 * ใช้ idleWeight แทน weight เพื่อไม่ให้ปนกับท่าตอนแตะ
 */
const AMBIENT_POOL = REACTIONS.filter((r) => (r.idleWeight ?? 0) > 0).map((r) => ({
  ...r,
  weight: r.idleWeight ?? 0,
}));

export function pickAmbientIdle(avoidIds: readonly string[] = []): EngineResult | null {
  const filtered = AMBIENT_POOL.filter((r) => !avoidIds.includes(r.id));
  const picked = weightedPick(filtered.length > 0 ? filtered : AMBIENT_POOL);
  if (!picked) return null;
  return build(getReaction(picked.id), undefined, false);
}

/** ท่าตอนอยู่เฉย ๆ นานจนหลับ */
export function getIdleEvent(): Extract<SpecialEvent, { trigger: 'idle' }> | null {
  return (
    EVENTS.find((e): e is Extract<SpecialEvent, { trigger: 'idle' }> => e.trigger === 'idle') ?? null
  );
}

export function idleResult(): EngineResult | null {
  const evt = getIdleEvent();
  if (!evt) return null;
  return build(getReaction(evt.reaction), evt.message, true);
}
