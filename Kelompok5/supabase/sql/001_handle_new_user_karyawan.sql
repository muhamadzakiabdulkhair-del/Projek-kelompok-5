-- =====================================================================
-- 001_handle_new_user_karyawan.sql
-- Tujuan : akun yang dibuat Owner lewat Edge Function "buat-karyawan"
--          langsung mendapat peran 'karyawan' saat profil dibuat.
--
-- Cara kerja:
--   * Peran dibaca dari raw_app_meta_data (hanya bisa diisi lewat Admin API
--     di server). Pengguna biasa TIDAK bisa mengisinya lewat signUp.
--   * Nilai selain 'karyawan' (termasuk 'owner') diabaikan -> 'pelanggan'.
--   * Pendaftaran pelanggan lewat aplikasi tidak berubah.
--
-- Cara menjalankan: Supabase Dashboard -> SQL Editor -> New query
--                   -> tempel isi file ini -> Run.
-- Aman dijalankan berulang kali. Trigger on_auth_user_created TIDAK diubah.
-- =====================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  insert into public.profiles (id, email, nama, peran, status)
  values (
    new.id,
    new.email,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'nama'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      split_part(new.email, '@', 1)
    ),
    case
      when new.raw_app_meta_data ->> 'peran' = 'karyawan' then 'karyawan'
      else 'pelanggan'
    end,
    'Aktif'
  )
  on conflict (id) do nothing;
  return new;
end;
$function$;
