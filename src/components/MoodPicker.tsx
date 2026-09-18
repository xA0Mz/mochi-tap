import type { ComfortTopic } from '../types';
import type { ComfortPhase } from '../hooks/useComfortFlow';

interface Props {
  phase: ComfortPhase;
  topics: ComfortTopic[];
  topic: ComfortTopic | null;
  onSelectTopic: (id: string) => void;
  onSelectChoice: (id: string) => void;
  onClose: () => void;
}

/**
 * กล่องตัวเลือกที่โผล่ขึ้นมาจากด้านล่าง
 * โผล่สองจังหวะ: ตอนเลือกว่าวันนี้เป็นอะไรมา และตอนเลือกว่าอยากให้น้องทำอะไรต่อ
 * ระหว่างที่น้องกำลังพูด (phase 'speaking') กล่องจะหายไปเพื่อไม่บังตัวน้อง
 */
export default function MoodPicker({
  phase,
  topics,
  topic,
  onSelectTopic,
  onSelectChoice,
  onClose,
}: Props) {
  const visible = phase === 'picking' || phase === 'choosing';

  return (
    <div
      className={[
        'fixed inset-x-0 bottom-0 z-30 px-3',
        'pb-[calc(5.5rem+env(safe-area-inset-bottom))]',
        'transition-all duration-300 ease-out',
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0',
      ].join(' ')}
    >
      <div className="mx-auto max-w-md rounded-3xl bg-milk/95 p-4 text-ink shadow-puff backdrop-blur-md">
        {phase === 'picking' && (
          <>
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold leading-tight">วันนี้เป็นอะไรมา</h2>
                <p className="text-xs opacity-70">เลือกอันที่ใกล้เคียงที่สุดก็พอ</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-full bg-ink/10 px-3 py-1 text-xs hover:bg-ink/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-berry"
              >
                ไว้ก่อน
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {topics.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onSelectTopic(t.id)}
                  className="flex items-center gap-1.5 rounded-2xl bg-white px-3.5 py-2.5 text-sm font-medium shadow-sm ring-1 ring-ink/10 transition-transform active:scale-95 hover:ring-berry focus-visible:outline focus-visible:outline-2 focus-visible:outline-berry"
                >
                  <span aria-hidden="true">{t.emoji}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </>
        )}

        {phase === 'choosing' && topic && (
          <>
            <div className="mb-3 flex items-start justify-between gap-3">
              <h2 className="text-base font-semibold leading-tight">
                อยากให้เราทำอะไรต่อดี
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-full bg-ink/10 px-3 py-1 text-xs hover:bg-ink/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-berry"
              >
                พอแล้ว
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {topic.choices.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onSelectChoice(c.id)}
                  className="rounded-2xl bg-white px-4 py-3 text-left text-sm font-medium shadow-sm ring-1 ring-ink/10 transition-transform active:scale-[0.98] hover:ring-berry focus-visible:outline focus-visible:outline-2 focus-visible:outline-berry"
                >
                  {c.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
