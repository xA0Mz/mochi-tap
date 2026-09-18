import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import backgroundsData from './data/backgrounds.json';
import Background from './components/Background';
import Character from './components/Character';
import CounterPanel from './components/CounterPanel';
import DevBadge from './components/DevBadge';
import MoodPicker from './components/MoodPicker';
import SettingsPanel from './components/SettingsPanel';
import SpeechBubble from './components/SpeechBubble';
import TapParticles, { type Particle } from './components/TapParticles';
import { useAmbientIdle } from './hooks/useAmbientIdle';
import { useClickTracker } from './hooks/useClickTracker';
import { useComfortFlow } from './hooks/useComfortFlow';
import { DEV_MESSAGES, useDevBadge } from './hooks/useDevBadge';
import { useGlobalCounter } from './hooks/useGlobalCounter';
import { useIdleTimer } from './hooks/useIdleTimer';
import { useParallax, usePrefersReducedMotion } from './hooks/useParallax';
import { useReactionEngine } from './hooks/useReactionEngine';
import { playSound, unlockAudio } from './lib/audio';
import { getIdleEvent, idleResult, pickGreeting, pickTapReaction } from './lib/engine';
import { clearAll, KEYS, readJSON, writeJSON } from './lib/storage';
import type { Background as Bg, VisitInfo, ZoneId } from './types';

const BACKGROUNDS = backgroundsData as unknown as Bg[];
const PARTICLE_LIFE_MS = 1100;

