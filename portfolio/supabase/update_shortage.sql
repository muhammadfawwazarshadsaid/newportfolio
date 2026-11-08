-- Jalankan di Supabase Dashboard > SQL Editor. Aman dijalankan ulang.
-- Memperbarui entri Shortage yang SUDAH ADA (tidak menambah baris baru).
-- Judul, deskripsi, id, kategori, urutan, dan link lama tetap. Yang diganti: tag, gambar, video.
-- Aset ada di public/projects/shortage di repo ini.
alter table public.projects add column if not exists video_url text;

update public.projects
set
  tags = array['Next.js','TypeScript','Tailwind','Go','Gin','YOLOv11','Flask','PostgreSQL','Docker'],
  image_urls = array['/projects/shortage/cover.jpg','/projects/shortage/showcase-1.jpg','/projects/shortage/showcase-2.jpg','/projects/shortage/deteksi.jpg','/projects/shortage/laporan-detail.jpg','/projects/shortage/pic.jpg'],
  video_url = '/projects/shortage/demo.mp4'
where title = 'Shortage Excess Material Detection AI Computer Vision'
returning id, title, "order";
-- Harus keluar 1 baris. Kalau 0 baris, judul lama di database beda: cek dengan
--   select id, title from public.projects where title ilike '%shortage%';
-- lalu ganti judul di klausa where di atas.
