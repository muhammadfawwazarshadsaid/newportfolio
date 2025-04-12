// --- HeroSection.jsx ---

'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Download, GithubIcon, Twitter } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';

// Import komponen UI Anda
import { TextEffect } from '@/components/ui/text-effect';
import { InfiniteSlider } from '@/components/ui/infinite-slider';
import { ProgressiveBlur } from '@/components/ui/progressive-blur';
import DisplayCards from '@/components/ui/display-cards'; // Komponen kartu Anda
import { Cover } from '@/components/ui/cover';
import { Pointer } from '@/components/ui/cursor';
import AnimatedCursor from '@/components/ui/animated-cursor';
import { SettingsDialog } from '@/components/settings-dialog';
import { Button } from '@/components/ui/button';

// <<< 1. IMPORT DATA PORTFOLIO >>>
import { portfolioData } from '@/lib/portfolio-data'; // Sesuaikan path

// Varian animasi (tidak berubah)
const containerVariants = { /* ... */ };
const itemVariants = { /* ... */ };

export default function HeroSection() {

  // <<< 2. TRANSFORMASI DATA UNTUK DISPLAY CARDS >>>
  const cardStackClasses = [
    "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0", // Card 1 (bawah)
    "[grid-area:stack] translate-x-12 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0", // Card 2 (tengah)
    "[grid-area:stack] translate-x-24 translate-y-20 hover:translate-y-10", // Card 3 (atas)
  ];

  const displayCardData = portfolioData.nav.map((item, index) => {
    const classIndex = index % cardStackClasses.length;
    const IconComponent = item.icon; // Ambil komponen ikon
    const projectCount = item.details.length;

    return {
      icon: <IconComponent className="size-4 text-sky-300" />, // Render ikon
      title: item.name,
      description: `${projectCount} Proyek Berjalan`, // Deskripsi jumlah proyek
      // date: `Lihat Detail`, // Atau gunakan 'date' untuk call to action
      iconClassName: "text-sky-500 bg-sky-700", // Styling konsisten (contoh)
      titleClassName: "text-sky-500",      // Styling konsisten (contoh)
      className: cardStackClasses[classIndex],
    };
  }).slice(0, 3); // Batasi maksimal 3 kartu sesuai styling stack
  // <<< AKHIR TRANSFORMASI DATA >>>

    return (
        <>
            <main className="overflow-hidden bg-background text-foreground">
                {/* ... Background Decorative Elements ... */}
                 <div aria-hidden className="absolute inset-0 isolate contain-strict block pointer-events-none"> <div className="w-140 h-320 -translate-y-87.5 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" /> <div className="h-320 absolute left-0 top-0 w-60 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" /> <div className="h-320 -translate-y-87.5 absolute left-0 top-0 w-60 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" /> </div>

                {/* Section Hero Utama */}
                <section className="relative z-10">
                  <motion.div
                    className="relative pt-24 pb-16 md:pb-24"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <div className="mx-auto max-w-7xl px-6">
                      <div className="flex flex-col lg:flex-row items-start justify-between gap-12">

                        {/* Kolom Kiri */}
                        <Pointer name="Arshad" className="w-full lg:w-1/2">
                          <motion.div variants={itemVariants}>
                            {/* Tombol Dialog Portofolio */}
                            <SettingsDialog />
                            {/* Tombol Download CV */}
                            <Button variant="outline" className="mt-4 md:ml-4 h-12 w-44 rounded-full" aria-label="Download CV">
                              Download CV
                              <Download className="h-5 w-5 ml-1" />
                            </Button>
                            {/* Teks lainnya */}
                            <TextEffect preset="fade-in-blur" speedSegment={0.3} as="h2" className="text-neutral-400 dark:text-neutral-500 mt-8 text-balance text-2xl font-medium md:text-2xl lg:mt-16"> Power in Every Pixel. </TextEffect>
                            <motion.h1 className="text-balance text-6xl md:text-8xl font-bold bg-gradient-to-b from-neutral-200 to-neutral-600 bg-clip-text text-transparent"> Purpose in </motion.h1>
                            <motion.h1 className="text-balance text-6xl md:text-8xl font-bold text-neutral-800 dark:text-white"> <Cover>Every Line.</Cover> </motion.h1>
                            <TextEffect per="line" preset="fade-in-blur" speedSegment={0.3} delay={0.5} as="p" className="mt-8 text-pretty text-lg max-w-xl text-neutral-600 dark:text-neutral-400"> Hi, I’m Arshad — a developer, designer, and business Intelligence enthusiast. I build intuitive products, craft purposeful designs, and extract insight from data to drive smarter decisions. </TextEffect>
                            <AnimatedCursor text="Developer✨" className="top-1/2 -right-3 md:-right-8 lg:-right-12" />
                            <AnimatedCursor text="UI/UX ✨" className="top-1/3 -right-4 md:-right-8 lg:-right-12" />
                            <AnimatedCursor text="Business Intelligence ✨" className="top-1/6 -right-6 md:-right-8 lg:-right-12" />
                          </motion.div>
                        </Pointer>

                        {/* Kolom Kanan: Kartu/Display */}
                        <motion.div
                          className="w-full lg:w-1/2 mt-8 lg:mt-0"
                          variants={itemVariants}
                        >
                          {/* <<< 4. PASS DATA KE DISPLAYCARDS >>> */}
                          <DisplayCards cards={displayCardData} />
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </section>

                {/* Section "Software I Use" */}
                <motion.section className="overflow-hidden pb-16 relative z-10" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.8, ease: "easeOut" }}>
                   {/* ... Isi InfiniteSlider ... */}
                   <div className="group relative m-auto max-w-7xl mt-12 px-6"> <div className="flex flex-col items-center md:flex-row"> <div className="md:max-w-44 md:border-r md:border-neutral-200 dark:md:border-neutral-700 md:pr-6"> <p className="text-end text-sm mt-2 text-neutral-600 dark:text-neutral-400">Software I Use</p> </div> <div className="relative py-6 mt-8 md:mt-0 md:w-[calc(100%-11rem)]"> <InfiniteSlider speedOnHover={20} speed={40} gap={112}> <div className="flex"><img className="mx-auto h-5 w-fit dark:invert" src="https://html.tailus.io/blocks/customers/nvidia.svg" alt="Nvidia Logo" height="20" width="auto"/></div> <div className="flex"><img className="mx-auto h-4 w-fit dark:invert" src="https://html.tailus.io/blocks/customers/column.svg" alt="Column Logo" height="16" width="auto"/></div> <div className="flex"><img className="mx-auto h-4 w-fit dark:invert" src="https://html.tailus.io/blocks/customers/github.svg" alt="GitHub Logo" height="16" width="auto"/></div> <div className="flex"><img className="mx-auto h-5 w-fit dark:invert" src="https://html.tailus.io/blocks/customers/nike.svg" alt="Nike Logo" height="20" width="auto"/></div> <div className="flex"><img className="mx-auto h-5 w-fit dark:invert" src="https://html.tailus.io/blocks/customers/lemonsqueezy.svg" alt="Lemon Squeezy Logo" height="20" width="auto"/></div> <div className="flex"><img className="mx-auto h-4 w-fit dark:invert" src="https://html.tailus.io/blocks/customers/laravel.svg" alt="Laravel Logo" height="16" width="auto"/></div> <div className="flex"><img className="mx-auto h-7 w-fit dark:invert" src="https://html.tailus.io/blocks/customers/lilly.svg" alt="Lilly Logo" height="28" width="auto"/></div> <div className="flex"><img className="mx-auto h-6 w-fit dark:invert" src="https://html.tailus.io/blocks/customers/openai.svg" alt="OpenAI Logo" height="24" width="auto"/></div> </InfiniteSlider> <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background to-transparent pointer-events-none"></div> <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background to-transparent pointer-events-none"></div> <ProgressiveBlur className="pointer-events-none absolute left-0 top-0 h-full w-20" direction="left" blurIntensity={1}/> <ProgressiveBlur className="pointer-events-none absolute right-0 top-0 h-full w-20" direction="right" blurIntensity={1}/> </div> </div> </div>
                </motion.section>

            </main>
        </>
    );
}