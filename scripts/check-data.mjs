/**
 * ตรวจว่าไฟล์ข้อมูลใน src/data สอดคล้องกับโค้ดจริง
 * รันด้วย: npm run check
 *
 * TypeScript จับชื่อที่สะกดผิดใน type ได้ แต่จับไม่ได้ว่า
 *  - reaction id ที่ events.json / comfort.json อ้างถึงมีอยู่จริงมั้ย
 *  - animation ที่ใช้มี CSS class รองรับมั้ย
 *  - face ที่ใช้มี case ใน Character.tsx มั้ย
 * สคริปต์นี้ตรวจให้ครบ
 */
import { readFileSync } from 'node:fs';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const json = (p) => JSON.parse(read(p));

const reactions = json('src/data/reactions.json');
const events = json('src/data/events.json');
const backgrounds = json('src/data/backgrounds.json');
const comfort = json('src/data/comfort.json');
const devMessages = json('src/data/devMessages.json');
const css = read('src/index.css');
const character = read('src/components/Character.tsx');
const types = read('src/types.ts');
const audio = read('src/lib/audio.ts');
const scene = read('src/components/scenes/Scene.tsx');

let problems = 0;
const fail = (msg) => {
  console.error(`  ✗ ${msg}`);
  problems++;
};

/** ดึงค่าใน union type ออกมาจาก types.ts */
const union = (name) => {
  const match = types.match(new RegExp(`export type ${name} =([\\s\\S]*?);`));
  if (!match) {
    fail(`หา type ${name} ใน types.ts ไม่เจอ`);
    return new Set();
  }
  return new Set([...match[1].matchAll(/'([^']+)'/g)].map((m) => m[1]));
};

const ANIMATIONS = union('AnimationId');
const FACES = union('FaceId');
const ZONES = union('ZoneId');
const SOUNDS = union('SoundId');
const SCENES = union('SceneId');
const ids = new Set(reactions.map((r) => r.id));

// 1. ทุกท่าต้องมี CSS และมีสีหน้าที่วาดได้จริง
for (const r of reactions) {
  if (!ANIMATIONS.has(r.animation)) fail(`${r.id}: animation "${r.animation}" ไม่อยู่ใน AnimationId`);
  if (!FACES.has(r.face)) fail(`${r.id}: face "${r.face}" ไม่อยู่ใน FaceId`);
  if (r.sound && !SOUNDS.has(r.sound)) fail(`${r.id}: sound "${r.sound}" ไม่อยู่ใน SoundId`);
  if (!css.includes(`.anim-${r.animation} {`)) fail(`${r.id}: ไม่มี CSS class .anim-${r.animation}`);
  if (!character.includes(`'${r.face}'`)) fail(`${r.id}: Character.tsx ไม่มี case หน้า "${r.face}"`);
  for (const z of r.zones ?? []) if (!ZONES.has(z)) fail(`${r.id}: zone "${z}" ไม่มีอยู่จริง`);
  if (typeof r.duration !== 'number' || r.duration < 300) fail(`${r.id}: duration ผิดปกติ`);
}

for (const a of ANIMATIONS) if (!css.includes(`.anim-${a} {`)) fail(`AnimationId "${a}" ยังไม่มี CSS`);
for (const s of SOUNDS) if (!audio.includes(`\n  ${s}:`)) fail(`audio.ts ไม่มีสูตรเสียง "${s}"`);
for (const s of SCENES) if (!scene.includes(`${s}:`)) fail(`Scene.tsx ไม่มีฉาก "${s}"`);

// 2. ทุก reaction ที่ถูกอ้างถึงต้องมีจริง
for (const e of events) {
  if (!ids.has(e.reaction)) fail(`event "${e.id}" อ้าง reaction "${e.reaction}" ที่ไม่มีอยู่`);
}
for (const t of comfort) {
  t.opening.forEach((o, i) => {
    if (!ids.has(o.reaction)) fail(`comfort ${t.id}.opening[${i}] อ้าง "${o.reaction}"`);
  });
  for (const c of t.choices) {
    if (!ids.has(c.reaction)) fail(`comfort ${t.id}.${c.id} อ้าง "${c.reaction}"`);
    if (!c.lines?.length) fail(`comfort ${t.id}.${c.id} ไม่มีบทพูด`);
  }
  if (t.choices.length < 2) fail(`comfort ${t.id} ควรมีตัวเลือกอย่างน้อย 2 อัน`);
}
if (!ids.has('comfort_hug')) fail('ต้องมี reaction "comfort_hug" เพราะใช้เป็นประโยคปิดอัตโนมัติ');

// 3. ฉากต้องวาดได้จริง
for (const b of backgrounds) {
  if (!SCENES.has(b.scene)) fail(`ฉาก "${b.id}" ใช้ scene "${b.scene}" ที่ไม่มีอยู่`);
  if (!Array.isArray(b.sky) || b.sky.length < 2) fail(`ฉาก "${b.id}" ต้องมีสีท้องฟ้าอย่างน้อย 2 สี`);
}

// 4. ทุกโซนต้องมีท่าให้สุ่มพอสมควร
for (const z of ['any', 'head', 'ears', 'belly', 'tail']) {
  const n = reactions.filter((r) => r.weight > 0 && (!r.zones || r.zones.includes(z))).length;
  if (n < 4) fail(`โซน "${z}" มีท่าให้สุ่มแค่ ${n} ท่า น้อยเกินไป`);
}

const ambient = reactions.filter((r) => (r.idleWeight ?? 0) > 0).length;
if (ambient < 3) fail(`ท่าแอมเบียนต์มีแค่ ${ambient} ท่า น้องจะดูนิ่งเกินไป`);

// 5. ข้อความของ Dev ต้องมีให้สุ่มพอสมควร และเป็นสตริงล้วน
if (!Array.isArray(devMessages) || devMessages.length < 3) {
  fail(`devMessages.json ควรมีข้อความอย่างน้อย 3 อัน (มีอยู่ ${devMessages?.length ?? 0})`);
}
devMessages.forEach((m, i) => {
  if (typeof m !== 'string' || !m.trim()) fail(`devMessages.json[${i}] ต้องเป็นข้อความที่ไม่ว่าง`);
});

if (problems === 0) {
  const lines = comfort.reduce(
    (a, t) => a + t.opening.length + t.choices.reduce((b, c) => b + c.lines.length, 0),
    0,
  );
  console.log(`  ✓ ผ่านหมด — ท่า ${reactions.length} | ฉาก ${backgrounds.length} | หัวข้ออารมณ์ ${comfort.length} | บทพูด ${lines} บรรทัด`);
} else {
  console.error(`\n  พบ ${problems} ปัญหา`);
  process.exit(1);
}
