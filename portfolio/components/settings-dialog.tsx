"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from 'framer-motion'; // <<< 1. IMPORT MOTION
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart2,
  Laptop2Icon,
  PictureInPictureIcon,
  ChevronLeft,
  ChevronRight,
  Globe,
  Download,
} from "lucide-react";

// ... (Import komponen UI lainnya tetap sama)
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";


// Data structure (tidak berubah)
const data = {
    nav: [ { name: "Software Development & AI", icon: Laptop2Icon, content: "Berbagai proyek pengembangan perangkat lunak dan implementasi kecerdasan buatan.", details: [ { title: "Project Alpha: Sistem Rekomendasi", description: "Pengembangan sistem rekomendasi berbasis konten untuk platform e-learning.", tags: ["Python", "Machine Learning", "FastAPI", "NextJs", "Docker"], linkUrl: "https://github.com/username/proyek-alpha", imageUrls: ["/images/covers/project-alpha.jpg"] }, { title: "Project Beta: Aplikasi Mobile", description: "Pembuatan aplikasi mobile cross-platform menggunakan React Native.", tags: ["React Native", "JavaScript", "Firebase", "Expo", "Cloud Functions"], imageUrls: ["/images/covers/project-beta.png", "/images/covers/project-beta-2.jpg"] }, { title: "Project Gamma: Chatbot AI", description: "Implementasi chatbot AI untuk layanan pelanggan otomatis.", tags: ["Python", "NLP", "Dialogflow", "Webhook", "Google Cloud"], linkUrl: "https://proyek-gamma-demo.netlify.app/", imageUrls: ["/images/covers/project-gamma-1.jpg", "/images/covers/project-gamma-2.png", "/images/covers/project-gamma-3.gif"] }, ], }, { name: "UX/UI Digital Product Design", icon: PictureInPictureIcon, content: "Desain antarmuka dan pengalaman pengguna untuk produk digital yang intuitif.", details: [ { title: "Design System X", description: "Perancangan dan dokumentasi design system untuk konsistensi produk.", tags: ["Figma", "Storybook", "Design Tokens", "Collaboration"], linkUrl: "https://www.figma.com/community/file/12345", imageUrls: ["/images/covers/design-system-x.png"] }, { title: "App Redesign Y", description: "Redesain aplikasi mobile untuk meningkatkan usability dan engagement pengguna.", tags: ["User Research", "Prototyping", "Usability Testing", "Figma", "Mobile UI"], imageUrls: ["/images/covers/app-redesign-y.jpg", "/images/covers/app-redesign-y-2.png"] }, ], }, { name: "Business Intelligence Analyst", icon: BarChart2, content: "Analisis data untuk mendukung pengambilan keputusan bisnis strategis.", details: [ { title: "Sales Dashboard Q1", description: "Pembuatan dashboard interaktif untuk memvisualisasikan performa penjualan kuartal pertama.", tags: ["Tableau", "SQL", "Data Visualization", "ETL", "Dashboard"], linkUrl: "https://public.tableau.com/app/profile/namaanda", imageUrls: ["/images/covers/sales-dashboard.png"] }, { title: "Market Trend Analysis", description: "Analisis tren pasar menggunakan data historis dan prediktif.", tags: ["Python", "Pandas", "Statistics", "Looker", "Data Modeling"], imageUrls: [] }, ], }, ],
};

// --- 2. DEFINISIKAN VARIAN ANIMASI ---
const dialogContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Jeda antar item lebih cepat untuk dialog
      delayChildren: 0.1,    // Jeda awal sedikit
    },
  },
};

const dialogItemVariants = {
  hidden: { opacity: 0, y: 15 }, // Mulai dari bawah sedikit
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,       // Durasi lebih cepat
      ease: "easeOut",
    },
  },
};
// --- END DEFINISI VARIAN ---


