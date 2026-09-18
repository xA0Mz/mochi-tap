import { useCallback, useRef, useState } from 'react';
import { KEYS, readJSON, writeJSON } from '../lib/storage';

const RAPID_WINDOW_MS = 3000;

export function useClickTracker() {
  const [sessionTaps, setSessionTaps] = useState(0);
  const [totalTaps, setTotalTaps] = useState<number>(() => readJSON<number>(KEYS.totalTaps, 0));
  const [seenMilestones, setSeenMilestones] = useState<number[]>(() =>
    readJSON<number[]>(KEYS.seenMilestones, []),
  );

  // ref เก็บค่าจริงคู่ไปกับ state
  // ถ้าอ่านจาก state อย่างเดียว การแตะสองครั้งในเฟรมเดียวกันจะได้เลขซ้ำ เพราะ state ยังไม่ทันอัปเดต
  const totalRef = useRef(totalTaps);
  const stampsRef = useRef<number[]>([]);

  /** เรียกทุกครั้งที่แตะ — คืนยอดสะสมใหม่ และจำนวนครั้งที่แตะรัวติดกัน */
  const registerTap = useCallback(() => {
    const now = Date.now();
    stampsRef.current = [...stampsRef.current, now].filter((t) => now - t <= RAPID_WINDOW_MS);

    const nextTotal = totalRef.current + 1;
    totalRef.current = nextTotal;

    setTotalTaps(nextTotal);
    setSessionTaps((n) => n + 1);
    writeJSON(KEYS.totalTaps, nextTotal);

    return { totalTaps: nextTotal, rapidCount: stampsRef.current.length };
  }, []);

  const markMilestone = useCallback((at: number) => {
    setSeenMilestones((prev) => {
      if (prev.includes(at)) return prev;
      const next = [...prev, at];
      writeJSON(KEYS.seenMilestones, next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    stampsRef.current = [];
    totalRef.current = 0;
    setSessionTaps(0);
    setTotalTaps(0);
    setSeenMilestones([]);
    writeJSON(KEYS.totalTaps, 0);
    writeJSON(KEYS.seenMilestones, []);
  }, []);

  return { sessionTaps, totalTaps, seenMilestones, registerTap, markMilestone, reset };
}
