// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
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

module.exports = nextConfig; // Gunakan hanya module.exports