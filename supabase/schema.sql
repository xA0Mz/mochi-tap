-- ============================================================
-- Mochi Tap — Supabase schema
-- วิธีใช้: Supabase Dashboard > SQL Editor > New query > วางทั้งหมดนี้ > Run
-- ใช้ได้กับ Free tier ไม่ต้องเปิดบริการเสริมอะไรเพิ่ม
-- ============================================================

-- ตารางเก็บยอดรวมของทุกคน มีแถวเดียวเท่านั้น (id = 1)
create table if not exists public.global_stats (
  id          int primary key default 1,
  total_taps  bigint not null default 0,
  updated_at  timestamptz not null default now(),
  constraint single_row check (id = 1)
);

insert into public.global_stats (id, total_taps)
values (1, 0)
on conflict (id) do nothing;

-- เปิด RLS แล้วอนุญาตให้ anon "อ่าน" ได้อย่างเดียว
-- การเขียนต้องผ่านฟังก์ชันด้านล่างเท่านั้น จะได้บวกเลขมั่วไม่ได้
alter table public.global_stats enable row level security;

drop policy if exists "anyone can read stats" on public.global_stats;
create policy "anyone can read stats"
  on public.global_stats
  for select
  to anon, authenticated
  using (true);

-- ฟังก์ชันบวกยอด: จำกัดไม่เกิน 500 ครั้งต่อการเรียก 1 ครั้ง
-- security definer = ทำงานด้วยสิทธิ์เจ้าของตาราง จึงข้าม RLS ตอนเขียนได้
create or replace function public.increment_taps(n int)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  new_total bigint;
begin
  if n is null or n < 1 then
    n := 1;
  elsif n > 500 then
    n := 500;
  end if;

  update public.global_stats
     set total_taps = total_taps + n,
         updated_at = now()
   where id = 1
  returning total_taps into new_total;

  return new_total;
end;
$$;

revoke all on function public.increment_taps(int) from public;
grant execute on function public.increment_taps(int) to anon, authenticated;
