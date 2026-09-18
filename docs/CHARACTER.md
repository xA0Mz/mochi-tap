# คู่มือปรับแต่งตัวน้องกับฉาก

ไฟล์ที่เกี่ยวข้องมีแค่สามไฟล์ จำสามชื่อนี้ไว้พอ

| ไฟล์ | ดูแลอะไร |
|---|---|
| `src/components/Character.tsx` | รูปร่าง สี สัดส่วน และ "สีหน้า" ทุกแบบ |
| `src/index.css` | ท่าทางทั้งหมด (CSS keyframes) |
| `src/components/scenes/Scene.tsx` | ฉากหลังทั้ง 7 ฉาก |

กฎเหล็กข้อเดียว: **ชื่อต้องตรงกันสามที่** คือใน `src/types.ts` → ในไฟล์ที่วาด → ในไฟล์ข้อมูล JSON
ถ้าสะกดผิดที่ใดที่หนึ่ง TypeScript จะฟ้องทันทีตอน `npm run build`

---

## 1. ปรับหน้าตาและสัดส่วน

เปิด `src/components/Character.tsx` ค่าทั้งหมดอยู่ในออบเจ็กต์ `LOOK` ที่บรรทัดแรก ๆ
ตัวเลขทุกตัวอิงกับกล่องขนาด 260 x 260 โดยแกน y นับจากบนลงล่าง

```ts
export const LOOK = {
  head:  { cx: 130, cy: 110, r: 56 },
  ears:  { offsetX: 58, cy: 96, len: 40, width: 19, tilt: 16 },
  body:  { cx: 130, cy: 178, rx: 54, ry: 48 },
  eyes:  { gap: 18, y: 106, rx: 6.5, ry: 8 },
  ...
};
```

ปรับบ่อยที่สุดสามค่านี้

| อยากได้ | แก้อะไร |
|---|---|
| หูยาวขึ้น / สั้นลง | `ears.len` (40 → 52 = ยาวขึ้นมาก) |
| หูกางออก / ลู่ลง | `ears.tilt` (16 → 30 = กางออก, → 6 = ตั้งตรง) |
| หัวโตขึ้น ตัวเล็กลง | `head.r` เพิ่ม แล้วลด `body.rx` / `body.ry` |
| ตาห่างขึ้น | `eyes.gap` (18 → 24) |
| ตาโตแบบการ์ตูน | `eyes.rx` กับ `eyes.ry` เพิ่มพร้อมกัน |
| เปลี่ยนสีตัว | `colors.body` และ `colors.shade` (shade ควรเข้มกว่า body นิดเดียว) |
| เอาปอยผมออก | `tuft: false` |

หูจะย้ายตาม `head.cx` เอง เพราะคำนวณจาก `head.cx ± ears.offsetX`
ถ้าย้ายหัวไปทางซ้ายขวา หูกับแก้มจะตามไปด้วย ไม่ต้องแก้ทีละจุด

---

## 2. เพิ่มสีหน้าใหม่

สีหน้าประกอบจากสองส่วนแยกกันคือ `<Eyes>` กับ `<Mouth>` ทำสามขั้น

**ขั้นที่ 1** เพิ่มชื่อใน `src/types.ts`

```ts
export type FaceId = 'normal' | 'happy' | ... | 'proud';
```

**ขั้นที่ 2** เพิ่ม `case` ในฟังก์ชัน `Eyes` ของ `Character.tsx`

```tsx
case 'proud':
  return (
    <>
      <HappyEye cx={EYE_L} />
      <HappyEye cx={EYE_R} />
      <Brows angle={-3} lift={2} />
    </>
  );
```

ชิ้นส่วนที่หยิบมาประกอบได้เลยมี `OpenEye` (ตาเปิด), `HappyEye` (ตาโค้งขึ้น = ยิ้ม),
`ClosedEye` (ตาโค้งลง = หลับ), `HeartEye`, `StarEye`, `DizzyEye` และ `Brows`

`Brows` รับ `angle` โดย **ค่าบวก = ปลายในตก** (กังวล เศร้า) และ **ค่าลบ = ปลายในยก** (มุ่งมั่น งอน)

**ขั้นที่ 3** เพิ่ม `case` ในฟังก์ชัน `Mouth` ถ้าอยากได้ปากแบบใหม่
ถ้าไม่เพิ่ม จะตกไปใช้ปากปกติ ซึ่งบางทีก็พอแล้ว

ถ้าหน้าใหม่เป็นแบบตาเปิด อย่าลืมใส่ชื่อลงใน `BLINKABLE` ด้วย น้องจะได้กะพริบตาได้

---

## 3. เพิ่มท่าทางใหม่

**ขั้นที่ 1** เพิ่มชื่อใน `AnimationId` ที่ `src/types.ts`

```ts
export type AnimationId = 'idle' | 'jump' | ... | 'rollOver';
```

**ขั้นที่ 2** เขียน keyframes ใน `src/index.css` ชื่อ class **ต้องเป็น `.anim-<ชื่อ>` เป๊ะ ๆ**

