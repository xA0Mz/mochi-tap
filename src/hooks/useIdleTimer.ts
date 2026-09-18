import { useCallback, useEffect, useRef } from 'react';

/**
 * เรียก onIdle เมื่อไม่มีการแตะนานเกิน delayMs
 * ใช้ ref เก็บ callback เพื่อไม่ต้องตั้งเวลาใหม่ทุกครั้งที่ parent re-render
 */
export function useIdleTimer(delayMs: number, onIdle: () => void, enabled = true) {
  const timerRef = useRef<number | null>(null);
  const callbackRef = useRef(onIdle);

  useEffect(() => {
    callbackRef.current = onIdle;
  }, [onIdle]);

  const clear = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const restart = useCallback(() => {
    clear();
    if (!enabled) return;
    timerRef.current = window.setTimeout(() => callbackRef.current(), delayMs);
  }, [clear, delayMs, enabled]);

  // เริ่มจับเวลาตั้งแต่เปิดหน้า และล้างทิ้งตอน unmount
  useEffect(() => {
    restart();
    return clear;
  }, [restart, clear]);

  // แท็บที่ถูกซ่อนอยู่ไม่ควรนับเวลา idle
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') clear();
      else restart();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [clear, restart]);

  return { restart, clear };
}
