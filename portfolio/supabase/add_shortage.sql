-- Jalankan di Supabase Dashboard > SQL Editor (setelah add_video_url.sql). Aman dijalankan ulang.
-- Menggantikan entri Shortage yang sudah ada. Aset ada di public/projects/shortage di repo ini.
alter table public.projects add column if not exists video_url text;

delete from public.projects where title ilike 'Shortage%';

insert into public.projects (category_id, title, description, tags, link_url, image_urls, video_url, "order")
select
  c.id,
  'Shortage: Cek Kelengkapan Material Panel dengan AI',
  E'Aplikasi web untuk memeriksa kelengkapan material pada compartment panel listrik (MCC withdrawable drawer) dari satu foto. Tugas Akhir, dikerjakan dengan konteks pabrik Schneider Electric Cikarang.\n\nMasalahnya ada di urutan proses: pengecekan di tahap mechanical compartment tidak dilakukan, sehingga kekurangan material baru ketahuan setelah sampai di vendor electrical compartment. Dengan Shortage, pengecekan dilakukan di tahap mechanical, jadi kesalahan ketahuan lebih awal dan langsung ditangani PIC.\n\nAI membantu, bukan menggantikan. Model YOLO mengusulkan kotak dan jumlah part, lalu operator yang memutuskan: menerima atau menolak deteksi yang ragu, menghapus atau menggeser kotak yang salah, memotret dari sisi lain kalau part tidak terlihat (misalnya Front Plate dari tampak depan), dan mencatat penyebab selisih (belum dipasang, BOM salah, atau tertutup di foto). Hasilnya dibandingkan dengan BOM, dibuat jadi laporan shortage, lalu ditugaskan ke PIC lengkap dengan tenggat dan status.\n\nModel: YOLO11, 15 kelas part. mAP50 sekitar 0,64 dan recall sekitar 0,56, jadi hasil model memang perlu dikoreksi manusia, dan alur aplikasinya dirancang untuk itu.\n\nGw bikin end to end: desain UI, frontend, backend, layanan inferensi, dan deployment.',
  array['Next.js','TypeScript','Tailwind','Go','Gin','YOLO11','Flask','PostgreSQL','Docker'],
  null, -- ganti jadi '/projects/shortage/deck.pdf' setelah PDF deck ditaruh di public/projects/shortage
  array['/projects/shortage/cover.jpg','/projects/shortage/showcase-1.jpg','/projects/shortage/showcase-2.jpg','/projects/shortage/deteksi.jpg','/projects/shortage/laporan-detail.jpg','/projects/shortage/pic.jpg'],
  '/projects/shortage/demo.mp4',
  1
from public.categories c
where c.name ilike 'Software Development%'
limit 1;