```css
@keyframes rollOver {
  0%, 100% { transform: rotate(0deg) translateX(0); }
  50%      { transform: rotate(360deg) translateX(30px); }
}

.anim-rollOver {
  animation: rollOver 1.2s ease-in-out both;
}
```

**ขั้นที่ 3** เรียกใช้ใน `src/data/reactions.json`

```json
{ "id": "roll_fun", "animation": "rollOver", "face": "happy", "weight": 10, "duration": 1300, "messages": ["กลิ้งงง!"] }
```

### เคล็ดลับให้ท่าดูเหมือนการ์ตูน

- **ใช้ squash & stretch** ย่อแนวตั้งต้องยืดแนวนอน เช่น `scale(1.18, 0.8)` ไม่ใช่ `scale(0.8)` เฉย ๆ ไม่งั้นจะดูแฟบ
- **ให้ท่าเริ่มด้วยการย่อก่อน** กระโดดที่ดีต้องย่อตัวลง 1 เฟรมก่อนพุ่งขึ้น (ดู `@keyframes jump` เป็นตัวอย่าง)
- **จบที่ท่าปกติเสมอ** เฟรม `100%` ควรเป็น `transform: none` หรือค่าเดิม ไม่งั้นน้องจะค้างท่าแปลก ๆ
- **ใช้ `both`** ต่อท้าย animation shorthand เพื่อให้เฟรมแรกมีผลตั้งแต่ก่อนเริ่มเล่น
- `duration` ใน JSON ควรมากกว่าหรือเท่ากับความยาว animation ใน CSS เล็กน้อย ไม่งั้นท่าจะถูกตัดกลางคัน

### ขยับเฉพาะบางส่วนของตัว

ในไฟล์ SVG มี class ติดไว้ให้แล้ว: `.head` `.face-parts` `.ear-left` `.ear-right` `.arm-left` `.arm-right` `.tail`
ใช้คู่กับ `.anim-*` เพื่อขยับเฉพาะส่วนนั้นได้ ตัวอย่างท่ากระดิกหูในไฟล์จริง

```css
.anim-earTwitch          { animation: idleBob 2.8s ease-in-out infinite; } /* ตัวยังหายใจอยู่ */
.anim-earTwitch .ear-left  { animation: earTwitchLeft 1.3s ease-in-out both; }
.anim-earTwitch .ear-right { animation: earTwitchRight 1.3s ease-in-out 0.15s both; }
```

การหน่วง `0.15s` ให้หูขวาช้ากว่าซ้ายนิดเดียว ทำให้ดูมีชีวิตกว่าขยับพร้อมกันเป๊ะมาก

> **ข้อควรระวัง** ชิ้นส่วน SVG ที่จะขยับด้วย CSS ต้องมี `transform-box: fill-box` ไม่งั้นมันจะหมุนรอบมุมซ้ายบนของทั้งภาพ
> ไฟล์นี้ตั้งไว้ให้แล้วในกฎ `.character .ear, .character .arm, ...` ถ้าเพิ่ม class ใหม่อย่าลืมเติมชื่อลงไปด้วย

---

## 4. ท่าที่น้องทำเองตอนอยู่เฉย ๆ

ท่าพวกนี้ทำให้น้องไม่ยืนนิ่งเป็นรูปปั้น ระบบจะสุ่มมาเล่นทุก 6–13 วินาทีตอนไม่มีใครแตะ

วิธีเพิ่ม: ใส่ `idleWeight` แทน `weight` ใน `reactions.json`

```json
{
  "id": "idle_scratch",
  "animation": "wiggle",
  "face": "normal",
  "weight": 0,          // 0 = ไม่ออกตอนแตะ
  "idleWeight": 12,     // เข้าการสุ่มตอนอยู่เฉย
  "duration": 1400,
  "messages": []        // ว่าง = ไม่ขึ้นกรอบคำพูด (แนะนำสำหรับท่าแบบนี้)
}
```

ปรับจังหวะความถี่ได้ที่ `MIN_GAP_MS` และ `MAX_GAP_MS` ใน `src/hooks/useAmbientIdle.ts`
ถ้าอยากให้น้องขยับบ่อยจนดูอยู่ไม่สุข ลดเหลือ 3000–7000

ส่วนการ**กะพริบตา**ไม่ได้ใช้ระบบนี้ แต่ทำด้วย CSS ล้วน อยู่ที่ `@keyframes blink` ใน `index.css`
รอบกะพริบคือ 5.4 วินาที และหลับอยู่แค่ช่วง 93–97% ของรอบ อยากให้กะพริบถี่ขึ้นก็ลดเวลารอบลง

---

## 5. เพิ่มหรือแก้ฉาก

ฉากทุกฉากวาดในระบบพิกัด **400 x 300** โดยที่ y ≈ 300 คือพื้นที่ตัวน้องยืน
ฉากใช้ `preserveAspectRatio="xMidYMax slice"` แปลว่าเวลาจอแคบ ระบบจะครอบด้านข้างทิ้งแต่ **ยึดขอบล่างไว้เสมอ**
เพราะฉะนั้นรายละเอียดสำคัญควรอยู่กลางจอหรือใกล้ขอบล่าง อย่าวางไว้ริมซ้ายขวาสุด

