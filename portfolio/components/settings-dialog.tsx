// components/settings-dialog.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart2,
  Laptop2Icon,
  PictureInPictureIcon,
  ChevronLeft,
  ChevronRight,
  Globe,
  HelpCircle,
  X as XIcon, // Untuk tombol close modal gambar
  PlayCircle,
  ZoomIn as ZoomInIcon, // Indikator zoom pada gambar (mengganti ZoomInIcon karena ZoomInIcon tidak ada di lucide-react standar, mungkin ZoomIn)
  Maximize2 as ExpandIcon, // Untuk "Baca selengkapnya" (alternatif: ChevronsUpDown, PlusSquare)
  Minimize2 as ShrinkIcon, // Untuk "Lebih sedikit" (alternatif: ChevronsDownUp, MinusSquare)
} from "lucide-react";

// --- Import komponen UI & utilitas ---
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile"; // Pastikan hook ini ada
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"; // Pastikan komponen sidebar ini ada
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils"; // Pastikan utilitas cn ini ada
import { createClient } from "@/lib/supabase/client"; // Pastikan konfigurasi Supabase client ini ada
import type { PortfolioCategory, ProjectDetail, CategoryFromDB, ProjectFromDB } from "@/lib/portfolio-types"; // Pastikan tipe ini sesuai

// --- Pemetaan Nama Ikon ke Komponen ---
const iconMap: { [key: string]: React.ElementType } = { Laptop2Icon: Laptop2Icon, PictureInPictureIcon: PictureInPictureIcon, BarChart2: BarChart2 };
const DefaultIcon = HelpCircle;

// --- Varian Animasi ---
const dialogContainerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1, }, }, };
const dialogItemVariants = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut", }, }, };

// --- Konstanta ---
const DESCRIPTION_TRUNCATE_LENGTH = 180; // Sesuaikan panjang pemotongan deskripsi
// Kartu kategori di hero memakai event ini untuk membuka portofolio pada kategori tersebut.
export const OPEN_PORTFOLIO_EVENT = 'open-portfolio';
const VIDEO_PREVIEW_START = 8; // detik; melewati kartu judul di awal video
const viewVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const, staggerChildren: 0.06 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.14, ease: 'easeIn' as const } },
};
const viewItemVariants = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.34, ease: 'easeOut' as const } } };

