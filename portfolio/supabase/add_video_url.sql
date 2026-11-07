-- Jalankan sekali di Supabase Dashboard > SQL Editor.
-- Menambah kolom video demo ke tabel proyek. Aman dijalankan ulang.
alter table public.projects
  add column if not exists video_url text;
