import { useCallback, useEffect, useRef, useState } from 'react';
import type { AnimationId, EngineResult, FaceId } from '../types';
import { pushRecent } from '../lib/random';

/** ท่านี้มาจากไหน — 'tap' คือผู้ใช้แตะเอง, 'auto' คือระบบสั่ง (ทักทาย ปลอบใจ ท่าแอมเบียนต์) */
export type ReactionOrigin = 'tap' | 'auto';

interface CurrentState {
  result: EngineResult;
  origin: ReactionOrigin;
  /** เพิ่มขึ้นทุกครั้งที่เล่นท่าใหม่ ใช้เป็น React key เพื่อให้ CSS animation เริ่มใหม่ */
  key: number;
}

/**
 * เก็บว่าตอนนี้กำลังเล่นท่าอะไร และคืนไปเป็น idle เองเมื่อครบเวลา
 * ท่าใหม่จะแทนที่ท่าเดิมได้ทันที (interrupt) เพื่อให้แตะรัว ๆ แล้วยังรู้สึกตอบสนอง
 */
export function useReactionEngine() {
  const [current, setCurrent] = useState<CurrentState | null>(null);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const keyRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const play = useCallback((result: EngineResult, origin: ReactionOrigin = 'auto') => {
    clearTimer();
    keyRef.current += 1;
    setCurrent({ result, origin, key: keyRef.current });
    setRecentIds((prev) => pushRecent(prev, result.reaction.id, 3));

    timerRef.current = window.setTimeout(() => {
      setCurrent(null);
      timerRef.current = null;
    }, result.reaction.duration);
  }, []);

  const stop = useCallback(() => {
    clearTimer();
    setCurrent(null);
  }, []);

  useEffect(() => clearTimer, []);

  const animation: AnimationId = current?.result.reaction.animation ?? 'idle';
  const face: FaceId = current?.result.reaction.face ?? 'normal';

  return {
    current,
    recentIds,
    animation,
    face,
    message: current?.result.message ?? null,
    isSpecial: current?.result.special ?? false,
    animKey: current?.key ?? 0,
    play,
    stop,
  };
}
