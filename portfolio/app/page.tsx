// app/page.tsx (atau components/HeroSection.tsx)
'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Download, GithubIcon, Twitter } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';

// Import komponen UI
import { TextEffect } from '@/components/ui/text-effect';
import { InfiniteSlider } from '@/components/ui/infinite-slider';
import { ProgressiveBlur } from '@/components/ui/progressive-blur';
import DisplayCards from '@/components/ui/display-cards';
import { Cover } from '@/components/ui/cover';
import { Pointer } from '@/components/ui/cursor';
import AnimatedCursor from '@/components/ui/animated-cursor';
import { SettingsDialog } from '@/components/settings-dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// Import Supabase client & tipe data & Icon Map
import { createClient } from '@/lib/supabase/client';
import type { DisplayCardProps, CategoryFromDB } from '@/lib/portfolio-types';
import { Laptop2Icon, PictureInPictureIcon, BarChart2, HelpCircle } from 'lucide-react';
import { cn } from "@/lib/utils";


// Pemetaan Ikon & Varian Animasi (tidak berubah)
const iconMap: { [key: string]: React.ElementType } = { Laptop2Icon: Laptop2Icon, PictureInPictureIcon: PictureInPictureIcon, BarChart2: BarChart2 };
const DefaultIcon = HelpCircle;
const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.3, delayChildren: 0.2, }, }, };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", }, }, };
const cardStackClasses = [ "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0", "[grid-area:stack] translate-x-12 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0", "[grid-area:stack] translate-x-24 translate-y-20 hover:translate-y-10", ];


