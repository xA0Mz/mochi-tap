import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchGlobalTotal, hasSupabase, pushTaps } from '../lib/supabase';

const FLUSH_INTERVAL_MS = 5000;
const POLL_INTERVAL_MS = 30000;

/**
 * ยอดแตะรวมของทุกคน
 *
 * ไม่ยิง API ทุกครั้งที่แตะ แต่สะสมไว้แล้วส่งรวบทุก 5 วินาที
 * (หรือทันทีตอนปิดแท็บ) เพื่อไม่ให้เกินโควต้า free tier
 * ตัวเลขบนจอบวกให้เห็นทันทีแบบ optimistic แล้วค่อยแก้เป็นค่าจริงจากเซิร์ฟเวอร์
 */
export function useGlobalCounter() {
  const [total, setTotal] = useState<number | null>(null);
  const [online, setOnline] = useState(hasSupabase);
  const pendingRef = useRef(0);
  const sendingRef = useRef(false);

  const flush = useCallback(async () => {
    if (!hasSupabase || sendingRef.current) return;
    const n = pendingRef.current;
    if (n < 1) return;

    sendingRef.current = true;
    pendingRef.current = 0;
    const result = await pushTaps(n);
    sendingRef.current = false;

    if (result === null) {
      // ส่งไม่สำเร็จ เก็บกลับเข้าคิวไว้ลองใหม่รอบหน้า
      pendingRef.current += n;
      setOnline(false);
    } else {
      setOnline(true);
      setTotal(result);
    }
  }, []);

  const add = useCallback((n = 1) => {
    if (!hasSupabase) return;
    pendingRef.current += n;
    setTotal((t) => (t === null ? t : t + n));
  }, []);

  // โหลดค่าเริ่มต้น
  useEffect(() => {
    if (!hasSupabase) return;
    let alive = true;
    void fetchGlobalTotal().then((v) => {
      if (!alive) return;
      if (v === null) setOnline(false);
      else setTotal(v);
    });
    return () => {
      alive = false;
    };
  }, []);

  // ส่งยอดที่ค้างเป็นรอบ ๆ
  useEffect(() => {
    if (!hasSupabase) return;
    const id = window.setInterval(() => void flush(), FLUSH_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [flush]);

  // ดึงค่าล่าสุดมาอัปเดต เฉพาะตอนไม่มียอดค้าง จะได้ไม่ทับค่า optimistic
  useEffect(() => {
    if (!hasSupabase) return;
    const id = window.setInterval(() => {
      if (pendingRef.current === 0 && !sendingRef.current) {
        void fetchGlobalTotal().then((v) => {
          if (v !== null) setTotal(v);
        });
      }
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  // ปิดแท็บ/สลับแอปแล้วต้องไม่ทำยอดหาย
  useEffect(() => {
    if (!hasSupabase) return;
    const onHide = () => {
      if (document.visibilityState === 'hidden') void flush();
    };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', flush);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', flush);
    };
  }, [flush]);

  return { total, add, enabled: hasSupabase, online };
}