export function SettingsDialog() {
  // State (tidak berubah)
  const [open, setOpen] = React.useState(false);
  const [activeMenu, setActiveMenu] = React.useState(data.nav[0].name);
  const [selectedDetail, setSelectedDetail] = React.useState<any>(null);
  const isMobile = useIsMobile();
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  // Handlers (tidak berubah)
  const handleMenuClick = (menuName: string) => { setActiveMenu(menuName); setSelectedDetail(null); };
  const getActiveContent = () => data.nav.find((item) => item.name === activeMenu)?.content || "Konten tidak ditemukan";
  const getActiveDetails = () => data.nav.find((item) => item.name === activeMenu)?.details || [];
  const handleDetailClick = (detail: any) => setSelectedDetail(detail);
  const handleBackClick = () => setSelectedDetail(null);
  const checkScroll = React.useCallback(() => { const container=scrollContainerRef.current;if(container){const{scrollLeft,scrollWidth,clientWidth}=container;setCanScrollLeft(scrollLeft > 1);setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);} }, []);
  React.useEffect(() => { const container=scrollContainerRef.current;if(container&&isMobile){checkScroll();container.addEventListener('scroll',checkScroll,{passive:true});const resizeObserver=new ResizeObserver(checkScroll);resizeObserver.observe(container);return()=>{container.removeEventListener('scroll',checkScroll);resizeObserver.unobserve(container);resizeObserver.disconnect();};}else{setCanScrollLeft(false);setCanScrollRight(false);}}, [isMobile, checkScroll, activeMenu]);
  const handleScroll = (direction: 'left' | 'right') => { const container=scrollContainerRef.current;if(container){const scrollAmount=container.clientWidth*0.7;container.scrollBy({left:direction==='left'?-scrollAmount:scrollAmount,behavior:'smooth'});}};

  // Render Header (tidak berubah)
  const renderHeader = () => ( <header className="flex h-16 shrink-0 items-center border-b px-4 pr-10 md:pr-12 relative"> <TooltipProvider delayDuration={100}> <Breadcrumb> <BreadcrumbList className="items-center"> {!selectedDetail && ( <BreadcrumbItem><Tooltip><TooltipTrigger asChild><BreadcrumbPage className="block truncate max-w-[120px] xs:max-w-[180px] sm:max-w-[250px]">{activeMenu}</BreadcrumbPage></TooltipTrigger><TooltipContent><p>{activeMenu}</p></TooltipContent></Tooltip></BreadcrumbItem> )} {selectedDetail && ( <BreadcrumbItem><Tooltip><TooltipTrigger asChild><button onClick={handleBackClick} className="text-muted-foreground hover:text-foreground transition-colors truncate max-w-[100px] xs:max-w-[150px] sm:max-w-[200px]">{activeMenu}</button></TooltipTrigger><TooltipContent><p>{activeMenu}</p></TooltipContent></Tooltip></BreadcrumbItem> )} {selectedDetail && <BreadcrumbSeparator />} {selectedDetail && ( <BreadcrumbItem><Tooltip><TooltipTrigger asChild><BreadcrumbPage className="block truncate max-w-[120px] xs:max-w-[180px] sm:max-w-[250px]">{selectedDetail.title}</BreadcrumbPage></TooltipTrigger><TooltipContent><p>{selectedDetail.title}</p></TooltipContent></Tooltip></BreadcrumbItem> )} </BreadcrumbList> </Breadcrumb> </TooltipProvider> </header> );

  // Render Konten (tidak berubah)
  const renderContent = () => ( <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-4"> {selectedDetail ? ( <div> <button onClick={handleBackClick} className="flex items-center gap-1 mb-4 text-sm text-muted-foreground hover:text-foreground"> <ArrowLeft className="h-4 w-4" /> <span>Kembali ke {activeMenu}</span> </button> <h2 className="text-xl font-semibold mb-2">{selectedDetail.title}</h2> <p className="text-muted-foreground mb-4">{selectedDetail.description}</p> {selectedDetail.tags && selectedDetail.tags.length > 0 && ( <div className="flex flex-wrap gap-2 mb-4"> {selectedDetail.tags.map((tag: string, index: number) => ( <Badge key={index} variant="secondary" className="rounded-full">{tag}</Badge> ))} </div> )} {selectedDetail.linkUrl && ( <div className="mt-4 mb-4"> <a href={selectedDetail.linkUrl} target="_blank" rel="noopener noreferrer" className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 gap-2")}> <Globe className="h-4 w-4" /> <span>Lihat Tautan</span> </a> </div> )} {(() => { const imageUrls = selectedDetail.imageUrls || []; const imageCount = imageUrls.length; if (imageCount === 0) return null; if (imageCount === 1) { return ( <div className="mt-4 mb-4 grid grid-cols-1 gap-2"> <div className="aspect-video relative w-full overflow-hidden rounded-xl bg-muted/50"> <Image src={imageUrls[0]} alt={`Project image 1 for ${selectedDetail.title}`} fill className="object-cover" priority sizes="(max-width: 768px) 100vw, 50vw" /> </div> </div> ); } if (imageCount === 2) { return ( <div className="mt-4 mb-4 grid grid-cols-2 gap-2"> {imageUrls.map((url: string, index: number) => ( <div key={index} className="aspect-video relative w-full overflow-hidden rounded-xl bg-muted/50"> <Image src={url} alt={`Project image ${index + 1} for ${selectedDetail.title}`} fill className="object-cover" priority={index === 0} sizes="(max-width: 768px) 50vw, 33vw" /> </div> ))} </div> ); } if (imageCount >= 3) { return ( <div className="mt-4 mb-4 grid grid-cols-2 gap-2"> <div className="relative col-span-2 aspect-video w-full overflow-hidden rounded-xl bg-muted/50"> <Image src={imageUrls[0]} alt={`Project image 1 for ${selectedDetail.title}`} fill className="object-cover" priority={true} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" /> </div> <div className="relative col-span-1 aspect-video w-full overflow-hidden rounded-xl bg-muted/50"> <Image src={imageUrls[1]} alt={`Project image 2 for ${selectedDetail.title}`} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" /> </div> <div className="relative col-span-1 aspect-video w-full overflow-hidden rounded-xl bg-muted/50"> <Image src={imageUrls[2]} alt={`Project image 3 for ${selectedDetail.title}`} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" /> </div> </div> ); } return null; })()} </div> ) : ( <div className="space-y-4"> <p className="text-muted-foreground">{getActiveContent()}</p> <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> {getActiveDetails().map((detail, i) => { const coverUrl = detail.imageUrls?.[0]; return ( <div key={i} className="bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors group flex flex-col overflow-hidden shadow hover:shadow-md" onClick={() => handleDetailClick(detail)}> <div className="relative w-full aspect-video bg-muted/60"> {coverUrl ? ( <Image src={coverUrl} alt={`Cover for ${detail.title}`} fill className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105" sizes="(max-width: 768px) 100vw, 50vw" /> ) : ( <div className="flex h-full w-full items-center justify-center"> <PictureInPictureIcon className="h-12 w-12 text-muted-foreground/30" /> </div> )} </div> <div className="p-3 flex-1 flex flex-col justify-between"> <h3 className="font-semibold mb-1 truncate">{detail.title}</h3> <p className="text-xs text-primary/80 group-hover:text-primary flex items-center mt-1 self-end transition-colors duration-200"> Lihat Detail <ChevronRight className="h-3 w-3 ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" /> </p> </div> </div> ); })} </div> </div> )} </div> );

  // Render Komponen Dialog Utama
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="h-12 w-44 rounded-full" aria-label="Lihat Portofolio">
          Lihat Portofolio
          <ArrowUpRight className="h-5 w-5 ml-1" />
        </Button>
      </DialogTrigger>
      {/* === TERAPKAN ANIMASI PADA DialogContent === */}
      <DialogContent className="overflow-hidden p-0 rounded-lg md:max-h-[550px] md:max-w-[700px] lg:max-w-[850px] flex flex-col h-screen md:h-auto">
        <DialogTitle className="sr-only">Portofolio</DialogTitle>
        <DialogDescription className="sr-only">Jelajahi proyek dan keahlian saya.</DialogDescription>

        {/* --- Tampilan Mobile --- */}
        {isMobile && (
          // Terapkan varian container di sini
          <motion.div
            className="flex h-full flex-1 flex-col overflow-hidden"
            variants={dialogContainerVariants}
            initial="hidden"
            animate="visible" // Animate saat dialog muncul
           >
             {/* Terapkan varian item ke header */}
             <motion.div variants={dialogItemVariants}>
               {renderHeader()}
             </motion.div>

            {!selectedDetail && (
              // Terapkan varian item ke area Tabs
              <motion.div className="px-4 pt-4 pb-2 border-b relative" variants={dialogItemVariants}>
                 <Button variant="ghost" size="icon" className={cn("absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/80 hover:bg-background backdrop-blur-sm transition-opacity duration-300", canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none")} onClick={() => handleScroll('left')} aria-label="Scroll tabs ke kiri"> <ChevronLeft className="h-5 w-5" /> </Button>
                 <div ref={scrollContainerRef} className="overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide"> <Tabs value={activeMenu} className="w-full inline-block" onValueChange={handleMenuClick}> <TabsList className="flex justify-start"> {data.nav.map((item) => (<TabsTrigger key={item.name} value={item.name} className="flex-shrink-0 rounded-md data-[state=active]:rounded-md">{item.name}</TabsTrigger>))} </TabsList> </Tabs> </div>
                 <Button variant="ghost" size="icon" className={cn("absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/80 hover:bg-background backdrop-blur-sm transition-opacity duration-300", canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none")} onClick={() => handleScroll('right')} aria-label="Scroll tabs ke kanan"> <ChevronRight className="h-5 w-5" /> </Button>
              </motion.div>
            )}
             {/* Terapkan varian item ke area konten utama */}
             {/* Perlu wrapper motion di sini agar bisa menganimasikan content area */}
             <motion.div className="flex-1 overflow-hidden" variants={dialogItemVariants}>
                {renderContent()}
             </motion.div>
          </motion.div>
        )}

        {/* --- Tampilan Non-Mobile --- */}
        {!isMobile && (
            <SidebarProvider>
                {/* Terapkan varian container di sini */}
                <motion.div
                    className="flex h-[550px] flex-1 overflow-hidden"
                    variants={dialogContainerVariants}
                    initial="hidden"
                    animate="visible" // Animate saat dialog muncul
                >
                    {/* Terapkan varian item ke wrapper Sidebar */}
                    {/* Mungkin perlu wrapper div jika Sidebar tidak bisa langsung motion */}
                    <motion.div variants={dialogItemVariants} className="h-full">
                       <Sidebar collapsible="none" className="flex h-full border-r w-60 lg:w-64 rounded-l-lg">
                         <SidebarContent className="flex flex-col"> <SidebarGroup className="flex-1 overflow-y-auto"> <SidebarGroupContent> <SidebarMenu> {data.nav.map((item) => ( <SidebarMenuItem key={item.name}> <SidebarMenuButton onClick={() => handleMenuClick(item.name)} isActive={item.name === activeMenu && !selectedDetail} tooltip={{ children: item.name, side:"right", align:"center" }} className="rounded-md"> <item.icon className="h-5 w-5 mr-2 flex-shrink-0" /> <span className="truncate">{item.name}</span> </SidebarMenuButton> </SidebarMenuItem> ))} </SidebarMenu> </SidebarGroupContent> </SidebarGroup> </SidebarContent>
                       </Sidebar>
                    </motion.div>

                    {/* Terapkan varian item ke main content area */}
                    <motion.main
                        className="flex h-full flex-1 flex-col overflow-hidden bg-background rounded-r-lg"
                        variants={dialogItemVariants}
                    >
                        {renderHeader()}
                        {renderContent()}
                    </motion.main>
                </motion.div>
            </SidebarProvider>
        )}
      {/* === AKHIR PENERAPAN ANIMASI === */}
      </DialogContent>
    </Dialog>
  );
}