export default function HeroSection() {
  // State untuk Data DisplayCards
  const [displayCardData, setDisplayCardData] = React.useState<DisplayCardProps[] | undefined>(undefined);
  const [isLoadingCards, setIsLoadingCards] = React.useState(true);
  const [errorCards, setErrorCards] = React.useState<string | null>(null);

  // State untuk URL CV Aktif
  const [activeCvUrl, setActiveCvUrl] = React.useState<string | null>(null);
  const [isLoadingCvUrl, setIsLoadingCvUrl] = React.useState(true);

  // Fetch Data Kategori
  React.useEffect(() => {
    const fetchCategoryData = async () => { setIsLoadingCards(true); setErrorCards(null); try { const supabase = createClient(); const { data: categories, error: catError } = await supabase.from('categories').select('id, name, icon_name').order('name').limit(3); if (catError) throw catError; if (!categories) throw new Error("No categories found"); const { data: allProjects, error: projErrorAlt } = await supabase.from('projects').select('category_id'); if (projErrorAlt) throw projErrorAlt; if (!allProjects) throw new Error("Could not fetch projects"); const transformedCards = categories.map((category: Pick<CategoryFromDB, 'id'|'name'|'icon_name'>, index) => { const classIndex = index % cardStackClasses.length; const IconComponent = iconMap[category.icon_name] || DefaultIcon; const projectCount = allProjects.filter(p => p.category_id === category.id).length; return { icon: <IconComponent className="size-4 text-sky-300"/>, title: category.name, description: `${projectCount} Proyek Berjalan`, iconClassName: "text-sky-500 bg-sky-700", titleClassName: "text-sky-500", className: cardStackClasses[classIndex] }; }); setDisplayCardData(transformedCards); } catch (err: any) { console.error("Error fetching category data for cards:", err); setErrorCards(err.message || "Gagal memuat kategori."); } finally { setIsLoadingCards(false); } };
    fetchCategoryData();
  }, []);

  // Fetch URL CV Aktif
  React.useEffect(() => {
    const fetchActiveCvUrl = async () => { setIsLoadingCvUrl(true); try { const supabase = createClient(); const { data, error } = await supabase.from('cvs').select('public_url').eq('is_active', true).limit(1).single(); if (error && error.code !== 'PGRST116') { throw error; } setActiveCvUrl(data?.public_url || null); } catch (err: any) { console.error("Error fetching active CV URL:", err); setActiveCvUrl(null); } finally { setIsLoadingCvUrl(false); } };
    fetchActiveCvUrl();
  }, []);


  // <<< State untuk menyimpan daftar logo >>>
  const [logoFiles, setLogoFiles] = React.useState<string[]>([]);
  const [isLoadingLogos, setIsLoadingLogos] = React.useState(true);
  // <<< -------------------------------- >>>

  // <<< Fetch daftar logo dari API Route >>>
  React.useEffect(() => {
    const fetchLogos = async () => {
      setIsLoadingLogos(true);
      try {
        const response = await fetch('/api/logos');
        console.log("API Response Status:", response.status); // <-- Log status
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched Logo Data (Raw):", data); // <-- Log data mentah
        if (Array.isArray(data)) {
            console.log(`Received ${data.length} logos from API. Setting state...`); // <-- Log jumlah sebelum set state
            setLogoFiles(data);
        } else {
             throw new Error("Invalid data format received from API");
        }
      } catch (error) {
        console.error("Failed to fetch logos:", error);
      } finally {
        setIsLoadingLogos(false);
      }
    };

    fetchLogos();
  }, []);

  // Tambahkan log ini juga di dalam body komponen HeroSection sebelum return
  console.log("Current logoFiles state:", logoFiles);
  // <<< ----------------------------- >>>

    return (
        <>
            <main className="overflow-hidden bg-background text-foreground">
                 <div aria-hidden className="absolute inset-0 isolate contain-strict block pointer-events-none"> <div className="w-140 h-320 -translate-y-87.5 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" /> <div className="h-320 absolute left-0 top-0 w-60 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" /> <div className="h-320 -translate-y-87.5 absolute left-0 top-0 w-60 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" /> </div>
                <section className="relative z-10">
                  <motion.div className="relative pt-24 pb-16 md:pb-24" variants={containerVariants} initial="hidden" animate="visible" >
                    <div className="mx-auto max-w-7xl px-6">
                      <div className="flex flex-col lg:flex-row items-start justify-between gap-12">
                        <Pointer name="Arshad" className="w-full lg:w-1/2">
                          <motion.div variants={itemVariants}>
                            <SettingsDialog />
                            <Button variant="outline" className="mt-4 md:ml-4 h-12 w-44 rounded-full" aria-label="Download CV" asChild disabled={isLoadingCvUrl || !activeCvUrl}>
                               {activeCvUrl ? ( <a href={activeCvUrl} download target="_blank" rel="noopener noreferrer"> Download CV <Download className="h-5 w-5 ml-1" /> </a> ) : ( <span>{isLoadingCvUrl ? 'Loading CV...' : 'CV not available'}</span> )}
                            </Button>
                            <TextEffect preset="fade-in-blur" speedSegment={0.3} as="h2" className="text-neutral-400 dark:text-neutral-500 mt-8 text-balance text-2xl font-medium md:text-2xl lg:mt-16"> Power in Every Pixel. </TextEffect> <motion.h1 className="text-balance text-6xl md:text-8xl font-bold bg-gradient-to-b from-neutral-200 to-neutral-600 bg-clip-text text-transparent"> Purpose in </motion.h1> <motion.h1 className="text-balance text-6xl md:text-8xl font-bold text-neutral-800 dark:text-white"> <Cover>Every Line.</Cover> </motion.h1> <TextEffect per="line" preset="fade-in-blur" speedSegment={0.3} delay={0.5} as="p" className="mt-8 text-pretty text-lg max-w-xl text-neutral-600 dark:text-neutral-400"> Hi, I’m Arshad — a developer, designer, and business Intelligence enthusiast. I build intuitive products, craft purposeful designs, and extract insight from data to drive smarter decisions. </TextEffect> <AnimatedCursor text="Developer✨" className="top-1/2 -right-3 md:-right-8 lg:-right-12"/> <AnimatedCursor text="UI/UX ✨" className="top-1/3 -right-4 md:-right-8 lg:-right-12"/> <AnimatedCursor text="Business Intelligence ✨" className="top-1/6 -right-6 md:-right-8 lg:-right-12"/>
                          </motion.div>
                        </Pointer>
                        <motion.div className="w-full lg:w-1/2 mt-8 lg:mt-0" variants={itemVariants} >
                          {isLoadingCards && ( <div className="grid [grid-template-areas:'stack'] place-items-center opacity-100 -ml-12"> {[...Array(3)].map((_, i) => ( <Skeleton key={i} className={cn("relative flex h-44 w-[26rem] -skew-y-[8deg] rounded-xl", cardStackClasses[i])} /> ))} </div> )}
                          {errorCards && <div className="text-destructive">Error: {errorCards}</div>}
                          {!isLoadingCards && !errorCards && <DisplayCards cards={displayCardData} />}
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </section>
                 {/* Section "Software I Use" dengan Logo Dinamis */}
                <motion.section
                  className="overflow-hidden pb-16 relative z-10"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  <div className="group relative m-auto max-w-7xl mt-12 px-6">
                      <div className="flex flex-col items-center md:flex-row">
                          <div className="md:max-w-44 md:border-r md:border-neutral-200 dark:md:border-neutral-700 md:pr-6">
                              <p className="text-end text-sm mt-2 text-neutral-600 dark:text-neutral-400">Software I Use</p>
                          </div>
                          <div className="relative py-6 mt-8 md:mt-0 md:w-[calc(100%-11rem)] min-h-[50px]"> {/* Beri min-height */}
                              {/* Tampilkan loading skeleton jika perlu */}
                              {isLoadingLogos && (
                                  <div className="flex justify-center items-center h-full">
                                      <Skeleton className="h-8 w-3/4" />
                                  </div>
                              )}
                              {/* Render InfiniteSlider jika logo sudah ada */}
                              {!isLoadingLogos && logoFiles.length > 0 && (
                              <InfiniteSlider speedOnHover={20} speed={40} gap={112}>
                                  {/* === Loop melalui logoFiles === */}
                                  {logoFiles.map((filename) => (
                                      // Tingkatkan tinggi container misal jadi h-14 (56px) untuk memberi ruang
                                      <div key={filename} className="flex items-center justify-center h-14">
                                          <Image
                                              // Ganti h-6 jadi h-10 (tinggi 40px)
                                              className="mx-auto h-10 w-auto dark:invert object-contain"
                                              src={`/logo/${filename}`}
                                              alt={`${filename.split('.')[0]} Logo`}
                                              // Sesuaikan properti height jadi 40
                                              height={40}
                                              // Biarkan width 100 atau naikkan sedikit misal 150 (w-auto akan menyesuaikan)
                                              width={150}
                                              unoptimized={filename.endsWith('.svg')}
                                          />
                                      </div>
                                  ))}
                                  {/* === Akhir Loop === */}
                              </InfiniteSlider>
                          )}
                               {!isLoadingLogos && logoFiles.length === 0 && (
                                  <p className="text-center text-muted-foreground">No logos found.</p>
                               )}

                              {/* Efek blur di tepi slider */}
                              <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background to-transparent pointer-events-none"></div>
                              <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background to-transparent pointer-events-none"></div>
                              <ProgressiveBlur className="pointer-events-none absolute left-0 top-0 h-full w-20" direction="left" blurIntensity={1}/>
                              <ProgressiveBlur className="pointer-events-none absolute right-0 top-0 h-full w-20" direction="right" blurIntensity={1}/>
                          </div>
                      </div>
                  </div>
              </motion.section>
        </main>
        </>
    );
}