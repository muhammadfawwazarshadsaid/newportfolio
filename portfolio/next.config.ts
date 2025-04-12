import type { NextConfig } from 'next';

// Mendefinisikan tipe konfigurasi menggunakan NextConfig dari 'next'
const nextConfig: NextConfig = {
  eslint: {
    // Peringatan: Ini memungkinkan build produksi selesai meskipun
    // proyek Anda memiliki error ESLint.
    ignoreDuringBuilds: true,
  },
  // Tambahkan opsi konfigurasi Next.js lainnya di sini jika diperlukan
};

// Mengekspor konfigurasi menggunakan export default
export default nextConfig;