import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Supabase เป็นของเสริมทั้งหมด
// ถ้าไม่ได้ตั้ง .env ทุกฟังก์ชันจะคืน null และแอปยังทำงานครบทุกอย่าง
// แค่ไม่มีตัวเลข "ทุกคนแตะรวมกัน" เท่านั้น

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const client: SupabaseClient | null =
  url && anonKey && url.startsWith('http')
    ? createClient(url, anonKey, {
        auth: { persistSession: false },
      })
    : null;

export const hasSupabase = client !== null;

/** อ่านยอดรวมของทุกคน */
export async function fetchGlobalTotal(): Promise<number | null> {
  if (!client) return null;
  try {
    const { data, error } = await client
      .from('global_stats')
      .select('total_taps')
      .eq('id', 1)
      .single();

    if (error || !data) return null;
    return Number(data.total_taps);
  } catch {
    return null;
  }
}

/** ส่งยอดที่สะสมไว้ขึ้นไปบวก แล้วรับยอดรวมล่าสุดกลับมา */
export async function pushTaps(n: number): Promise<number | null> {
  if (!client || n < 1) return null;
  try {
    const { data, error } = await client.rpc('increment_taps', { n: Math.min(n, 500) });
    if (error || data === null || data === undefined) return null;
    return Number(data);
  } catch {
    return null;
  }
}
