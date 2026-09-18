import { useEffect, useState } from 'react';

export interface Tilt {
  /** -1 ถึง 1 */
  x: number;
  y: number;
}

/**
 * คืนค่าการเอียงเครื่อง (มือถือ) หรือตำแหน่งเมาส์ (เดสก์ท็อป) ในช่วง -1 ถึง 1
 * ปิดตัวเองอัตโนมัติถ้าผู้ใช้ตั้งค่า prefers-reduced-motion
 *
 * หมายเหตุ iOS 13+ ต้องขอสิทธิ์ deviceorientation ผ่านการแตะของผู้ใช้
 * ที่นี่เลือกไม่ขอ เพื่อไม่ให้มี popup มากวนตอนเข้าเว็บ ถ้าไม่ได้สิทธิ์ก็ตกไปใช้เมาส์แทน
 */
export function useParallax(enabled = true): Tilt {
  const [tilt, setTilt] = useState<Tilt>({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    const set = (x: number, y: number) => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        setTilt({ x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) });
      });
    };

    const onOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return;
      set(e.gamma / 35, (e.beta - 45) / 45);
    };

    const onMouse = (e: MouseEvent) => {
      set(
        (e.clientX / window.innerWidth) * 2 - 1,
        (e.clientY / window.innerHeight) * 2 - 1,
      );
    };

    window.addEventListener('deviceorientation', onOrientation);
    window.addEventListener('mousemove', onMouse);
    return () => {
      window.removeEventListener('deviceorientation', onOrientation);
      window.removeEventListener('mousemove', onMouse);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [enabled]);

  return tilt;
}

/** true ถ้าผู้ใช้ขอให้ลดการเคลื่อนไหว */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return reduced;
}