export default function App() {
  const reducedMotion = usePrefersReducedMotion();
  const tilt = useParallax(!reducedMotion);

  const { sessionTaps, totalTaps, seenMilestones, registerTap, markMilestone, reset } =
    useClickTracker();
  const engine = useReactionEngine();
  const global = useGlobalCounter();
  const comfort = useComfortFlow(engine.play);
  const devBadge = useDevBadge();

  const [backgroundId, setBackgroundId] = useState<string>(() =>
    readJSON<string>(KEYS.backgroundId, BACKGROUNDS[0].id),
  );
  const [customImage, setCustomImage] = useState<string | null>(() =>
    readJSON<string | null>(KEYS.customBackground, null),
  );
  const [soundOn, setSoundOn] = useState<boolean>(() => readJSON<boolean>(KEYS.soundOn, true));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  const particleSeq = useRef(0);
  const particleTimers = useRef<number[]>([]);
  const lastPointer = useRef({ x: 0, y: 0 });
  const visitRef = useRef<VisitInfo | null>(null);
  const characterRef = useRef<HTMLDivElement | null>(null);

  // ---------- ฉากปัจจุบัน ----------
  const background = useMemo(() => {
    const found = BACKGROUNDS.find((b) => b.id === backgroundId);
    // เผื่อกรณีรีเซ็ตแล้วฉากที่เลือกไว้กลับไปล็อก
    if (!found || totalTaps < found.unlockAt) return BACKGROUNDS[0];
    return found;
  }, [backgroundId, totalTaps]);

  const dark = customImage ? true : background.dark === true;

  const nextUnlock = useMemo(() => {
    const next = BACKGROUNDS.filter((b) => b.unlockAt > totalTaps).sort(
      (a, b) => a.unlockAt - b.unlockAt,
    )[0];
    return next ? { name: next.name, at: next.unlockAt } : null;
  }, [totalTaps]);

  // ---------- ทักทายตอนเปิดหน้า ----------
  useEffect(() => {
    // อ่านและบันทึกข้อมูลการเข้าเว็บแค่ครั้งเดียว
    // (StrictMode ตอน dev จะรัน effect สองรอบ ถ้าไม่กันไว้ รอบสองจะเห็นว่าเคยเข้าแล้ว)
    if (visitRef.current === null) {
      const now = Date.now();
      const firstVisitAt = readJSON<number | null>(KEYS.firstVisitAt, null);
      const lastVisitAt = readJSON<number | null>(KEYS.lastVisitAt, null);

      visitRef.current = {
        isFirstVisit: firstVisitAt === null,
        daysSinceLastVisit: lastVisitAt === null ? 0 : (now - lastVisitAt) / 86_400_000,
        hour: new Date().getHours(),
      };

      if (firstVisitAt === null) writeJSON(KEYS.firstVisitAt, now);
      writeJSON(KEYS.lastVisitAt, now);
    }

    const greeting = pickGreeting(visitRef.current);
    if (!greeting) return;

    const t = window.setTimeout(() => engine.play(greeting), 600);
    return () => window.clearTimeout(t);
    // ใส่ engine.play (identity คงที่) แทน engine ทั้งก้อน
    // ไม่งั้น effect จะถูกล้างใหม่ทุก render และ timeout ด้านบนจะไม่มีวันได้ทำงาน
  }, [engine.play]);

  // ---------- ท่าเล็ก ๆ ที่น้องทำเองตอนไม่มีใครแตะ ----------
  // เปิดเฉพาะตอนไม่มีท่าอื่นเล่นอยู่ ไม่ได้อยู่ในโหมดปลอบใจ และไม่ได้เปิดแผงตั้งค่า
  const ambientEnabled =
    !reducedMotion && engine.current === null && !comfort.active && !settingsOpen;
  useAmbientIdle(ambientEnabled, engine.play);

  // ---------- ปล่อยทิ้งไว้นานแล้วง่วง ----------
  const idleDelay = getIdleEvent()?.afterMs ?? 35_000;
  const { restart: restartIdle } = useIdleTimer(
    idleDelay,
    useCallback(() => {
      const result = idleResult();
      if (result) engine.play(result);
    }, [engine.play]),
    !comfort.active,
  );

  // ---------- อิโมจิกระเด็น ----------
  const spawnParticles = useCallback((emojis: string[] | undefined, at?: { x: number; y: number }) => {
    if (!emojis || emojis.length === 0) return;

    const { x, y } = at ?? lastPointer.current;
    const batch: Particle[] = emojis.slice(0, 4).map((emoji, i) => ({
      id: particleSeq.current++,
      emoji,
      x: x - 14 + (Math.random() * 24 - 12),
      y: y - 18 + i * -6,
      drift: (Math.random() - 0.5) * 90,
      scale: 0.85 + Math.random() * 0.45,
    }));

    setParticles((prev) => [...prev, ...batch]);

    const ids = new Set(batch.map((p) => p.id));
    const timer = window.setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !ids.has(p.id)));
      particleTimers.current = particleTimers.current.filter((t) => t !== timer);
    }, PARTICLE_LIFE_MS);
    particleTimers.current.push(timer);
  }, []);

  useEffect(
    () => () => {
      particleTimers.current.forEach(window.clearTimeout);
      particleTimers.current = [];
    },
    [],
  );

  // ---------- แตะ ----------
  const handleZoneTap = useCallback(
    (zone: ZoneId) => {
      unlockAudio();

      // ระหว่างที่น้องกำลังพูดปลอบใจ การแตะ = ข้ามไปบรรทัดถัดไป ไม่ใช่สุ่มท่าใหม่
      if (comfort.advance()) return;
      if (comfort.active) return;

      restartIdle();

      const { totalTaps: newTotal, rapidCount } = registerTap();
      global.add(1);

      const result = pickTapReaction(
        { zone, totalTaps: newTotal, rapidCount, recentIds: engine.recentIds },
        seenMilestones,
      );
      if (result.special) markMilestone(newTotal);

      engine.play(result, 'tap');
      spawnParticles(result.reaction.particles);

      if (!reducedMotion && typeof navigator.vibrate === 'function') {
        navigator.vibrate(result.special ? [12, 40, 18] : 12);
      }
    },
    [
      comfort,
      engine,
      global,
      markMilestone,
      reducedMotion,
      registerTap,
      restartIdle,
      seenMilestones,
      spawnParticles,
    ],
  );

  // จุดเดียวที่เล่นเสียง ไม่ว่าท่านั้นจะมาจากการแตะ จากโหมดปลอบใจ หรือจากท่าแอมเบียนต์
  // เทียบด้วย key เพื่อไม่ให้เล่นซ้ำตอน re-render
  const lastPlayedKey = useRef(0);
  useEffect(() => {
    const current = engine.current;
    if (!current || current.key === lastPlayedKey.current) return;
    lastPlayedKey.current = current.key;

    playSound(current.result.reaction.sound, soundOn);

    // ท่าที่ไม่ได้มาจากการแตะ ให้อิโมจิลอยออกจากกลางตัวน้องแทนตำแหน่งนิ้ว
    if (current.origin !== 'tap' && characterRef.current) {
      const box = characterRef.current.getBoundingClientRect();
      spawnParticles(current.result.reaction.particles, {
        x: box.left + box.width / 2,
        y: box.top + box.height * 0.35,
      });
    }
  }, [engine.current, soundOn, spawnParticles]);

  // จับตำแหน่งนิ้ว/เมาส์ไว้ก่อนที่ Character จะรับ event (capture phase)
  const capturePointer = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    lastPointer.current = { x: e.clientX, y: e.clientY };
  }, []);

  // ---------- บันทึกการตั้งค่า ----------
  const selectBackground = useCallback((id: string) => {
    setBackgroundId(id);
    writeJSON(KEYS.backgroundId, id);
  }, []);

  const applyCustomImage = useCallback((dataUrl: string | null) => {
    setCustomImage(dataUrl);
    writeJSON(KEYS.customBackground, dataUrl);
  }, []);

  const toggleSound = useCallback((on: boolean) => {
    setSoundOn(on);
    writeJSON(KEYS.soundOn, on);
    if (on) unlockAudio();
  }, []);

  const handleReset = useCallback(() => {
    clearAll();
    reset();
    devBadge.reset();
    setBackgroundId(BACKGROUNDS[0].id);
    setCustomImage(null);
    engine.stop();
    comfort.close();
    setSettingsOpen(false);
  }, [comfort, devBadge, engine, reset]);

  const openComfort = useCallback(() => {
    unlockAudio();
    engine.stop();
    comfort.open();
  }, [comfort, engine]);

  // เปิดหัวข้อไหนก็นับว่า "เยี่ยมชม" หัวข้อนั้นแล้ว ไม่ต้องเลือกตัวเลือกย่อยให้จบก็นับ
  const selectComfortTopic = useCallback(
    (id: string) => {
      devBadge.markVisited(id);
      comfort.selectTopic(id);
    },
    [comfort, devBadge],
  );

  return (
    <>
      <Background
        background={background}
        customImage={customImage}
        tilt={tilt}
        reducedMotion={reducedMotion}
      />

      <main
        className={`relative flex min-h-[100dvh] w-full flex-col items-center ${
          dark ? 'text-white' : 'text-ink'
        }`}
      >
        <header className="pointer-events-none absolute left-4 top-4 z-20">
          <h1 className="text-base font-semibold leading-tight drop-shadow-sm">โมจิ</h1>
          <p className="text-xs opacity-70">แตะหัว หู พุง หรือหาง</p>
        </header>

        <CounterPanel
          sessionTaps={sessionTaps}
          totalTaps={totalTaps}
          globalTotal={global.total}
          globalEnabled={global.enabled}
          nextUnlock={nextUnlock}
          dark={dark}
        />

        <div className="flex w-full flex-1 flex-col items-center justify-center pt-20">
          <SpeechBubble
            message={engine.message}
            special={engine.isSpecial}
            bubbleKey={engine.animKey}
          />

          <div
            ref={characterRef}
            onPointerDownCapture={capturePointer}
            className="w-[min(74vw,320px)] touch-manipulation"
            style={{ aspectRatio: '1 / 1' }}
          >
            <Character
              animation={engine.animation}
              face={engine.face}
              animKey={engine.animKey}
              onZoneTap={handleZoneTap}
              reducedMotion={reducedMotion}
            />
          </div>

          {/* ปุ่มสำรองสำหรับคีย์บอร์ดและ screen reader */}
          <button
            type="button"
            onClick={() => handleZoneTap('any')}
            className="sr-only focus:not-sr-only focus:mt-3 focus:rounded-full focus:bg-berry focus:px-4 focus:py-2 focus:text-white"
          >
            แตะโมจิ
          </button>
        </div>

        <footer className="z-20 w-full px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-2">
          <div className="mx-auto flex max-w-md items-center gap-2">
            <button
              type="button"
              onClick={openComfort}
              className="flex-1 rounded-full bg-berry px-4 py-3 text-sm font-medium text-white shadow-puff transition-transform active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink"
            >
              วันนี้เป็นอะไรมา
            </button>
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className={[
                'rounded-full px-4 py-3 text-sm font-medium shadow-puff backdrop-blur-md',
                'transition-transform active:scale-95',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-berry',
                dark ? 'bg-white/20 text-white' : 'bg-white/85 text-ink',
              ].join(' ')}
            >
              ตั้งค่า
            </button>
          </div>
          <p className="mx-auto mt-2 max-w-md text-center text-[0.68rem] opacity-65">
            {global.enabled && !global.online
              ? 'ตอนนี้ต่อเซิร์ฟเวอร์ไม่ได้ ยอดของเธอยังนับอยู่ในเครื่อง'
              : 'ยอดสะสมเก็บไว้ในเครื่องนี้'}
          </p>
        </footer>
      </main>

      <TapParticles particles={particles} />

      <MoodPicker
        phase={comfort.phase}
        topics={comfort.topics}
        topic={comfort.topic}
        onSelectTopic={selectComfortTopic}
        onSelectChoice={comfort.selectChoice}
        onClose={comfort.close}
      />

      <DevBadge
        unlocked={devBadge.unlocked}
        justUnlocked={devBadge.justUnlocked}
        messages={DEV_MESSAGES}
        dark={dark}
        hidden={comfort.active || settingsOpen}
      />

      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        backgrounds={BACKGROUNDS}
        currentId={background.id}
        customImage={customImage}
        totalTaps={totalTaps}
        soundOn={soundOn}
        onSelectBackground={selectBackground}
        onCustomImage={applyCustomImage}
        onToggleSound={toggleSound}
        onReset={handleReset}
      />
    </>
  );
}
