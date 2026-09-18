/**
 * ย่อรูปจากเครื่องผู้ใช้ให้เล็กลงก่อนเก็บ
 *
 * localStorage เก็บได้ราว 5MB ต่อโดเมน รูปจากกล้องมือถือใบเดียวก็เกินแล้ว
 * จึงวาดลง canvas ย่อให้ด้านยาวสุดไม่เกิน maxSize แล้วแปลงเป็น JPEG คุณภาพ 0.72
 * ปกติจะเหลือราว 150–400KB ซึ่งพอดีกับ localStorage
 */
export async function fileToResizedDataUrl(file: File, maxSize = 1280): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('ไฟล์นี้ไม่ใช่รูปภาพ');
  }

  const bitmapUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(bitmapUrl);
    const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('เบราว์เซอร์นี้ไม่รองรับการย่อรูป');

    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL('image/jpeg', 0.72);
  } finally {
    URL.revokeObjectURL(bitmapUrl);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('เปิดรูปไม่ได้ ลองไฟล์อื่นดูนะ'));
    img.src = src;
  });
}
