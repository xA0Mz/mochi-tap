import { useEffect, useRef } from 'react';
import { pickAmbientIdle } from '../lib/engine';
import type { EngineResult } from '../types';

/** ช่วงเวลารอก่อนทำท่าถัดไป สุ่มระหว่างสองค่านี้ */
const MIN_GAP_MS = 6000;
const MAX_GAP_MS = 13000;
/** จำท่าล่าสุดกี่ท่าเพื่อไม่ให้ซ้ำติดกัน */
const MEMORY = 3;

/**
 * ทำให้น้องขยับเองเป็นระยะตอนไม่มีใครแตะ เช่น มองซ้ายขวา กระดิกหู ยืดเส้น ฮัมเพลง
 * คล้ายตัวการ์ตูนในแอนิเมชันที่ไม่เคยยืนนิ่งสนิท
 *
 * ตั้ง enabled เป็น false ตอนกำลังเล่นท่าอื่นอยู่ หรือตอนอยู่ในโหมดปลอบใจ
 */
export function useAmbientIdle(enabled: boolean, play: (result: EngineResult) => void) {
  const recentRef = useRef<string[]>([]);
  const timerRef = useRef<number | null>(null);
  const playRef = useRef(play);

  useEffect(() => {
    playRef.current = play;
  }, [play]);

  useEffect(() => {
    if (!enabled) return;

    const gap = MIN_GAP_MS + Math.random() * (MAX_GAP_MS - MIN_GAP_MS);
    timerRef.current = window.setTimeout(() => {
      const result = pickAmbientIdle(recentRef.current);
      if (!result) return;
      recentRef.current = [result.reaction.id, ...recentRef.current].slice(0, MEMORY);
      playRef.current(result);
    }, gap);

    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
    // enabled เปลี่ยนทุกครั้งที่ท่าจบ ทำให้ตั้งเวลารอบใหม่ให้เองโดยอัตโนมัติ
  }, [enabled]);
}
