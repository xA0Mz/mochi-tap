import { useCallback, useEffect, useState } from 'react';
import devMessagesData from '../data/devMessages.json';
import { COMFORT_TOPICS } from './useComfortFlow';
import { KEYS, readJSON, writeJSON } from '../lib/storage';

export const DEV_MESSAGES = devMessagesData as unknown as string[];

/**
 * ปลดล็อกป้ายพิเศษ "Dev พร้อมเสมอ" ที่มุมขวาล่าง เมื่อผู้ใช้เปิดครบทุกหัวข้อ
 * ในโหมดปลอบใจ (ไม่ต้องเลือกตัวเลือกย่อยให้จบ แค่เปิดดูหัวข้อนั้นก็นับ)
 *
 * ความคืบหน้าเก็บไว้ใน localStorage เครื่องนี้เท่านั้น ไม่ส่งขึ้นเซิร์ฟเวอร์
 */
export function useDevBadge() {
  const [visited, setVisited] = useState<string[]>(() =>
    readJSON<string[]>(KEYS.visitedComfortTopics, []),
  );
  /** true แค่ช่วงสั้น ๆ ตอนปลดล็อกครั้งแรก ใช้เล่นเอฟเฟกต์เรืองแสง */
  const [justUnlocked, setJustUnlocked] = useState(false);

  const total = COMFORT_TOPICS.length;
  const unlocked = visited.length >= total;

  const markVisited = useCallback((topicId: string) => {
    setVisited((prev) => {
      if (prev.includes(topicId)) return prev;
      const next = [...prev, topicId];
      writeJSON(KEYS.visitedComfortTopics, next);
      return next;
    });
  }, []);

  // ตรวจตอนปลดล็อกครบพอดี ว่าเคยโชว์เอฟเฟกต์เรืองแสงไปหรือยัง
  // ทำแบบนี้แทนการดักจังหวะ transition ตรง ๆ เพราะกันกรณีรีโหลดหน้าหลังปลดล็อกไปแล้วด้วย
  useEffect(() => {
    if (!unlocked) return;
    const alreadyShown = readJSON<boolean>(KEYS.devBadgeGlowShown, false);
    if (alreadyShown) return;

    writeJSON(KEYS.devBadgeGlowShown, true);
    setJustUnlocked(true);
  }, [unlocked]);

  const reset = useCallback(() => {
    setVisited([]);
    setJustUnlocked(false);
    writeJSON(KEYS.visitedComfortTopics, []);
    writeJSON(KEYS.devBadgeGlowShown, false);
  }, []);

  return {
    unlocked,
    justUnlocked,
    progress: visited.length,
    total,
    markVisited,
    reset,
  };
}
