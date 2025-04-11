'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils'; // Sesuaikan path utilitas cn

const AnimatedCursor = ({ className = '', text = '✨ Focus' }) => {
  // Warna tema (ganti sesuai preferensi Anda)
  const primaryColor = 'var(--sky-500)'; // Tailwind: sky-500
  const secondaryColor = 'var(--sky-400)'; // Tailwind: sky-400
  const textClass = 'text-sky-500';
  const bgClass = 'bg-sky-500';
  const borderClass = 'border-sky-500';

  return (
    <motion.div
      initial={{ translateX: '0', translateY: '0' }}
      animate={{ translateX: ['0px', '15px', '0px'], translateY: ['0px', '-25px', '0px'] }} // Animasi gerakan (sesuaikan)
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} // Durasi & loop animasi
      // Gunakan absolute positioning, atur posisi via className di HeroSection
      className={cn('absolute z-20 flex items-center gap-2 pointer-events-none', className)}
    >
      {/* Bubble Text */}
      <div
        className={cn(
          'w-fit rounded-full border px-2 py-1 text-xs text-white shadow-lg', // Ukuran teks dikecilkan
          bgClass,
          borderClass
        )}
      >
        {text}
      </div>
      {/* SVG Pointer Icon */}
      <svg fill="none" height="18" viewBox="0 0 17 18" width="17">
        <path
          d="M15.5036 3.11002L12.5357 15.4055C12.2666 16.5204 10.7637 16.7146 10.22 15.7049L7.4763 10.6094L2.00376 8.65488C0.915938 8.26638 0.891983 6.73663 1.96711 6.31426L13.8314 1.65328C14.7729 1.28341 15.741 2.12672 15.5036 3.11002ZM7.56678 10.6417L7.56645 10.6416C7.56656 10.6416 7.56667 10.6416 7.56678 10.6417L7.65087 10.4062L7.56678 10.6417Z"
          // Gunakan style inline untuk warna dari CSS variable
          style={{ fill: primaryColor, stroke: secondaryColor }}
          strokeWidth="1.5"
        />
      </svg>
    </motion.div>
  );
};

export default AnimatedCursor;