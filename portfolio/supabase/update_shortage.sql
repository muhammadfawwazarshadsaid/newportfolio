-- Jalankan di Supabase Dashboard > SQL Editor. Aman dijalankan ulang.
-- Memperbarui entri Shortage yang SUDAH ADA (tidak menambah baris baru).
-- id, kategori, urutan, dan link lama tetap. Yang diganti: judul, deskripsi, tag, gambar, video.
-- Aset ada di public/projects/shortage di repo ini.
alter table public.projects add column if not exists video_url text;

update public.projects
set
  title = 'Shortage: Deteksi Shortage & Excess Material Panel MCC dengan AI',
  description = E'Sistem informasi yang menggabungkan versioning Bill of Materials (BOM) dengan deteksi material berbasis Computer Vision untuk compartment mekanis panel Motor Control Center (MCC) tipe withdrawable. Tugas Akhir, bersama Schneider Electric Plant Cikarang.\n\nMasalahnya: vendor mekanis sering salah pasang atau melewatkan part, sementara perubahan desain dari engineering dikabarkan manual lewat email atau WhatsApp sehingga BOM tidak langsung diperbarui. Pengecekan di tahap mechanical compartment tidak dilakukan, jadi kekurangan baru ketahuan di vendor electrical. Pekerjaan wiring tertahan (starvation) dan barang jadi harus di-rework.\n\nAlurnya: IQC atau vendor memotret compartment, model YOLOv11 mengusulkan kotak, label, dan jumlah part, lalu operator memvalidasi (human-in-the-loop). Operator bisa menerima atau menolak deteksi yang ragu, menghapus atau memperbaiki kotak yang salah, memotret dari sisi lain kalau part tertutup, dan mencatat penyebab selisih. Hasil akhirnya dibandingkan otomatis dengan BOM versi aktif, dan tiap material ditandai shortage, excess, atau unlisted in BOM. Dari situ bisa dibedakan apakah selisih berasal dari BOM yang usang atau part yang memang belum dipasang. Tiap selisih ditugaskan ke PIC untuk ditindaklanjuti.\n\nModel: dilatih dari foto dan video yang diambil langsung di lantai produksi, membandingkan YOLOv11s dan YOLOv11m dengan dan tanpa augmentasi (Grounding DINO sempat dicoba, tapi hasilnya tidak konsisten). Yang terbaik YOLOv11m tanpa augmentasi: mAP@50 0,899 dan precision 0,876 untuk 15 kelas komponen mekanis. Augmentasi dengan 1000 epoch justru menambah false negative.\n\nGw bikin end to end dengan SDLC iteratif dalam dua sprint (manajemen BOM dan tracking, lalu integrasi AI dan perbandingan otomatis): desain UI, frontend, backend, layanan inferensi, dan deployment.',
  tags = array['Next.js','TypeScript','Tailwind','Go','Gin','YOLOv11','Flask','PostgreSQL','Docker'],
  image_urls = array['/projects/shortage/cover.jpg','/projects/shortage/showcase-1.jpg','/projects/shortage/showcase-2.jpg','/projects/shortage/deteksi.jpg','/projects/shortage/laporan-detail.jpg','/projects/shortage/pic.jpg'],
  video_url = '/projects/shortage/demo.mp4'
where title in (
  'Shortage Excess Material Detection AI Computer Vision',
  'Shortage: Deteksi Shortage & Excess Material Panel MCC dengan AI'
)
returning id, title, "order";
-- Harus keluar 1 baris. Kalau 0 baris, judul lama di database beda: cek dengan
--   select id, title from public.projects where title ilike '%shortage%';
-- lalu ganti judul di klausa where di atas.
