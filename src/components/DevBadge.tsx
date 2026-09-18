import { useCallback, useEffect, useRef, useState } from 'react';
import { pickOne } from '../lib/random';

interface Props {
  unlocked: boolean;
  /** true แค่ตอนเพิ่งปลดล็อกครั้งแรก ใช้เล่นเอฟเฟกต์เรืองแสงชั่วคราว */
  justUnlocked: boolean;
  messages: string[];
  dark: boolean;
  /** ซ่อนชั่วคราวตอนมีแผงอื่นเปิดอยู่ (โหมดปลอบใจ / ตั้งค่า) กันบังกัน */
  hidden: boolean;
}

const GLOW_DURATION_MS = 4500;

/**
 * ป้ายลอยมุมขวาล่าง กดแล้วสุ่มข้อความให้กำลังใจจาก Dev ขึ้นมาเป็นบับเบิล
 * ปลดล็อกเมื่อผู้ใช้เปิดดูครบทุกหัวข้อในโหมด "วันนี้เป็นอะไรมา"
 * ดูวิธีแก้ข้อความหรือเงื่อนไขปลดล็อกได้ที่ docs/CONTENT.md หัวข้อ 6
 */
export default function DevBadge({ unlocked, justUnlocked, messages, dark, hidden }: Props) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [glowing, setGlowing] = useState(false);
  const lastMessageRef = useRef<string | null>(null);
  const glowTimerRef = useRef<number | null>(null);

  // เล่นเอฟเฟกต์เรืองแสงสั้น ๆ แค่ครั้งแรกที่ปลดล็อก แล้วดับเอง ไม่ต้องรอ parent มาสั่งปิด
  useEffect(() => {
    if (!justUnlocked) return;
    setGlowing(true);
    glowTimerRef.current = window.setTimeout(() => setGlowing(false), GLOW_DURATION_MS);
    return () => {
      if (glowTimerRef.current !== null) window.clearTimeout(glowTimerRef.current);
    };
  }, [justUnlocked]);

  const handleToggle = useCallback(() => {
    setGlowing(false);
    setOpen((wasOpen) => {
      if (wasOpen) return false;

      // เลี่ยงไม่ให้สุ่มได้ข้อความเดิมซ้ำติดกันสองครั้ง
      const pool =
        messages.length > 1 ? messages.filter((m) => m !== lastMessageRef.current) : messages;
      const next = pickOne(pool) ?? messages[0] ?? '';
      lastMessageRef.current = next;
      setMessage(next);
      return true;
    });
  }, [messages]);

  if (!unlocked || hidden) return null;

  return (
    <div
      className="fixed right-4 z-40 flex flex-col items-end gap-2"
      style={{ bottom: 'calc(6rem + env(safe-area-inset-bottom))' }}
    >
      {open && message && (
        <div
          role="status"
          aria-live="polite"
          className={[
            'bubble-pop relative max-w-[15rem] rounded-2xl px-4 py-3 text-sm leading-snug shadow-puff',
            dark ? 'bg-white text-ink' : 'bg-white text-ink ring-1 ring-ink/10',
          ].join(' ')}
        >
          {message}
          <span
            className="absolute -bottom-[6px] right-6 h-3 w-3 rotate-45 rounded-[2px] bg-white"
            aria-hidden="true"
          />
        </div>
      )}

      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={open}
        aria-label={open ? 'ปิดข้อความจาก Dev' : 'เปิดข้อความจาก Dev'}
        className={[
          'dev-badge-float flex h-12 w-12 items-center justify-center rounded-full text-xl shadow-puff',
          'transition-transform active:scale-90',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-berry',
          glowing ? 'dev-badge-glow' : '',
          dark ? 'bg-white/90 text-ink' : 'bg-berry text-white',
        ].join(' ')}
      >
        <span aria-hidden="true">💌</span>
      </button>
    </div>
  );
}
