-- Jalankan di Supabase Dashboard > SQL Editor (setelah add_video_url.sql). Aman dijalankan ulang.
-- Aset gambar/video diambil dari folder public/projects/mausplit di repo ini.
alter table public.projects add column if not exists video_url text;

delete from public.projects where title = 'MauSplit: Split Bill + Bot WhatsApp';

insert into public.projects (category_id, title, description, tags, link_url, image_urls, video_url, "order")
select
  c.id,
  'MauSplit: Split Bill + Bot WhatsApp',
  E'Web app dan bot WhatsApp buat bagi tagihan bareng teman.\n\nKirim foto struk ke grup dengan /split, struk dibaca otomatis dengan OCR, tagihan dibagi per item (pajak dan service ikut dibagi proporsional), teman kirim bukti transfer lewat web atau chat, lalu bot mengumumkan kalau sudah lunas. Kalau ada yang salah, teman bisa lapor dan yang nalangin tinggal edit.\n\nGw bikin end to end: desain, frontend, backend, OCR, bot WhatsApp, dan deploy ke VPS pakai Docker.',
  array['Next.js','TypeScript','Tailwind','EasyOCR','FastAPI','Baileys','Docker','SQLite'],
  null,
  array['/projects/mausplit/cover.png','/projects/mausplit/chat-grup.png','/projects/mausplit/bagi-per-item.png','/projects/mausplit/cek-bukti.png','/projects/mausplit/kartu-bot.png'],
  '/projects/mausplit/demo.mp4',
  0
from public.categories c
where c.name ilike 'Software Development%'
limit 1;
