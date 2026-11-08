-- Jalankan di Supabase Dashboard > SQL Editor (setelah add_video_url.sql). Aman dijalankan ulang.
-- Menggantikan entri Shortage yang sudah ada. Aset ada di public/projects/shortage di repo ini.
alter table public.projects add column if not exists video_url text;

delete from public.projects where title ilike 'Shortage%';

insert into public.projects (category_id, title, description, tags, link_url, image_urls, video_url, "order")
select
  c.id,
  'Shortage: Deteksi Shortage & Excess Material Panel MCC dengan AI',
  E'Sistem informasi yang menggabungkan versioning Bill of Materials (BOM) dengan deteksi material berbasis Computer Vision untuk compartment mekanis panel Motor Control Center (MCC) tipe withdrawable. Tugas Akhir, bersama Schneider Electric Plant Cikarang.\n\nMasalahnya: vendor mekanis sering salah pasang atau melewatkan part, sementara perubahan desain dari engineering dikabarkan manual lewat email atau WhatsApp sehingga BOM tidak langsung diperbarui. Pengecekan di tahap mechanical compartment tidak dilakukan, jadi kekurangan baru ketahuan di vendor electrical. Pekerjaan wiring tertahan (starvation) dan barang jadi harus di-rework.\n\nAlurnya: IQC atau vendor memotret compartment, model YOLOv11 mengusulkan kotak, label, dan jumlah part, lalu operator memvalidasi (human-in-the-loop). Operator bisa menerima atau menolak deteksi yang ragu, menghapus atau memperbaiki kotak yang salah, memotret dari sisi lain kalau part tertutup, dan mencatat penyebab selisih. Hasil akhirnya dibandingkan otomatis dengan BOM versi aktif, dan tiap material ditandai shortage, excess, atau unlisted in BOM. Dari situ bisa dibedakan apakah selisih berasal dari BOM yang usang atau part yang memang belum dipasang. Tiap selisih ditugaskan ke PIC untuk ditindaklanjuti.\n\nModel: dilatih dari foto dan video yang diambil langsung di lantai produksi, membandingkan YOLOv11s dan YOLOv11m dengan dan tanpa augmentasi (Grounding DINO sempat dicoba, tapi hasilnya tidak konsisten). Yang terbaik YOLOv11m tanpa augmentasi: mAP@50 0,899 dan precision 0,876 untuk 15 kelas komponen mekanis. Augmentasi dengan 1000 epoch justru menambah false negative.\n\nGw bikin end to end dengan SDLC iteratif dalam dua sprint (manajemen BOM dan tracking, lalu integrasi AI dan perbandingan otomatis): desain UI, frontend, backend, layanan inferensi, dan deployment.',
  array['Next.js','TypeScript','Tailwind','Go','Gin','YOLOv11','Flask','PostgreSQL','Docker'],
  null, -- ganti jadi '/projects/shortage/deck.pdf' setelah PDF deck ditaruh di public/projects/shortage
  array['/projects/shortage/cover.jpg','/projects/shortage/showcase-1.jpg','/projects/shortage/showcase-2.jpg','/projects/shortage/deteksi.jpg','/projects/shortage/laporan-detail.jpg','/projects/shortage/pic.jpg'],
  '/projects/shortage/demo.mp4',
  1
from public.categories c
where c.name ilike 'Software Development%'
limit 1;
