// --- HeroSection.jsx ---

'use client'; // Pastikan ini ada di baris paling atas jika menggunakan Next.js App Router

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, BetweenVerticalEnd, ChevronDown, ChevronRight, ExpandIcon, GithubIcon, HomeIcon, SectionIcon, TerminalIcon, Twitter } from 'lucide-react'; // Impor ikon yang Anda butuhkan
import Image from 'next/image';
import { motion } from 'framer-motion'; // Import motion dari framer-motion untuk animasi utama

// Import komponen UI Anda (pastikan path-nya benar)
import { TextEffect } from '@/components/ui/text-effect';
// import { HeroHeader } from '@/components/hero6-header'; // Uncomment jika digunakan
import { InfiniteSlider } from '@/components/ui/infinite-slider';
import { ProgressiveBlur } from '@/components/ui/progressive-blur';
// import { FloatingDock } from '@/components/ui/floating-dock'; // Uncomment jika digunakan
// import { ContainerTextFlip } from '@/components/ui/container-text-flip'; // Uncomment jika digunakan
// import { PulsatingButton } from "@/components/magicui/pulsating-button"; // Uncomment jika digunakan
import DisplayCards from '@/components/ui/display-cards'; // Komponen kartu Anda
import { Cover } from '@/components/ui/cover';
import { Pointer } from '@/components/ui/cursor';
import AnimatedCursor from '@/components/ui/animated-cursor';
import { PulsatingButton } from '@/components/magicui/pulsating-button';

// Varian animasi Framer Motion
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3, // Jeda antar animasi anak
      delayChildren: 0.2,   // Jeda sebelum animasi anak dimulai
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 }, // Mulai dari bawah dan transparan
  visible: {
    opacity: 1,
    y: 0,                     // Bergerak ke posisi asli
    transition: {
      duration: 0.6,          // Durasi animasi
      ease: "easeOut",        // Efek easing
    },
  },
};