// ==================================
// === KARTU PROYEK ===
// ==================================
function ProjectCard({ detail, index, onOpen }: { detail: ProjectDetail; index: number; onOpen: () => void }) {
  const coverUrl = detail.imageUrls?.[0];
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const progressRef = React.useRef<HTMLDivElement>(null);
  const hoverTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showVideo, setShowVideo] = React.useState(false); // video baru dimuat setelah ada niat hover
  const [playing, setPlaying] = React.useState(false);

  const rotateX = useSpring(0, { stiffness: 220, damping: 20 });
  const rotateY = useSpring(0, { stiffness: 220, damping: 20 });
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);
  const glare = useMotionTemplate`radial-gradient(320px circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.13), transparent 65%)`;

  const canHover = () => window.matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches;

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || !canHover()) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    rotateY.set((px - 0.5) * 7);
    rotateX.set((py - 0.5) * -7);
    glareX.set(px * 100);
    glareY.set(py * 100);
  };
  const handleEnter = () => {
    if (!detail.videoUrl || !canHover()) return;
    hoverTimer.current = setTimeout(() => setShowVideo(true), 160);
    const v = videoRef.current;
    if (v) v.play().catch(() => {});
  };
  const handleLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setPlaying(false);
    videoRef.current?.pause();
  };
  React.useEffect(() => () => { if (hoverTimer.current) clearTimeout(hoverTimer.current); }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 22, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 190, damping: 20, delay: Math.min(index, 8) * 0.05 }}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      whileTap={{ scale: 0.985 }}
      className={cn(
        "bg-transparent", "border border-border/40", "rounded-2xl",
        "cursor-pointer", "hover:border-border/80 hover:shadow-2xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background outline-none",
        "transition-[border-color,box-shadow] duration-300", "group relative flex flex-col overflow-hidden"
      )}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(); } }}
      onPointerMove={handleMove}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
      role="button"
      tabIndex={0}
      aria-label={`Lihat detail untuk ${detail.title}`}
    >
      <motion.div aria-hidden className="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: glare }} />
      <div className="relative w-full aspect-video overflow-hidden bg-muted/60">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={`Sampul untuk ${detail.title}`}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 group-focus-visible:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <PictureInPictureIcon className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
        {showVideo && detail.videoUrl && (
          <video
            ref={videoRef}
            src={detail.videoUrl}
            muted
            loop
            playsInline
            autoPlay
            preload="auto"
            aria-hidden
            tabIndex={-1}
            onLoadedMetadata={(e) => { if (e.currentTarget.duration > VIDEO_PREVIEW_START * 2) e.currentTarget.currentTime = VIDEO_PREVIEW_START; }}
            onPlaying={() => setPlaying(true)}
            onTimeUpdate={(e) => {
              const v = e.currentTarget;
              if (progressRef.current && v.duration) progressRef.current.style.transform = `scaleX(${v.currentTime / v.duration})`;
            }}
            className={cn('absolute inset-0 h-full w-full object-cover transition-opacity duration-300', playing ? 'opacity-100' : 'opacity-0')}
          />
        )}
        {detail.videoUrl && (
          <span className="absolute bottom-2 left-2 z-10 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-[11px] font-medium text-white backdrop-blur">
            <PlayCircle className="h-3.5 w-3.5" /> {playing ? 'Memutar' : 'Video'}
          </span>
        )}
        {detail.videoUrl && (
          <div className={cn('absolute inset-x-0 bottom-0 z-10 h-0.5 transition-opacity duration-300', playing ? 'opacity-100' : 'opacity-0')}>
            <div ref={progressRef} className="h-full origin-left scale-x-0 bg-white" />
          </div>
        )}
      </div>
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold mb-1 truncate group-hover:text-primary transition-colors duration-200">{detail.title}</h3>
          {detail.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{detail.description}</p>}
        </div>
        <p className="text-xs text-primary/80 group-hover:text-primary flex items-center mt-1 self-end transition-colors duration-200">
          Lihat Detail
          <ChevronRight className="h-3 w-3 ml-0.5 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
        </p>
      </div>
    </motion.div>
  );
}

// ==================================
// === KOMPONEN IMAGE ZOOM MODAL ===
// ==================================
interface ImageZoomModalProps {
  imageUrl: string | null;
  altText: string;
  images: string[];
  onNavigate: (url: string) => void;
  onClose: () => void;
}

