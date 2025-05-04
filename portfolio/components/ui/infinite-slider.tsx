'use client';
import { cn } from '@/lib/utils';
import { useMotionValue, animate, motion } from 'motion/react';
import { useState, useEffect } from 'react';
import useMeasure from 'react-use-measure';

export type InfiniteSliderProps = {
  children: React.ReactNode;
  gap?: number;
  speed?: number;
  speedOnHover?: number;
  direction?: 'horizontal' | 'vertical';
  reverse?: boolean;
  className?: string;
};

export function InfiniteSlider({
  children,
  gap = 16,
  speed = 100,
  speedOnHover,
  direction = 'horizontal',
  reverse = false,
  className,
}: InfiniteSliderProps) {
  const [currentSpeed, setCurrentSpeed] = useState(speed);
  const [ref, { width, height }] = useMeasure();
  const translation = useMotionValue(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [key, setKey] = useState(0);
useEffect(() => {
    let controls;
    const size = direction === 'horizontal' ? width : height;

    // --- Tambahkan Pengecekan Awal ---
    if (!size || size <= 0) {
        // console.log("InfiniteSlider: Size not measured or zero, skipping animation setup.");
        return; // Jangan jalankan jika ukuran belum ada atau nol
    }
    // --- Akhir Pengecekan Awal ---

    // Perhitungan 'to' (Tampaknya sudah benar)
    const singleSetWidthPlusGap = size / 2 + gap / 2; // Ini hanya untuk kejelasan, perhitungan asli lebih akurat
    const targetTranslate = -(width / 2 + gap / 2); // -(W + gap) if horizontal

    const from = reverse ? targetTranslate : 0;
    const to = reverse ? 0 : targetTranslate;


    const distanceToTravel = Math.abs(to - from);
    const duration = distanceToTravel / currentSpeed;

    // --- Tambahkan Pengecekan Duration ---
     if (currentSpeed <= 0 || !Number.isFinite(duration) || duration <= 0) {
          console.warn("InfiniteSlider: Invalid speed or calculated duration. Animation paused.", { currentSpeed, distanceToTravel, duration, size });
          // Mungkin hentikan animasi yang sedang berjalan jika ada
           // translation.stop(); // Hentikan motion value jika perlu
           // translation.set(from); // Reset ke posisi awal
          return; // Jangan mulai animasi baru jika durasi tidak valid
     }
     // --- Akhir Pengecekan Duration ---

    if (isTransitioning) {
        // Logika transisi hover (biarkan dulu, tapi ini bisa jadi sumber masalah lain)
        const remainingDistance = Math.abs(translation.get() - to);
        const transitionDuration = (currentSpeed > 0 && Number.isFinite(remainingDistance)) ? Math.max(0.01, remainingDistance / currentSpeed) : 0.1; // Pastikan durasi positif

        controls = animate(translation, to, { // Animate hanya ke 'to'
            ease: 'linear',
            duration: transitionDuration,
            onComplete: () => {
                translation.set(from); // Reset posisi *setelah* transisi selesai
                setIsTransitioning(false);
                setKey((prevKey) => prevKey + 1); // Restart loop utama
            },
        });
    } else {
        // Animasi utama - TANPA onRepeat
        controls = animate(translation, [from, to], {
            ease: 'linear',
            duration: duration,
            repeat: Infinity,
            repeatType: 'loop', // Biarkan 'loop' menangani reset
            repeatDelay: 0,
        });
    }

    return () => {
        // Pastikan animasi dihentikan saat komponen unmount atau effect re-run
         controls?.stop();
     };
}, [
    key,
    translation,
    currentSpeed,
    width, // Langsung gunakan width dari useMeasure
    height, // Langsung gunakan height dari useMeasure
    gap,
    isTransitioning,
    direction,
    reverse,
]);
  
  const hoverProps = speedOnHover
    ? {
        onHoverStart: () => {
          setIsTransitioning(true);
          setCurrentSpeed(speedOnHover);
        },
        onHoverEnd: () => {
          setIsTransitioning(true);
          setCurrentSpeed(speed);
        },
      }
    : {};

  return (
    <div className={cn('overflow-hidden', className)}>
      <motion.div
        className='flex w-max'
        style={{
          ...(direction === 'horizontal'
            ? { x: translation }
            : { y: translation }),
          gap: `${gap}px`,
          flexDirection: direction === 'horizontal' ? 'row' : 'column',
        }}
        ref={ref}
        {...hoverProps}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}
