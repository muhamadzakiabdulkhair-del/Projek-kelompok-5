-- =====================================================================
-- 005_rls_orders.sql
-- Pelanggan hanya boleh melihat pesanan MILIKNYA sendiri.
--
-- Masalah : aplikasi mengambil semua baris orders tanpa saringan pemilik
--           (orderService.fetchOrders), dan RLS tabel orders terlalu longgar,
--           sehingga pelanggan bisa melihat pesanan orang lain.
-- Solusi  : RLS di database (satu-satunya penjaga yang tidak bisa dilewati
--           lewat aplikasi atau API). Aturan:
--
--   LIHAT  (select) : pemilik pesanan, atau owner/karyawan yang Aktif
--   BUAT   (insert) : pengguna yang login, hanya untuk dirinya sendiri
--                     (kolom user_id diisi database oleh trigger 004)
--   UBAH   (update) : owner/karyawan yang Aktif saja (naikkan status)
--   HAPUS  (delete) : owner yang Aktif saja
--
-- Catatan penting:
--   * Pesanan LAMA (sebelum 004) tidak punya user_id, jadi hanya terlihat
--     oleh owner/karyawan. Pelanggan tidak melihatnya lagi.
--   * Pengguna yang belum login tidak bisa membuat atau melihat pesanan.
--   * SEMUA policy lama di tabel orders dihapus lalu diganti set di bawah.
--     Simpan hasil query cadangan (lihat panduan) sebelum menjalankannya.
--
-- Cara menjalankan: Supabase Dashboard -> SQL Editor -> New query
--                   -> tempel seluruh isi file ini -> Run.
-- Aman dijalankan berulang kali. Jalankan SETELAH 004_notifikasi.sql.
-- =====================================================================


-- ─── 1. Fungsi bantu peran (SECURITY DEFINER agar tidak terblokir RLS profiles) ──
create or replace function public.is_staff_aktif()
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $function$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.peran in ('owner', 'karyawan')
      and p.status = 'Aktif'
  );
$function$;

create or replace function public.is_owner_aktif()
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $function$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.peran = 'owner'
      and p.status = 'Aktif'
  );
$function$;

revoke all on function public.is_staff_aktif() from public, anon;
revoke all on function public.is_owner_aktif() from public, anon;
grant execute on function public.is_staff_aktif() to authenticated;
grant execute on function public.is_owner_aktif() to authenticated;


-- ─── 2. Hapus SEMUA policy lama di orders ────────────────────────────
do $$
declare
  r record;
begin
  for r in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'orders'
  loop
    execute format('drop policy %I on public.orders', r.policyname);
  end loop;
end
$$;


-- ─── 3. Hak akses tabel + RLS ────────────────────────────────────────
alter table public.orders enable row level security;

revoke all on public.orders from anon;
grant select, insert, update, delete on public.orders to authenticated;


-- ─── 4. Policy baru ──────────────────────────────────────────────────
create policy "orders lihat milik sendiri atau staf"
  on public.orders for select to authenticated
  using (user_id = auth.uid() or public.is_staff_aktif());

create policy "orders buat atas nama sendiri"
  on public.orders for insert to authenticated
  with check (user_id = auth.uid());

create policy "orders ubah oleh staf"
  on public.orders for update to authenticated
  using (public.is_staff_aktif())
  with check (public.is_staff_aktif());

create policy "orders hapus oleh owner"
  on public.orders for delete to authenticated
  using (public.is_owner_aktif());