function ImageZoomModal({ imageUrl, altText, images, onNavigate, onClose }: ImageZoomModalProps) {
  const position = imageUrl ? images.indexOf(imageUrl) : -1;
  const hasGallery = images.length > 1 && position >= 0;
  const [direction, setDirection] = React.useState(1);
  const step = React.useCallback((by: number) => {
    if (!hasGallery) return;
    setDirection(by);
    onNavigate(images[(position + by + images.length) % images.length]);
  }, [hasGallery, images, position, onNavigate]);

  // Menangani event Escape key untuk menutup modal
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "ArrowRight") {
        step(1);
      } else if (event.key === "ArrowLeft") {
        step(-1);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, step]);

  if (!imageUrl) return null;

  return (
    <Dialog open={!!imageUrl} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent
        className="p-0 max-w-[90vw] max-h-[90vh] w-auto h-auto bg-transparent border-none shadow-2xl flex items-center justify-center data-[state=open]:animate-contentShow"
        onInteractOutside={onClose}
        // aria-label and aria-describedby might be removed if DialogTitle and DialogDescription are direct children,
        // as Radix UI often wires them up automatically.
        // However, explicit linking is also fine if needed (e.g., aria-labelledby={titleId} aria-describedby={descriptionId})
      >
        {/* ADDED DialogTitle and DialogDescription for accessibility */}
        <DialogTitle className="sr-only">{altText || "Tampilan Gambar Diperbesar"}</DialogTitle>
        {altText && <DialogDescription className="sr-only">{altText}</DialogDescription>}

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative group"
        >
          <AnimatePresence mode="popLayout" initial={false} custom={direction}>
            <motion.div
              key={imageUrl}
              custom={direction}
              initial={{ opacity: 0, x: direction * 60, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: direction * -60, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            >
              <Image
                src={imageUrl}
                alt={altText} // This alt prop on Image is crucial for image accessibility
                width={1600}
                height={1000}
                className="object-contain rounded-lg max-w-[calc(90vw-2rem)] max-h-[calc(90vh-5rem)]"
                priority // Consider if 'priority' is needed here, as modal content isn't typically LCP.
              />
            </motion.div>
          </AnimatePresence>
          {hasGallery && (
            <>
              <Button variant="ghost" size="icon" aria-label="Gambar sebelumnya" onClick={() => step(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/60 text-white backdrop-blur-sm hover:bg-black/80 hover:text-white"><ChevronLeft className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon" aria-label="Gambar berikutnya" onClick={() => step(1)} className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/60 text-white backdrop-blur-sm hover:bg-black/80 hover:text-white"><ChevronRight className="h-5 w-5" /></Button>
              <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 text-xs font-medium tabular-nums text-white backdrop-blur-sm">{position + 1} / {images.length}</span>
            </>
          )}
          {/* The <p id...> for sr-only description is now handled by DialogDescription */}
          <DialogClose
            asChild
            className="absolute top-2 right-2 md:-top-2 md:-right-2 bg-background/60 text-foreground rounded-full hover:bg-background/80 backdrop-blur-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label="Tutup tampilan gambar"
            onClick={onClose}
          >
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 md:h-10 md:w-10">
              <XIcon className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
          </DialogClose>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
// ==================================
// === KOMPONEN SETTINGSDIALOG ===
// ==================================
export function SettingsDialog() {
  // --- State ---
  const [open, setOpen] = React.useState(false);
  const [activeMenu, setActiveMenu] = React.useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = React.useState<ProjectDetail | null>(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = React.useState(false);
  const [zoomedImageUrl, setZoomedImageUrl] = React.useState<string | null>(null);
  const [zoomedImageAlt, setZoomedImageAlt] = React.useState<string>("");
  const isMobile = useIsMobile();
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);
  const [portfolioNavData, setPortfolioNavData] = React.useState<PortfolioCategory[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [hasFetched, setHasFetched] = React.useState(false);

  const supabase = React.useMemo(() => createClient(), []);
  const contentRef = React.useRef<HTMLDivElement>(null);
  // --- End State ---

  // Kartu kategori di hero membuka dialog langsung pada kategorinya.
  React.useEffect(() => {
    const onOpenRequest = (e: Event) => {
      const category = (e as CustomEvent<string>).detail;
      if (category) setActiveMenu(category);
      setSelectedDetail(null);
      setOpen(true);
    };
    window.addEventListener(OPEN_PORTFOLIO_EVENT, onOpenRequest);
    return () => window.removeEventListener(OPEN_PORTFOLIO_EVENT, onOpenRequest);
  }, []);

  // Pindah kategori atau buka detail selalu mulai dari atas.
  React.useEffect(() => {
    contentRef.current?.parentElement?.scrollTo({ top: 0 });
  }, [activeMenu, selectedDetail]);

  // --- Data Fetching ---
  React.useEffect(() => {
    let isMounted = true;
    const fetchPortfolioData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data: categories, error: categoriesError } = await supabase.from('categories').select('*').order('order', { ascending: true, nullsFirst: false }).order('name');
        if (!isMounted) return;
        if (categoriesError) throw categoriesError;
        if (!categories) throw new Error("Categories not found.");

        const { data: projects, error: projectsError } = await supabase.from('projects').select('*').order('order', { ascending: true, nullsFirst: false }).order('created_at', { ascending: false });
        if (!isMounted) return;
        if (projectsError) throw projectsError;
        if (!projects) throw new Error("Projects not found.");

        const transformedData = categories.map((category: CategoryFromDB) => {
          const categoryProjects = projects.filter((p: ProjectFromDB) => p.category_id === category.id).map((p: ProjectFromDB): ProjectDetail => ({
            title: p.title,
            description: p.description || '',
            tags: p.tags || [],
            linkUrl: p.link_url || undefined,
            imageUrls: p.image_urls || [],
            videoUrl: p.video_url || undefined,
          }));
          const IconComponent = iconMap[category.icon_name] || DefaultIcon;
          return { id: category.id, name: category.name, icon: IconComponent, content: category.content || '', details: categoryProjects };
        });

        setPortfolioNavData(transformedData);
        setHasFetched(true);
        if (transformedData.length > 0 && activeMenu === null) {
          setActiveMenu(transformedData[0].name);
        } else if (transformedData.length === 0) {
          setActiveMenu(null);
        }
        setError(null);
      } catch (err: any) {
        if (isMounted) {
          console.error("Error fetching portfolio data:", err);
          setError(err.message || "Gagal memuat data portofolio.");
          setPortfolioNavData([]);
          setActiveMenu(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (open && !hasFetched) {
      fetchPortfolioData();
    } else if (!open) {
      // Reset states when dialog closes
      setHasFetched(false);
      setSelectedDetail(null);
      setIsDescriptionExpanded(false);
      setZoomedImageUrl(null);
    } else if (open && hasFetched && isLoading) {
      // Jika dialog dibuka kembali dan data sudah ada tapi isLoading true, set false
      setIsLoading(false);
    }
    return () => { isMounted = false; };
  }, [open, supabase, hasFetched, activeMenu, isLoading]);

  // --- Handlers ---
  const handleMenuClick = (menuName: string) => {
    setActiveMenu(menuName);
    setSelectedDetail(null);
    setIsDescriptionExpanded(false);
    setZoomedImageUrl(null);
  };

  const getActiveContent = () => portfolioNavData.find((item) => item.name === activeMenu)?.content || "";
  const getActiveDetails = () => portfolioNavData.find((item) => item.name === activeMenu)?.details || [];

  const handleDetailClick = (detail: ProjectDetail) => {
    setSelectedDetail(detail);
    setIsDescriptionExpanded(false);
    setZoomedImageUrl(null);
  };

  const handleBackClick = () => {
    setSelectedDetail(null);
    setIsDescriptionExpanded(false);
    setZoomedImageUrl(null);
  };

  const handleImageClick = (url: string, alt: string) => {
    setZoomedImageUrl(url);
    setZoomedImageAlt(alt);
  };

  const handleCloseZoomModal = () => {
    setZoomedImageUrl(null);
    setZoomedImageAlt("");
  };

  const toggleDescription = () => {
    setIsDescriptionExpanded(prev => !prev);
  };

  const checkScroll = React.useCallback(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setCanScrollLeft(scrollLeft > 1); // Lebih toleran untuk nilai kecil
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1); // Lebih toleran
    }
  }, []);

  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (container && isMobile && !selectedDetail) {
      checkScroll(); // Cek saat pertama kali render
      window.addEventListener('resize', checkScroll);
      container.addEventListener('scroll', checkScroll, { passive: true });
      return () => {
        window.removeEventListener('resize', checkScroll);
        container.removeEventListener('scroll', checkScroll);
      };
    } else {
      setCanScrollLeft(false);
      setCanScrollRight(false);
    }
  }, [isMobile, checkScroll, activeMenu, selectedDetail, portfolioNavData]); // portfolioNavData ditambahkan jika mempengaruhi tab

  const handleScroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = container.clientWidth * 0.7; // Scroll 70% dari lebar terlihat
      container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };


  // --- Render Functions ---
  const renderHeader = () => (
    <header className="flex h-16 shrink-0 items-center border-b px-4 pr-10 md:pr-12 relative">
      {activeMenu && !isLoading && (
        <TooltipProvider delayDuration={100}>
          <Breadcrumb>
            <BreadcrumbList className="items-center">
              {!selectedDetail && (
                <BreadcrumbItem>
                  <Tooltip>
                    <TooltipTrigger asChild><BreadcrumbPage className="block truncate max-w-[120px] xs:max-w-[180px] sm:max-w-[250px]">{activeMenu}</BreadcrumbPage></TooltipTrigger>
                    <TooltipContent><p>{activeMenu}</p></TooltipContent>
                  </Tooltip>
                </BreadcrumbItem>
              )}
              {selectedDetail && (
                <BreadcrumbItem>
                  <Tooltip>
                    <TooltipTrigger asChild><button onClick={handleBackClick} className="text-muted-foreground hover:text-foreground transition-colors truncate max-w-[100px] xs:max-w-[150px] sm:max-w-[200px]">{activeMenu}</button></TooltipTrigger>
                    <TooltipContent><p>{activeMenu}</p></TooltipContent>
                  </Tooltip>
                </BreadcrumbItem>
              )}
              {selectedDetail && <BreadcrumbSeparator />}
              {selectedDetail && (
                <BreadcrumbItem>
                  <Tooltip>
                    <TooltipTrigger asChild><BreadcrumbPage className="block truncate max-w-[120px] xs:max-w-[180px] sm:max-w-[250px]">{selectedDetail.title}</BreadcrumbPage></TooltipTrigger>
                    <TooltipContent><p>{selectedDetail.title}</p></TooltipContent>
                  </Tooltip>
                </BreadcrumbItem>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </TooltipProvider>
      )}
      {isLoading && <Skeleton className="h-5 w-3/4 rounded-md" />}
    </header>
  );

  const renderContent = () => (
    <div ref={contentRef} className="p-4 pt-4">
      <AnimatePresence mode="wait" initial={false}>
      {selectedDetail ? (
        <motion.div key={`detail-${selectedDetail.title}`} variants={viewVariants} initial="hidden" animate="visible" exit="exit">
          <motion.button variants={viewItemVariants} onClick={handleBackClick} className="group/back flex items-center gap-1 mb-4 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover/back:-translate-x-1" />
            <span>Kembali ke {activeMenu}</span>
          </motion.button>
          <motion.h2 variants={viewItemVariants} className="text-xl font-semibold mb-2">{selectedDetail.title}</motion.h2>

          {/* --- MODIFIED DESCRIPTION SECTION --- */}
          <motion.div variants={viewItemVariants} className="text-muted-foreground mb-4">
            <p className="whitespace-pre-line">
              {isDescriptionExpanded || selectedDetail.description.length <= DESCRIPTION_TRUNCATE_LENGTH
                ? selectedDetail.description
                : `${selectedDetail.description.substring(0, DESCRIPTION_TRUNCATE_LENGTH)}...`}
            </p>
            {selectedDetail.description.length > DESCRIPTION_TRUNCATE_LENGTH && (
              <Button
                variant="link"
                className="p-0 h-auto text-sm text-primary hover:text-primary/80 flex items-center gap-1 mt-1"
                onClick={toggleDescription}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleDescription(); } }}
                aria-expanded={isDescriptionExpanded}
                aria-controls={`project-description-${selectedDetail.title.replace(/\s+/g, '-')}`}
              >
                {isDescriptionExpanded ? "Lebih sedikit" : "Baca selengkapnya"}
                {isDescriptionExpanded ? <ShrinkIcon className="h-3.5 w-3.5" /> : <ExpandIcon className="h-3.5 w-3.5" />}
              </Button>
            )}
          </motion.div>
          <div id={`project-description-${selectedDetail.title.replace(/\s+/g, '-')}`} className="sr-only">
            {selectedDetail.description}
          </div>
          {/* --- END MODIFIED DESCRIPTION SECTION --- */}

          {selectedDetail.tags && selectedDetail.tags.length > 0 && (
            <motion.div variants={viewItemVariants} className="flex flex-wrap gap-2 mb-4">
              {selectedDetail.tags.map((tag: string, index: number) => (
                <Badge key={index} variant="secondary" className="rounded-full transition-transform duration-200 hover:-translate-y-0.5">{tag}</Badge>
              ))}
            </motion.div>
          )}
          {selectedDetail.linkUrl && (
            <div className="mt-4 mb-4">
              <a
                href={selectedDetail.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  "disabled:pointer-events-none disabled:opacity-50",
                  "border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 gap-2"
                )}
              >
                <Globe className="h-4 w-4" />
                <span>{selectedDetail.linkUrl.toLowerCase().endsWith('.pdf') ? 'Lihat Deck (PDF)' : 'Lihat Tautan'}</span>
              </a>
            </div>
          )}

          {/* --- VIDEO DEMO --- */}
          {selectedDetail.videoUrl && (
            <motion.div variants={viewItemVariants} className="mt-4 mb-4">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <PlayCircle className="h-4 w-4" /> Video Demo
              </p>
              <div className="flex justify-center rounded-2xl bg-muted/40 p-2 sm:p-3">
                <video
                  key={selectedDetail.videoUrl}
                  src={`${selectedDetail.videoUrl}#t=0.001`}
                  controls
                  playsInline
                  preload="metadata"
                  aria-label={`Video demo ${selectedDetail.title}`}
                  className="block max-h-[70vh] max-w-full rounded-xl bg-black"
                />
              </div>
            </motion.div>
          )}
          {/* --- MODIFIED IMAGE RENDERING SECTION --- */}
          {(() => {
            const imageUrls = selectedDetail.imageUrls || [];
            const imageCount = imageUrls.length;
            if (imageCount === 0) return null;

            const renderImageTile = (url: string, altText: string, priority = false, sizes: string, key?: string | number, className?: string, moreCount = 0) => (
              <div
                key={key}
                className={cn(
                  "aspect-video relative w-full overflow-hidden rounded-xl bg-muted/50 cursor-pointer group focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background outline-none",
                  className
                )}
                onClick={() => handleImageClick(url, altText)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleImageClick(url, altText); } }}
                role="button"
                tabIndex={0}
                aria-label={`Perbesar gambar: ${altText}`}
              >
                <Image
                  src={url}
                  alt={altText}
                  fill
                  className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105 group-focus-visible:scale-105"
                  priority={priority}
                  sizes={sizes}
                />
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 flex items-center justify-center transition-all duration-300 backdrop-blur-[2px]">
                  <ZoomInIcon className="h-8 w-8 text-white drop-shadow-lg" />
                </div>
                {moreCount > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-2xl font-semibold text-white">+{moreCount}</div>
                )}
              </div>
            );

            if (imageCount === 1) {
              return (
                <div className="mt-4 mb-4 grid grid-cols-1 gap-2">
                  {renderImageTile(imageUrls[0], `Gambar proyek 1 untuk ${selectedDetail.title}`, true, "(max-width: 768px) 100vw, 50vw")}
                </div>
              );
            }
            if (imageCount === 2) {
              return (
                <div className="mt-4 mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {imageUrls.map((url: string, index: number) =>
                    renderImageTile(url, `Gambar proyek ${index + 1} untuk ${selectedDetail.title}`, index === 0, "(max-width: 768px) 100vw, (min-width: 769px) 50vw", index)
                  )}
                </div>
              );
            }
            // Untuk 3 gambar atau lebih, tampilkan layout yang berbeda
            if (imageCount >= 3) {
              return (
                <motion.div variants={viewItemVariants} className="mt-4 mb-4 grid grid-cols-2 gap-2">
                  {renderImageTile(imageUrls[0], `Gambar proyek 1 untuk ${selectedDetail.title}`, true, "(max-width: 768px) 100vw, (min-width: 769px) 50vw", "img-0", "col-span-2")}
                  {imageUrls[1] && renderImageTile(imageUrls[1], `Gambar proyek 2 untuk ${selectedDetail.title}`, false, "(max-width: 768px) 50vw, 25vw", "img-1", "col-span-1")}
                  {imageUrls[2] && renderImageTile(imageUrls[2], `Gambar proyek 3 untuk ${selectedDetail.title}`, false, "(max-width: 768px) 50vw, 25vw", "img-2", "col-span-1", imageCount - 3)}
                </motion.div>
              );
            }
            return null;
          })()}
          {/* --- END MODIFIED IMAGE RENDERING SECTION --- */}

        </motion.div>
      ) : ( // Jika tidak ada selectedDetail (tampilan daftar proyek per kategori)
        <motion.div key={`list-${activeMenu}`} className="space-y-4" variants={viewVariants} initial="hidden" animate="visible" exit="exit">
          <p className="text-muted-foreground">{getActiveContent()}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {getActiveDetails().map((detail, i) => (
              <ProjectCard key={detail.title + i} detail={detail} index={i} onOpen={() => handleDetailClick(detail)} />
            ))}
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );

  // --- Render Utama Komponen ---
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="default" className="btn-shine group h-12 w-44 rounded-full" aria-label="Lihat Portofolio">
            See Portfolio
            <ArrowUpRight className="h-5 w-5 ml-1 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="overflow-hidden p-0 rounded-lg md:max-h-[calc(100vh-4rem)] md:max-w-[700px] lg:max-w-[850px] mt-8 mb-8 flex flex-col h-screen md:h-auto">
          <DialogTitle className="sr-only">Portofolio</DialogTitle>
          <DialogDescription className="sr-only">Jelajahi proyek dan keahlian saya.</DialogDescription>

          {isLoading && ( <div className="flex items-center justify-center flex-1 p-4"> <p>Memuat portofolio...</p> </div> )}
          {error && !isLoading && ( <div className="flex flex-col items-center justify-center flex-1 p-6 text-center text-destructive"> <p className="font-semibold">Gagal memuat data!</p><p className="text-sm">{error}</p> </div> )}
          {!isLoading && !error && portfolioNavData.length === 0 && hasFetched && ( <div className="flex items-center justify-center flex-1 p-6 text-center"> <p>Tidak ada data portofolio yang tersedia saat ini.</p> </div> )}

          {!isLoading && !error && portfolioNavData.length > 0 && (
             <>
                {/* Tampilan Mobile */}
                {isMobile && (
                  <motion.div className="flex h-full flex-1 flex-col mb-0 rounded-lg" variants={dialogContainerVariants} initial="hidden" animate="visible"> {/* mb-8 dihilangkan */}
                     <motion.div variants={dialogItemVariants} className="shrink-0"> {renderHeader()} </motion.div>
                    {!selectedDetail && activeMenu && (
                        <motion.div className="px-4 pt-4 pb-2 border-b relative shrink-0" variants={dialogItemVariants}>
                            <Button variant="ghost" size="icon" className={cn("absolute left-1 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/80 hover:bg-background backdrop-blur-sm transition-opacity duration-300", canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none")} onClick={() => handleScroll('left')} aria-label="Scroll tabs ke kiri"> <ChevronLeft className="h-5 w-5" /> </Button>
                            <div ref={scrollContainerRef} className="overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide mx-8">
                                <Tabs value={activeMenu} className="w-full inline-block" onValueChange={handleMenuClick}>
                                    <TabsList className="flex justify-start">
                                        {portfolioNavData.map((item) => (<TabsTrigger key={item.name} value={item.name} className="flex-shrink-0 rounded-md data-[state=active]:rounded-md">{item.name}</TabsTrigger>))}
                                    </TabsList>
                                </Tabs>
                            </div>
                            <Button variant="ghost" size="icon" className={cn("absolute right-1 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/80 hover:bg-background backdrop-blur-sm transition-opacity duration-300", canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none")} onClick={() => handleScroll('right')} aria-label="Scroll tabs ke kanan"> <ChevronRight className="h-5 w-5" /> </Button>
                        </motion.div>
                    )}
                     <motion.div className="flex-1 overflow-y-auto min-h-0" variants={dialogItemVariants}> {renderContent()} </motion.div>
                     <motion.div className="p-4 border-t shrink-0 bg-background" variants={dialogItemVariants}> <DialogClose asChild><Button variant="outline" className="w-full rounded-full">Tutup</Button></DialogClose> </motion.div>
                  </motion.div>
                )}
                {/* === Tampilan Non-Mobile (Desktop) === */}
                {!isMobile && (
                    <SidebarProvider>
                        <motion.div className="flex h-[550px] md:h-[calc(100vh-4rem)] max-h-[700px] flex-1 overflow-hidden" variants={dialogContainerVariants} initial="hidden" animate="visible"> {/* Penyesuaian tinggi */}
                            {/* Sidebar */}
                            <motion.div variants={dialogItemVariants} className="h-full">
                               <Sidebar collapsible="none" className="flex h-full border-r w-56 lg:w-60 rounded-l-lg"> {/* Lebar sidebar disesuaikan */}
                                 <SidebarContent className="flex flex-col">
                                     <SidebarGroup className="flex-1 overflow-y-auto min-h-0 py-2 pr-1"> {/* Tambah padding untuk scrollbar */}
                                         <SidebarGroupContent>
                                             <SidebarMenu>
                                                 {portfolioNavData.map((item) => {
                                                     const IconComp = item.icon;
                                                     return (
                                                         <SidebarMenuItem key={item.name}>
                                                             <SidebarMenuButton
                                                                 onClick={() => handleMenuClick(item.name)}
                                                                 isActive={item.name === activeMenu && !selectedDetail}
                                                                 tooltip={{ children: item.name, side:"right", align:"center" }}
                                                                 className="rounded-md"
                                                                 aria-current={item.name === activeMenu && !selectedDetail ? "page" : undefined}
                                                             >
                                                                 <IconComp className="h-5 w-5 mr-2.5 flex-shrink-0" />
                                                                 <span className="truncate">{item.name}</span>
                                                             </SidebarMenuButton>
                                                         </SidebarMenuItem>
                                                     );
                                                 })}
                                             </SidebarMenu>
                                         </SidebarGroupContent>
                                    </SidebarGroup>
                                 </SidebarContent>
                               </Sidebar>
                            </motion.div>
                            {/* Main Content Area */}
                            <motion.main className="flex h-full flex-1 flex-col bg-background rounded-r-lg" variants={dialogItemVariants}>
                                {renderHeader()}
                                <div className="flex-1 overflow-y-auto min-h-0">
                                    {renderContent()}
                                </div>
                            </motion.main>
                        </motion.div>
                    </SidebarProvider>
                )}
             </>
          )}
        </DialogContent>
      </Dialog>

      {/* --- IMAGE ZOOM MODAL INSTANCE --- */}
      <ImageZoomModal
        imageUrl={zoomedImageUrl}
        altText={zoomedImageAlt}
        images={selectedDetail?.imageUrls ?? []}
        onNavigate={setZoomedImageUrl}
        onClose={handleCloseZoomModal}
      />
    </>
  );
}