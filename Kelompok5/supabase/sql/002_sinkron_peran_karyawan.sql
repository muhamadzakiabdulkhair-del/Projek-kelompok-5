-- =====================================================================
-- 002_sinkron_peran_karyawan.sql
-- Masalah : Saat Admin API membuat akun, app_metadata (peran) baru ditulis
--           SETELAH baris auth.users dibuat (lewat UPDATE, di transaksi yang
--           sama). Trigger on_auth_user_created (AFTER INSERT) belum melihatnya,
--           sehingga profil terbentuk sebagai 'pelanggan'.
--
-- Solusi  : Trigger kedua pada UPDATE kolom raw_app_meta_data. Bila peran di
--           app_metadata = 'karyawan', profil yang masih 'pelanggan' dinaikkan
--           menjadi 'karyawan'. Semuanya terjadi dalam SATU transaksi pembuatan
--           akun, jadi tidak ada keadaan setengah jadi yang bisa dipakai.
--
-- Keamanan: app_metadata hanya bisa diubah lewat Admin API (server), bukan
--           oleh pengguna biasa. Peran 'owner' tidak pernah dibuat lewat jalur ini,
--           dan profil yang sudah owner/karyawan tidak disentuh.
--
-- Cara menjalankan: Supabase Dashboard -> SQL Editor -> New query
--                   -> tempel isi file ini -> Run. Aman dijalankan berulang.
-- =====================================================================

create or replace function public.sinkron_peran_dari_app_metadata()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if new.raw_app_meta_data ->> 'peran' = 'karyawan'
     and (old.raw_app_meta_data ->> 'peran') is distinct from 'karyawan' then
    update public.profiles
       set peran = 'karyawan'
     where id = new.id
       and peran = 'pelanggan';
  end if;
  return new;
end;
$function$;

drop trigger if exists on_auth_user_peran_diubah on auth.users;

create trigger on_auth_user_peran_diubah
  after update of raw_app_meta_data on auth.users
  for each row
  execute function public.sinkron_peran_dari_app_metadata();