### แก้ฉากเดิม

เปิด `Scene.tsx` แต่ละฉากเป็นฟังก์ชันของตัวเอง (`Meadow`, `Bedroom`, `Beach`, `Night`, `Cafe`, `Sakura`, `Space`)
แก้ SVG ในนั้นได้ตรง ๆ มีชิ้นส่วนสำเร็จให้หยิบใช้คือ `Cloud`, `Tree`, `Flower`, `Stars`, `SakuraBlossom`

### เพิ่มฉากใหม่

1. เพิ่มชื่อใน `SceneId` ที่ `src/types.ts`
2. เขียนฟังก์ชันใหม่ใน `Scene.tsx` แล้วเพิ่มลงใน `SCENES`
3. เพิ่มรายการใน `src/data/backgrounds.json`

```json
{
  "id": "rainyday",
  "name": "วันฝนตก",
  "scene": "rainyday",
  "sky": ["#8E9CB0", "#B8C4D2", "#D8E0E8"],
  "unlockAt": 150,
  "dark": false
}
```

`sky` คือไล่สีพื้นหลังที่อยู่ข้างหลังฉาก SVG อีกที ใส่กี่สีก็ได้ตั้งแต่ 2 สีขึ้นไป
`dark: true` จะเปลี่ยนตัวอักษรบน UI เป็นสีขาว ใช้กับฉากมืด

รูปตัวอย่างในแผงตั้งค่าไม่ต้องทำเพิ่ม เพราะมันเรียก `Scene` ตัวเดียวกันมาย่อแสดงให้เอง

### เอฟเฟกต์เคลื่อนไหวในฉาก

ใส่ class พวกนี้กับชิ้นส่วน SVG ได้เลย นิยามอยู่ในหมวด 4 ของ `index.css`

| class | ผล |
|---|---|
| `.cloud` | ลอยซ้ายขวาช้า ๆ |
| `.twinkle` | ดาวกะพริบ |
| `.firefly` | หิ่งห้อยวูบวาบและลอยขึ้น |
| `.flutter` | บินวนแบบผีเสื้อ |
| `.wave` | คลื่นขยับซ้ายขวา |
| `.shooting-star` | ดาวตกพุ่งข้ามจอ |
| `.petal-fall` | กลีบดอกไม้ร่วง |
| `.steam` | ไอน้ำลอยขึ้น |
| `.drift` | ลอยเอื่อย ๆ แบบไร้แรงโน้มถ่วง |

ปรับจังหวะรายชิ้นได้ด้วย `style={{ animationDelay: '1.2s' }}` จะได้ไม่ขยับพร้อมกันหมด

> **กับดักที่เจอบ่อย** ถ้า `<g>` มี `transform="translate(...)"` อยู่แล้ว แล้วไปใส่ class ที่ animate `transform`
> CSS จะทับ attribute ทิ้งทั้งอัน ชิ้นนั้นจะกระโดดไปมุมซ้ายบนทันที
> วิธีแก้คือซ้อนสองชั้น: `<g>` ชั้นนอกคุมตำแหน่ง `<g>` ชั้นในใส่ class (ดูตัวอย่างที่ `Cloud`)

---

## 6. ถ้าอยากเปลี่ยนไปใช้ Rive หรือ Lottie

โค้ดทั้งระบบรู้จักตัวละครผ่าน props แค่สามตัวคือ `animation`, `face`, `onZoneTap`
เพราะฉะนั้นเปลี่ยนไปใช้เครื่องมืออื่นได้โดยแก้ `Character.tsx` ไฟล์เดียว ที่เหลือไม่ต้องแตะ

**Rive** เหมาะที่สุด ไฟล์เล็กกว่า 100KB มี State Machine ในตัว

```bash
npm i @rive-app/react-canvas
```

```tsx
const { rive, RiveComponent } = useRive({ src: '/mochi.riv', stateMachines: 'main' });
const animInput = useStateMachineInput(rive, 'main', 'animation');
const faceInput  = useStateMachineInput(rive, 'main', 'face');

useEffect(() => { if (animInput) animInput.value = animation; }, [animation, animInput]);
```

โซนแตะยังใช้ SVG โปร่งใสวางทับแบบเดิมได้เลย ไม่ต้องทำใน Rive

**Lottie** ใช้ `lottie-react` แล้วแมป `animation` เป็นช่วงเฟรมด้วย `playSegments`
ข้อเสียคือสลับ segment กลางคันจะกระตุกกว่า Rive

---

## 7. ตรวจว่าไม่มีอะไรหลุด

ก่อน commit ให้รันสองคำสั่งนี้

```bash
npm run build   # TypeScript จะจับชื่อที่สะกดผิดทั้งหมด
npm run dev     # ดูด้วยตาว่าท่าออกมาถูก
```

ถ้าเจอว่าน้องหายไปทั้งตัว มักเป็นเพราะ `animation` ใน JSON ไม่มี class `.anim-*` ตรงกัน
เปิด DevTools ดูที่ `<div class="character anim-xxx">` แล้วเช็กว่ามี `.anim-xxx` ใน CSS จริงมั้ย
