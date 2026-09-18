import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import comfortData from '../data/comfort.json';
import { resultFrom } from '../lib/engine';
import type { ComfortTopic, EngineResult } from '../types';

export const COMFORT_TOPICS = comfortData as unknown as ComfortTopic[];

const DEFAULT_CLOSING = 'กลับมาคุยได้ทุกเมื่อเลยนะ';
/** เวลาที่ค้างแต่ละบรรทัดอย่างน้อย และเวลาเพิ่มต่อหนึ่งตัวอักษร */
const MIN_HOLD_MS = 2400;
const MS_PER_CHAR = 75;

export type ComfortPhase =
  /** ปิดอยู่ ใช้งานปกติ */
  | 'off'
  /** กำลังให้เลือกว่าวันนี้เป็นอะไรมา */
  | 'picking'
  /** น้องกำลังพูด */
  | 'speaking'
  /** พูดจบแล้ว ให้เลือกตัวเลือกย่อย */
  | 'choosing';

/**
 * คุมบทสนทนาปลอบใจทั้งหมด
 *
 * ลำดับ: เปิด → เลือกอารมณ์ → น้องพูดบทเปิดทีละบรรทัด → เลือกตัวเลือกย่อย
 *        → น้องตอบทีละบรรทัด → ปิดเอง
 *
 * แต่ละบรรทัดค้างตามความยาวข้อความ และแตะที่ตัวน้องเพื่อข้ามไปบรรทัดถัดไปได้
 */
export function useComfortFlow(play: (result: EngineResult) => void) {
  const [phase, setPhase] = useState<ComfortPhase>('off');
  const [topicId, setTopicId] = useState<string | null>(null);
  const [choiceId, setChoiceId] = useState<string | null>(null);
  const [lineIndex, setLineIndex] = useState(0);
  const timerRef = useRef<number | null>(null);

  const topic = useMemo(
    () => (topicId ? (COMFORT_TOPICS.find((t) => t.id === topicId) ?? null) : null),
    [topicId],
  );

  const choice = useMemo(
    () => (topic && choiceId ? (topic.choices.find((c) => c.id === choiceId) ?? null) : null),
    [topic, choiceId],
  );

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // ---------- เดินสคริปต์ ----------
  useEffect(() => {
    if (phase !== 'speaking') return;

    // สร้างบทพูดของช่วงนี้ ถ้าเลือกตัวเลือกย่อยแล้วให้ต่อท้ายด้วยประโยคปิด
    const script: { reaction: string; line: string }[] = choice
      ? [
          ...choice.lines.map((line) => ({ reaction: choice.reaction, line })),
          { reaction: 'comfort_hug', line: choice.closing ?? DEFAULT_CLOSING },
        ]
      : (topic?.opening ?? []);

    const step = script[lineIndex];

    if (!step) {
      // พูดจบแล้ว
      if (choice) {
        setPhase('off');
        setTopicId(null);
        setChoiceId(null);
        setLineIndex(0);
      } else {
        setPhase('choosing');
      }
      return;
    }

    play(resultFrom(step.reaction, step.line));

    const hold = Math.max(MIN_HOLD_MS, step.line.length * MS_PER_CHAR);
    timerRef.current = window.setTimeout(() => setLineIndex((i) => i + 1), hold);
    return clearTimer;
  }, [phase, topic, choice, lineIndex, play]);

  useEffect(() => clearTimer, []);

  const open = useCallback(() => {
    clearTimer();
    setPhase('picking');
    setTopicId(null);
    setChoiceId(null);
    setLineIndex(0);
  }, []);

  const close = useCallback(() => {
    clearTimer();
    setPhase('off');
    setTopicId(null);
    setChoiceId(null);
    setLineIndex(0);
  }, []);

  const selectTopic = useCallback((id: string) => {
    clearTimer();
    setTopicId(id);
    setChoiceId(null);
    setLineIndex(0);
    setPhase('speaking');
  }, []);

  const selectChoice = useCallback((id: string) => {
    clearTimer();
    setChoiceId(id);
    setLineIndex(0);
    setPhase('speaking');
  }, []);

  /** แตะที่ตัวน้องระหว่างที่พูดอยู่ = ข้ามไปบรรทัดถัดไป */
  const advance = useCallback(() => {
    if (phase !== 'speaking') return false;
    clearTimer();
    setLineIndex((i) => i + 1);
    return true;
  }, [phase]);

  return {
    phase,
    topic,
    topics: COMFORT_TOPICS,
    open,
    close,
    selectTopic,
    selectChoice,
    advance,
    /** true = โหมดปลอบใจกำลังทำงานอยู่ ควรหยุดท่าสุ่มอื่น ๆ */
    active: phase !== 'off',
  };
}
