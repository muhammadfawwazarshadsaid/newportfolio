// next.config.mjs atau next.config.ts

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    // Peringatan: Ini memungkinkan build produksi selesai meskipun
    // proyek Anda memiliki error ESLint.
    ignoreDuringBuilds: true,
  },

  // === TAMBAHKAN BAGIAN INI ===
  images: {
    remotePatterns: [
      {
        protocol: 'https', // Sesuaikan jika http (jarang terjadi)
        hostname: 'ivuiwoxecmfiqyovgzgv.supabase.co', // <<< GANTI DENGAN HOSTNAME SUPABASE ANDA
        port: '', // Kosongkan untuk port default (443 for https)
        pathname: '/storage/v1/object/public/**', // Izinkan semua path di public storage
      },
      // Tambahkan pattern lain jika perlu
    ],
  },
  // === AKHIR BAGIAN TAMBAHAN ===

  // Tambahkan opsi konfigurasi Next.js lainnya di sini jika diperlukan
};

export default nextConfig; // Gunakan hanya export default