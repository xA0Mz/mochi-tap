/** สุ่มหนึ่งตัวจาก array — คืน undefined ถ้า array ว่าง */
export function pickOne<T>(items: readonly T[]): T | undefined {
  if (items.length === 0) return undefined;
  return items[Math.floor(Math.random() * items.length)];
}

/**
 * สุ่มแบบถ่วงน้ำหนัก ยิ่ง weight มากยิ่งออกบ่อย
 * รายการที่ weight <= 0 จะไม่ถูกเลือก
 */
export function weightedPick<T extends { weight: number }>(items: readonly T[]): T | undefined {
  const pool = items.filter((i) => i.weight > 0);
  if (pool.length === 0) return undefined;

  const total = pool.reduce((sum, i) => sum + i.weight, 0);
  let roll = Math.random() * total;

  for (const item of pool) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }
  return pool[pool.length - 1];
}

/**
 * สุ่มโดยพยายามเลี่ยง id ที่เพิ่งออกไป เพื่อไม่ให้รู้สึกว่าวนซ้ำ
 * ถ้าตัดออกแล้วไม่เหลืออะไรเลย จะยอมสุ่มจากของเดิมทั้งหมด
 */
export function weightedPickAvoiding<T extends { id: string; weight: number }>(
  items: readonly T[],
  avoidIds: readonly string[],
): T | undefined {
  const filtered = items.filter((i) => !avoidIds.includes(i.id));
  return weightedPick(filtered.length > 0 ? filtered : items);
}

/** เก็บ id ล่าสุดไว้ไม่เกิน max ตัว (ตัวใหม่อยู่หน้าสุด) */
export function pushRecent(recent: readonly string[], id: string, max = 3): string[] {
  return [id, ...recent.filter((r) => r !== id)].slice(0, max);
}
