-- =====================================================================
-- 004_notifikasi.sql
-- Fitur notifikasi dalam aplikasi.
--
-- Siapa menerima apa:
--   * KARYAWAN (Aktif)  : "Pesanan baru"            saat pesanan dibuat
--   * PELANGGAN         : "Status pesanan berubah"  hanya untuk pesanan MILIKNYA
--   * OWNER (Aktif)     : "Stok menipis / habis"    saat stok produk turun
--
-- Keamanan:
--   * Notifikasi HANYA dibuat oleh trigger database (SECURITY DEFINER).
--     Aplikasi tidak punya izin INSERT, jadi tidak bisa dipalsukan.
--   * Pengguna hanya bisa melihat, menandai dibaca, dan menghapus
--     notifikasi miliknya sendiri (RLS). Kolom yang boleh diubah hanya is_read.
--   * Kegagalan membuat notifikasi TIDAK PERNAH membatalkan pesanan atau
--     perubahan stok (setiap trigger menangkap errornya sendiri).
--
-- Cara menjalankan: Supabase Dashboard -> SQL Editor -> New query
--                   -> tempel seluruh isi file ini -> Run.
-- Aman dijalankan berulang kali.
-- =====================================================================


-- ─── 1. Pemilik pesanan ──────────────────────────────────────────────
-- Dibutuhkan agar notifikasi status bisa dialamatkan ke pelanggan yang benar.
-- Diisi otomatis oleh database saat pesanan dibuat, kode checkout tidak berubah.
-- Pesanan lama tidak punya pemilik (NULL) sehingga tidak memicu notifikasi.

alter table public.orders
  add column if not exists user_id uuid references auth.users(id) on delete set null;

alter table public.orders
  alter column user_id set default auth.uid();

-- Cegah pemalsuan: bila pembuatnya login, pemilik selalu dirinya sendiri.
create or replace function public.isi_pemilik_pesanan()
returns trigger
language plpgsql
set search_path to 'public'
as $function$
begin
  if auth.uid() is not null then
    new.user_id := auth.uid();
  end if;
  return new;
end;
$function$;

drop trigger if exists trg_isi_pemilik_pesanan on public.orders;
create trigger trg_isi_pemilik_pesanan
  before insert on public.orders
  for each row execute function public.isi_pemilik_pesanan();


-- ─── 2. Tabel notifications ──────────────────────────────────────────
create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  tipe        text not null check (tipe in ('pesanan_baru', 'status_pesanan', 'stok_menipis')),
  judul       text not null,
  pesan       text not null,
  order_id    text,
  product_id  text,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists notifications_user_created_idx
  on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

-- Hak akses tingkat tabel: tanpa INSERT, UPDATE hanya kolom is_read
revoke all on public.notifications from anon, authenticated;
grant select, delete on public.notifications to authenticated;
grant update (is_read) on public.notifications to authenticated;

drop policy if exists "notifications select milik sendiri" on public.notifications;
drop policy if exists "notifications update milik sendiri" on public.notifications;
drop policy if exists "notifications delete milik sendiri" on public.notifications;

create policy "notifications select milik sendiri"
  on public.notifications for select to authenticated
  using (user_id = auth.uid());

create policy "notifications update milik sendiri"
  on public.notifications for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "notifications delete milik sendiri"
  on public.notifications for delete to authenticated
  using (user_id = auth.uid());


-- ─── 3. Pesanan baru -> semua KARYAWAN aktif ─────────────────────────
create or replace function public.notif_pesanan_baru()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  begin
    insert into public.notifications (user_id, tipe, judul, pesan, order_id)
    select p.id,
           'pesanan_baru',
           'Pesanan baru',
           'Pesanan ' || new.id::text
             || ' dari ' || coalesce(nullif(trim(new.customer), ''), 'pelanggan')
             || ', Rp' || replace(to_char(coalesce(new.total, 0), 'FM999,999,999,999'), ',', '.'),
           new.id::text
    from public.profiles p
    where p.peran = 'karyawan' and p.status = 'Aktif';
  exception when others then
    raise warning 'notif_pesanan_baru gagal: %', sqlerrm;
  end;
  return new;
end;
$function$;

drop trigger if exists trg_notif_pesanan_baru on public.orders;
create trigger trg_notif_pesanan_baru
  after insert on public.orders
  for each row execute function public.notif_pesanan_baru();


-- ─── 4. Status pesanan berubah -> PELANGGAN pemilik pesanan ──────────
create or replace function public.notif_status_pesanan()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  begin
    if new.user_id is not null and new.status is distinct from old.status then
      insert into public.notifications (user_id, tipe, judul, pesan, order_id)
      values (
        new.user_id,
        'status_pesanan',
        'Status pesanan diperbarui',
        'Pesanan ' || new.id::text || ' kini berstatus ' || coalesce(new.status::text, '-') || '.',
        new.id::text
      );
    end if;
  exception when others then
    raise warning 'notif_status_pesanan gagal: %', sqlerrm;
  end;
  return new;
end;
$function$;

drop trigger if exists trg_notif_status_pesanan on public.orders;
create trigger trg_notif_status_pesanan
  after update of status on public.orders
  for each row execute function public.notif_status_pesanan();


-- ─── 5. Stok menipis / habis -> OWNER aktif ──────────────────────────
-- Notifikasi dikirim sekali saat stok MENYEBERANG batas (turun ke <= 5),
-- dan sekali lagi saat stok habis (0). Tidak dikirim berulang tiap perubahan.
create or replace function public.notif_stok_menipis()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  batas constant integer := 5;
  judul_n text;
  pesan_n text;
begin
  begin
    if new.stok is null then
      return new;
    end if;

    if new.stok <= 0 and coalesce(old.stok, 1) > 0 then
      judul_n := 'Stok habis';
      pesan_n := 'Stok ' || coalesce(new.nama::text, 'produk') || ' habis.';
    elsif new.stok <= batas and coalesce(old.stok, batas + 1) > batas then
      judul_n := 'Stok menipis';
      pesan_n := 'Stok ' || coalesce(new.nama::text, 'produk') || ' tinggal ' || new.stok::text || '.';
    else
      return new;
    end if;

    insert into public.notifications (user_id, tipe, judul, pesan, product_id)
    select p.id, 'stok_menipis', judul_n, pesan_n, new.id::text
    from public.profiles p
    where p.peran = 'owner' and p.status = 'Aktif';
  exception when others then
    raise warning 'notif_stok_menipis gagal: %', sqlerrm;
  end;
  return new;
end;
$function$;

drop trigger if exists trg_notif_stok_menipis on public.products;
create trigger trg_notif_stok_menipis
  after update of stok on public.products
  for each row
  when (new.stok is distinct from old.stok)
  execute function public.notif_stok_menipis();


-- ─── 6. Fungsi trigger tidak boleh dipanggil langsung dari aplikasi ──
revoke all on function public.notif_pesanan_baru()   from public, anon, authenticated;
revoke all on function public.notif_status_pesanan() from public, anon, authenticated;
revoke all on function public.notif_stok_menipis()   from public, anon, authenticated;


-- ─── 7. Realtime: notifikasi muncul langsung tanpa muat ulang ────────
-- Realtime tetap tunduk pada RLS, jadi tiap pengguna hanya menerima miliknya.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end
$$;
