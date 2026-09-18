interface Props {
  sessionTaps: number;
  totalTaps: number;
  globalTotal: number | null;
  globalEnabled: boolean;
  /** ฉากถัดไปที่จะปลดล็อก ใส่ null ถ้าปลดครบแล้ว */
  nextUnlock: { name: string; at: number } | null;
  dark: boolean;
}

const nf = new Intl.NumberFormat('th-TH');

export default function CounterPanel({
  sessionTaps,
  totalTaps,
  globalTotal,
  globalEnabled,
  nextUnlock,
  dark,
}: Props) {
  const remaining = nextUnlock ? Math.max(0, nextUnlock.at - totalTaps) : 0;
  const progress = nextUnlock ? Math.min(100, (totalTaps / nextUnlock.at) * 100) : 100;

  return (
    <aside
      className={[
        'pointer-events-none absolute right-3 top-3 z-20 w-[9.5rem] rounded-2xl px-3 py-2.5',
        'backdrop-blur-md shadow-puff',
        dark ? 'bg-black/35 text-white' : 'bg-white/70 text-ink',
      ].join(' ')}
    >
      <p className="text-[0.7rem] opacity-70">แตะรอบนี้</p>
      <p className="-mt-0.5 font-bold leading-none" style={{ fontSize: '2rem' }}>
        {nf.format(sessionTaps)}
      </p>

      <dl className="mt-2 space-y-0.5 text-[0.7rem] leading-tight opacity-80">
        <div className="flex justify-between gap-2">
          <dt>สะสมทั้งหมด</dt>
          <dd className="font-semibold">{nf.format(totalTaps)}</dd>
        </div>
        {globalEnabled && (
          <div className="flex justify-between gap-2">
            <dt>ทุกคนรวมกัน</dt>
            <dd className="font-semibold">{globalTotal === null ? '—' : nf.format(globalTotal)}</dd>
          </div>
        )}
      </dl>

      {nextUnlock && (
        <div className="mt-2">
          <div className={`h-1.5 w-full overflow-hidden rounded-full ${dark ? 'bg-white/20' : 'bg-ink/15'}`}>
            <div
              className="h-full rounded-full bg-berry transition-[width] duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1 text-[0.65rem] leading-tight opacity-75">
            อีก {nf.format(remaining)} ครั้งได้ฉาก{nextUnlock.name}
          </p>
        </div>
      )}
    </aside>
  );
}
