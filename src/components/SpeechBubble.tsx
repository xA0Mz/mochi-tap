interface Props {
  message: string | null;
  /** ข้อความจากสถานการณ์พิเศษ จะได้กรอบสีต่างจากข้อความสุ่มธรรมดา */
  special?: boolean;
  /** เปลี่ยนค่าเพื่อให้กรอบเด้งขึ้นใหม่ */
  bubbleKey: number;
}

export default function SpeechBubble({ message, special = false, bubbleKey }: Props) {
  // จองที่ว่างไว้เสมอ ตัวละครจะได้ไม่ขยับขึ้นลงตอนกรอบโผล่
  if (!message) return <div className="h-[124px] w-full" aria-hidden="true" />;

  return (
    <div className="flex h-[124px] w-full items-end justify-center px-4">
      <div
        key={bubbleKey}
        role="status"
        aria-live="polite"
        className={[
          'bubble-pop relative max-w-[21rem] rounded-[1.6rem] px-5 py-3 text-center',
          'text-[0.95rem] leading-snug shadow-puff',
          special
            ? 'bg-berry text-white'
            : 'bg-white/95 text-ink',
        ].join(' ')}
      >
        {message}
        <span
          className={[
            'absolute -bottom-[7px] left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 rounded-[3px]',
            special ? 'bg-berry' : 'bg-white/95',
          ].join(' ')}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
