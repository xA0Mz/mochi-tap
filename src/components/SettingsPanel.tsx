import { useRef, useState } from 'react';
import type { Background } from '../types';
import Scene from './scenes/Scene';
import { fileToResizedDataUrl } from '../lib/image';

interface Props {
  open: boolean;
  onClose: () => void;
  backgrounds: Background[];
  currentId: string;
  customImage: string | null;
  totalTaps: number;
  soundOn: boolean;
  onSelectBackground: (id: string) => void;
  onCustomImage: (dataUrl: string | null) => void;
  onToggleSound: (on: boolean) => void;
  onReset: () => void;
}

export default function SettingsPanel({
  open,
  onClose,
  backgrounds,
  currentId,
  customImage,
  totalTaps,
  soundOn,
  onSelectBackground,
  onCustomImage,
  onToggleSound,
  onReset,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    try {
      const dataUrl = await fileToResizedDataUrl(file);
      onCustomImage(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ใช้รูปนี้ไม่ได้ ลองรูปอื่นนะ');
    }
  };

  return (
    <>
      {/* ฉากหลังทึบ กดแล้วปิด */}
      <div
        className={`fixed inset-0 z-40 bg-ink/35 transition-opacity duration-200 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <section
        role="dialog"
        aria-label="ตั้งค่า"
        aria-hidden={!open}
        className={[
          'fixed inset-x-0 bottom-0 z-50 max-h-[78vh] overflow-y-auto rounded-t-3xl bg-milk',
          'px-5 pt-4 text-ink shadow-puff transition-transform duration-300 ease-out',
          'pb-[calc(1.5rem+env(safe-area-inset-bottom))]',
          // ตอนปิดต้องกดทะลุไม่ได้ ไม่งั้นแผงที่เลื่อนลงไปแล้วยังบังปุ่มอยู่
          open ? 'translate-y-0' : 'pointer-events-none translate-y-full',
        ].join(' ')}
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-ink/20" />

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">ตั้งค่า</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-ink/10 px-3 py-1 text-sm hover:bg-ink/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-berry"
          >
            ปิด
          </button>
        </div>

        <h3 className="mb-2 text-sm font-semibold">ฉากหลัง</h3>
        <div className="grid grid-cols-3 gap-2.5">
          {backgrounds.map((bg) => {
            const locked = totalTaps < bg.unlockAt;
            const active = !customImage && bg.id === currentId;
            return (
              <button
                key={bg.id}
                type="button"
                disabled={locked}
                onClick={() => {
                  onCustomImage(null);
                  onSelectBackground(bg.id);
                }}
                className={[
                  'relative aspect-[4/3] overflow-hidden rounded-xl text-[0.7rem] font-medium',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-berry',
                  active ? 'ring-2 ring-berry ring-offset-2 ring-offset-milk' : 'ring-1 ring-ink/10',
                  locked ? 'cursor-not-allowed' : '',
                ].join(' ')}
                style={{ background: `linear-gradient(180deg, ${bg.sky.join(', ')})` }}
              >
                {/* ตัวอย่างฉากย่อส่วน ใช้ component เดียวกับของจริง */}
                <span className="absolute inset-0">
                  <Scene id={bg.scene} />
                </span>
                <span
                  className={`absolute inset-x-0 bottom-0 bg-gradient-to-t px-1 py-0.5 ${
                    bg.dark ? 'from-black/55 text-white' : 'from-white/75 text-ink'
                  }`}
                >
                  {bg.name}
                </span>
                {locked && (
                  <span className="absolute inset-0 grid place-content-center gap-0.5 bg-ink/55 text-center text-[0.65rem] leading-tight text-white">
                    <span aria-hidden="true">🔒</span>
                    <span>แตะครบ {bg.unlockAt}</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <h3 className="mb-2 mt-5 text-sm font-semibold">รูปของตัวเอง</h3>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded-full bg-berry px-4 py-2 text-sm font-medium text-white shadow-puff focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink"
          >
            เลือกรูปจากเครื่อง
          </button>
          {customImage && (
            <button
              type="button"
              onClick={() => onCustomImage(null)}
              className="rounded-full bg-ink/10 px-4 py-2 text-sm hover:bg-ink/15"
            >
              เอารูปออก
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              void handleFile(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </div>
        <p className="mt-1.5 text-xs opacity-70">
          รูปถูกย่อและเก็บไว้ในเครื่องนี้เท่านั้น ไม่มีการอัปโหลดขึ้นเซิร์ฟเวอร์
        </p>
        {error && <p className="mt-1.5 text-xs font-medium text-berry">{error}</p>}

        <h3 className="mb-2 mt-5 text-sm font-semibold">เสียง</h3>
        <button
          type="button"
          role="switch"
          aria-checked={soundOn}
          onClick={() => onToggleSound(!soundOn)}
          className="flex w-full items-center justify-between rounded-xl bg-ink/5 px-4 py-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-berry"
        >
          <span>เสียงตอนแตะ</span>
          <span
            className={`relative h-6 w-11 rounded-full transition-colors ${
              soundOn ? 'bg-mint' : 'bg-ink/25'
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                soundOn ? 'left-[1.375rem]' : 'left-0.5'
              }`}
            />
          </span>
        </button>

        <h3 className="mb-2 mt-5 text-sm font-semibold">เริ่มใหม่</h3>
        {confirmReset ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                onReset();
                setConfirmReset(false);
              }}
              className="flex-1 rounded-xl bg-berry px-4 py-2.5 text-sm font-medium text-white"
            >
              ลบข้อมูลทั้งหมด
            </button>
            <button
              type="button"
              onClick={() => setConfirmReset(false)}
              className="flex-1 rounded-xl bg-ink/10 px-4 py-2.5 text-sm"
            >
              ไม่ลบแล้ว
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="w-full rounded-xl bg-ink/5 px-4 py-2.5 text-left text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-berry"
          >
            ล้างยอดแตะ ฉากที่ปลดล็อก และป้ายพิเศษจาก Dev ในเครื่องนี้
          </button>
        )}
        <p className="mt-1.5 text-xs opacity-70">
          ยอดรวมของทุกคนบนเซิร์ฟเวอร์จะไม่ถูกลบ
        </p>
      </section>
    </>
  );
}
