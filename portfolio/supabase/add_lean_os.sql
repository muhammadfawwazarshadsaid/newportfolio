-- Jalankan di Supabase Dashboard > SQL Editor. Aman dijalankan ulang (entri dengan judul yang sama diganti).
-- Aset ada di public/projects/lean-os di repo ini. Semua data di gambar dan video adalah data dummy.
alter table public.projects add column if not exists video_url text;

delete from public.projects where title = 'Lean OS: Dashboard Lean dengan Asisten AI SAGE';

insert into public.projects (category_id, title, description, tags, link_url, image_urls, video_url, "order")
select
  c.id,
  'Lean OS: Dashboard Lean dengan Asisten AI SAGE',
  E'Dashboard maturity Lean Operating System untuk lantai produksi: tiap sel dinilai terhadap 13 prinsip Lean lewat asesmen, lalu skornya, level (Bronze, Silver, Gold), action, dan kepatuhan toolkit dipantau di satu tempat.\n\nSorotan utamanya SAGE, asisten AI di dalam dashboard:\n- Menjawab pertanyaan dalam bahasa biasa ("sel mana yang perlu perhatian dulu, dan kenapa?") dengan angka yang diambil langsung dari database lewat tool read-only, jadi tidak mengarang angka dan tidak bisa mengubah data.\n- Tahu konteks halaman: dibuka dari halaman sel, "this" berarti sel itu.\n- Membuat kartu (tabel dan grafik) yang bisa diunduh PNG atau PDF.\n- Menyusun deck PowerPoint dari data, misalnya laporan bulanan. Deck bisa diedit, dianotasi, dikomentari, lalu direvisi SAGE, dan diunduh sebagai .pptx.\n- Bisa membaca dokumen SharePoint sebagai sumber pengetahuan, dengan sitasi file dan halaman.\n- Mendukung Gemini dan Claude, dengan fallback otomatis kalau satu model sedang sibuk.\n- Halaman AI usage untuk admin: request, token, biaya per model dan per orang, serta budget bulanan.\n\nStack: React, TypeScript, dan Vite di frontend. Node.js dan Express di backend, SQL Server dengan migrasi berurutan, login email atau Microsoft Entra ID, dan deploy ke Azure App Service.\n\nData di gambar dan video adalah data dummy.',
  array['React','TypeScript','Vite','Node.js','Express','Gemini','Claude','SQL Server','Azure'],
  null,
  array['/projects/lean-os/cover.jpg','/projects/lean-os/showcase-1.jpg','/projects/lean-os/showcase-2.jpg','/projects/lean-os/overview.jpg','/projects/lean-os/deck.jpg','/projects/lean-os/sage-panel.jpg'],
  '/projects/lean-os/demo.mp4',
  2
from public.categories c
where c.name ilike 'Software Development%'
limit 1;