export default function HeroSection() {
    // Data contoh untuk FloatingDock (jika ingin digunakan)

    return (
        <>
            <main className="overflow-hidden bg-background text-foreground"> {/* Pastikan ada background dan text color dasar */}

                {/* Background Decorative Elements (Hanya Desktop) */}
                <div
                    aria-hidden
                    className="absolute inset-0 isolate contain-strict block pointer-events-none"> {/* Tambahkan pointer-events-none */}
                    <div className="w-140 h-320 -translate-y-87.5 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
                    <div className="h-320 absolute left-0 top-0 w-60 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
                    <div className="h-320 -translate-y-87.5 absolute left-0 top-0 w-60 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
                </div>

                {/* Section Hero Utama dengan Animasi Entri */}
                <section className="relative z-10"> {/* OK */}
                  {/* Container utama dibungkus motion.div untuk stagger effect */}
                  {/* HAPUS <Pointer>...</Pointer> DARI SINI */}
                  <motion.div
                    className="relative pt-24 pb-16 md:pb-24" // OK
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <div className="mx-auto max-w-7xl px-6"> {/* OK */}
                      <div className="flex flex-col lg:flex-row items-start justify-between gap-12"> {/* OK */}

                        {/* === MULAI PERBAIKAN === */}

                        {/* 1. Bungkus kolom kiri DENGAN Pointer DI SINI */}
                        <Pointer name="Arshad" className="w-full lg:w-1/2">
                          {/* 2. motion.div kolom kiri SEKARANG ada DI DALAM Pointer */}
                          {/* 3. Hapus kelas lebar dari motion.div ini karena sudah di Pointer */}
                          <motion.div
                            variants={itemVariants} // Terapkan animasi item
                          >
                            {/* Sub-judul */}
                            <TextEffect
                              preset="fade-in-blur"
                              speedSegment={0.3}
                              as="h2"
                              className="text-neutral-400 dark:text-neutral-500 mt-8 text-balance text-2xl font-medium md:text-2xl lg:mt-16">
                              Power in Every Pixel.
                            </TextEffect>

                            {/* Judul "Build" dengan gradien */}
                            <motion.h1
                              className="text-balance text-6xl md:text-8xl font-bold bg-gradient-to-b from-neutral-200 to-neutral-600 bg-clip-text text-transparent"
                            >
                              Purpose in
                            </motion.h1>

                            {/* Judul "Impact." menggunakan Cover (Ini masih pakai Cover di kode Anda, BUKAN animasi kata?) */}
                            {/* Jika ingin animasi kata, ganti bagian ini */}
                            <motion.h1
                              className="text-balance text-6xl md:text-8xl font-bold text-neutral-800 dark:text-white"
                            >
                               <Cover>Every Line.</Cover> {/* Sesuaikan ini jika perlu animasi kata */}
                            </motion.h1>

                            {/* Paragraf Deskripsi */}
                            <TextEffect
                              per="line"
                              preset="fade-in-blur"
                              speedSegment={0.3}
                              delay={0.5}
                              as="p"
                              className="mt-8 text-pretty text-lg max-w-xl text-neutral-600 dark:text-neutral-400">
                              Hi, I’m Arshad — a developer, designer, and business Intelligence enthusiast.
                              I build intuitive products, craft purposeful designs, and extract insight from data to drive smarter decisions.
                            </TextEffect>
                            <AnimatedCursor
                                      text="Developer✨"
                                      className="top-1/2 -right-3 md:-right-8 lg:-right-12" // Sesuaikan posisi ini!
                                  />
                            <AnimatedCursor
                                      text="UI/UX ✨"
                                      className="top-1/3 -right-4 md:-right-8 lg:-right-12" // Sesuaikan posisi ini!
                                  />
                            <AnimatedCursor
                                      text="Business Intelligence ✨"
                                      className="top-1/6 -right-6 md:-right-8 lg:-right-12" // Sesuaikan posisi ini!
                                  />


                            {/* Placeholder Tombol */}
                            {/* <div className="mt-10 flex flex-wrap gap-4"> ... </div> */}

                          </motion.div>
                        </Pointer> {/* 4. Tag penutup Pointer DI SINI, setelah motion.div kolom kiri */}

                        {/* === AKHIR PERBAIKAN === */}


                        {/* Kolom Kanan: Kartu/Display */}
                        <motion.div
                          className="w-full lg:w-1/2 mt-8 lg:mt-0" // OK
                          variants={itemVariants} // OK
                        >
                          <DisplayCards /> {/* OK */}
                        </motion.div>
                      </div> {/* Akhir flex row */}
                    </div> {/* Akhir max-w container */}
                  </motion.div> {/* Akhir motion container stagger */}
          </section> {/* Akhir section */}
          
            {/* 2. Container untuk Tombol Animasi */}
                {/* Container untuk Tombol Animasi */}
                <div className="relative z-20 flex justify-center -mb-5">
                        <button
                            type="button"
                            className="h-12 ring-sky-500  w-44 text-bold p-2.5 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors duration-200"
                            aria-label="Scroll down"
                            onClick={() => document.getElementById('software-section')?.scrollIntoView({ behavior: 'smooth' })}
                        > See Portfolio
                            <ArrowUpRight className="h-5 w-5" />
                        </button>
                    {/* </PulsatingButton> */}
                </div>

                {/* Section "Software I Use" dengan Animasi Scroll */}
                <motion.section
                  className="overflow-hidden pb-16 relative z-10" // Tambah z-index jika perlu
                  initial={{ opacity: 0, y: 50 }} // State awal
                  whileInView={{ opacity: 1, y: 0 }} // State saat terlihat
                  viewport={{ once: true, amount: 0.2 }} // Picu saat 20% terlihat
                  transition={{ duration: 0.8, ease: "easeOut" }} // Durasi dan easing
                >
                  <div className="group relative m-auto max-w-7xl mt-12 px-6">
                      <div className="flex flex-col items-center md:flex-row">
                          <div className="md:max-w-44 md:border-r md:border-neutral-200 dark:md:border-neutral-700 md:pr-6">
                              <p className="text-end text-sm mt-2 text-neutral-600 dark:text-neutral-400">Software I Use</p>
                          </div>
                          <div className="relative py-6 mt-8 md:mt-0 md:w-[calc(100%-11rem)]">
                              {/* InfiniteSlider sudah animatif */}
                              <InfiniteSlider
                                  speedOnHover={20}
                                  speed={40}
                                  gap={112}>
                                  {/* Logo-logo (pastikan src benar atau ganti dengan komponen Image Next.js jika di-host lokal) */}
                                  <div className="flex"><img className="mx-auto h-5 w-fit dark:invert" src="https://html.tailus.io/blocks/customers/nvidia.svg" alt="Nvidia Logo" height="20" width="auto"/></div>
                                  <div className="flex"><img className="mx-auto h-4 w-fit dark:invert" src="https://html.tailus.io/blocks/customers/column.svg" alt="Column Logo" height="16" width="auto"/></div>
                                  <div className="flex"><img className="mx-auto h-4 w-fit dark:invert" src="https://html.tailus.io/blocks/customers/github.svg" alt="GitHub Logo" height="16" width="auto"/></div>
                                  <div className="flex"><img className="mx-auto h-5 w-fit dark:invert" src="https://html.tailus.io/blocks/customers/nike.svg" alt="Nike Logo" height="20" width="auto"/></div>
                                  <div className="flex"><img className="mx-auto h-5 w-fit dark:invert" src="https://html.tailus.io/blocks/customers/lemonsqueezy.svg" alt="Lemon Squeezy Logo" height="20" width="auto"/></div>
                                  <div className="flex"><img className="mx-auto h-4 w-fit dark:invert" src="https://html.tailus.io/blocks/customers/laravel.svg" alt="Laravel Logo" height="16" width="auto"/></div>
                                  <div className="flex"><img className="mx-auto h-7 w-fit dark:invert" src="https://html.tailus.io/blocks/customers/lilly.svg" alt="Lilly Logo" height="28" width="auto"/></div>
                                  <div className="flex"><img className="mx-auto h-6 w-fit dark:invert" src="https://html.tailus.io/blocks/customers/openai.svg" alt="OpenAI Logo" height="24" width="auto"/></div>
                              </InfiniteSlider>

                              {/* Efek blur di tepi slider */}
                              <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background to-transparent pointer-events-none"></div> {/* Perbaiki gradien overlay */}
                              <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background to-transparent pointer-events-none"></div> {/* Perbaiki gradien overlay */}
                              <ProgressiveBlur className="pointer-events-none absolute left-0 top-0 h-full w-20" direction="left" blurIntensity={1}/>
                              <ProgressiveBlur className="pointer-events-none absolute right-0 top-0 h-full w-20" direction="right" blurIntensity={1}/>
                          </div>
                      </div>
                  </div>
              </motion.section>

                {/* Tempat untuk FloatingDock jika ingin digunakan */}
                {/* <FloatingDock links={links} /> */}

            </main>
        </>
    );
}