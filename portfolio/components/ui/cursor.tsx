// components/ui/cursor.tsx (atau path Anda)
'use client'

import React, { useEffect, useState, useRef } from 'react' // Import useRef
import { motion, AnimatePresence, useMotionValue } from 'framer-motion'
import { cn } from '@/lib/utils' // Pastikan path cn benar

// --- KOMPONEN POINTER (Dengan Kalkulasi Posisi pageX/pageY) ---
export const Pointer = ({
  children,
  className,
  name
}: {
  children: React.ReactNode
  className?: string
  name: string
}) => {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const ref = useRef<HTMLDivElement>(null) // Gunakan useRef langsung
  // Tidak perlu state rect lagi jika kita hitung offset tiap saat
  const [isInside, setIsInside] = useState<boolean>(false)

  // useEffect bisa disederhanakan jika tidak pakai state rect
  // useEffect(() => {
  //   const handleResize = () => { /* Recalculate something if needed */ };
  //   window.addEventListener('resize', handleResize);
  //   return () => window.removeEventListener('resize', handleResize);
  // }, [])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const element = ref.current;
    if (element) {
      // === PERBAIKAN BARU: Gunakan pageX/pageY ===
      const rect = element.getBoundingClientRect();

      // Hitung offset container dari atas-kiri dokumen
      const elementOffsetX = rect.left + window.scrollX;
      const elementOffsetY = rect.top + window.scrollY;

      // Hitung posisi mouse relatif terhadap container
      // dengan menggunakan koordinat absolut mouse (pageX/Y)
      // dikurangi offset absolut container
      const relativeX = e.pageX - elementOffsetX;
      const relativeY = e.pageY - elementOffsetY;

      x.set(relativeX);
      y.set(relativeY);
      // === AKHIR PERBAIKAN BARU ===
    }
  }

  return (
    <div
      onMouseLeave={() => setIsInside(false)}
      onMouseEnter={() => setIsInside(true)}
      onMouseMove={handleMouseMove}
      style={{ cursor: 'none' }}
      ref={ref}
      className={cn('relative', className)}
    >
      <AnimatePresence>
          {isInside && <FollowPointer x={x} y={y} name={name} />}
      </AnimatePresence>
      {children}
    </div>
  )
}

// --- KOMPONEN FOLLOW POINTER (Tidak Berubah) ---
export const FollowPointer = ({ x, y, name }: { x: any; y: any; name: string }) => {
  return (
    <>
      <motion.div
        className="absolute z-50 h-4 w-4 rounded-full"
        style={{ top: y, left: x, pointerEvents: 'none' }}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{type: "spring", stiffness: 500, damping: 30, duration: 0.1}}
        >
        <svg stroke="currentColor" fill="currentColor" strokeWidth="1" viewBox="0 0 16 16" className="h-6 w-6 -translate-x-[12px] -translate-y-[10px] -rotate-[70deg] transform stroke-sky-600 text-sky-500" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
          <path d="M14.082 2.182a.5.5 0 0 1 .103.557L8.528 15.467a.5.5 0 0 1-.917-.007L5.57 10.694.803 8.652a.5.5 0 0 1-.006-.916l12.728-5.657a.5.5 0 0 1 .556.103z"></path>
        </svg>
        <div className="absolute top-[-30px] left-[10px] w-fit rounded-full bg-sky-500 px-2 py-0.5 text-xs text-white whitespace-nowrap">
          {name || 'Arshad'} {/* Ganti default jika perlu */}
        </div>
      </motion.div>
    </>
  )
}