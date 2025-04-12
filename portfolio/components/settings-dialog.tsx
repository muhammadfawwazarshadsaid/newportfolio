// components/settings-dialog.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from 'framer-motion';
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
} from "lucide-react";

// --- Import komponen UI & utilitas ---
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { PortfolioCategory, ProjectDetail, CategoryFromDB, ProjectFromDB } from "@/lib/portfolio-types";

// --- Pemetaan Nama Ikon ke Komponen ---
const iconMap: { [key: string]: React.ElementType } = { Laptop2Icon: Laptop2Icon, PictureInPictureIcon: PictureInPictureIcon, BarChart2: BarChart2 };
const DefaultIcon = HelpCircle;

// --- Varian Animasi ---
const dialogContainerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1, }, }, };
const dialogItemVariants = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut", }, }, };

// ==================================
// === KOMPONEN SETTINGSDIALOG ===
// ==================================
export function SettingsDialog() {
  // --- State ---
  const [open, setOpen] = React.useState(false);
  const [activeMenu, setActiveMenu] = React.useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = React.useState<ProjectDetail | null>(null);
  const isMobile = useIsMobile();
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);
  const [portfolioNavData, setPortfolioNavData] = React.useState<PortfolioCategory[]>([]);
  const [isLoading, setIsLoading] = React.useState(false); // Default false
  const [error, setError] = React.useState<string | null>(null);
  const [hasFetched, setHasFetched] = React.useState(false);

  const supabase = React.useMemo(() => createClient(), []);
  // --- End State ---

  // --- Data Fetching ---
  React.useEffect(() => { let isMounted = true; const fetchPortfolioData = async () => { setIsLoading(true); setError(null); try { const { data: categories, error: categoriesError } = await supabase.from('categories').select('*').order('order', { ascending: true, nullsFirst: false }).order('name'); if (!isMounted) return; if (categoriesError) throw categoriesError; if (!categories) throw new Error("Categories not found."); const { data: projects, error: projectsError } = await supabase.from('projects').select('*').order('order', { ascending: true, nullsFirst: false }).order('created_at', { ascending: false }); if (!isMounted) return; if (projectsError) throw projectsError; if (!projects) throw new Error("Projects not found."); const transformedData = categories.map((category: CategoryFromDB) => { const categoryProjects = projects.filter((p: ProjectFromDB) => p.category_id === category.id).map((p: ProjectFromDB): ProjectDetail => ({ title: p.title, description: p.description || '', tags: p.tags || [], linkUrl: p.link_url || undefined, imageUrls: p.image_urls || [], })); const IconComponent = iconMap[category.icon_name] || DefaultIcon; return { id: category.id, name: category.name, icon: IconComponent, content: category.content || '', details: categoryProjects }; }); setPortfolioNavData(transformedData); setHasFetched(true); if (transformedData.length > 0 && activeMenu === null) { setActiveMenu(transformedData[0].name); } else if (transformedData.length === 0) { setActiveMenu(null); } setError(null); } catch (err: any) { if (isMounted) { console.error("Error fetching portfolio data:", err); setError(err.message || "Gagal memuat data portofolio."); setPortfolioNavData([]); setActiveMenu(null); } } finally { if (isMounted) { setIsLoading(false); } } }; if (open && !hasFetched) { fetchPortfolioData(); } else if (!open) { setHasFetched(false); setSelectedDetail(null); } else if (open && hasFetched && isLoading) { setIsLoading(false); } return () => { isMounted = false; }; }, [open, supabase, hasFetched, activeMenu, isLoading]); // Tambah isLoading dependency?

  // --- Handlers ---
  const handleMenuClick = (menuName: string) => { setActiveMenu(menuName); setSelectedDetail(null); };
  const getActiveContent = () => portfolioNavData.find((item) => item.name === activeMenu)?.content || "";
  const getActiveDetails = () => portfolioNavData.find((item) => item.name === activeMenu)?.details || [];
  const handleDetailClick = (detail: ProjectDetail) => setSelectedDetail(detail);
  const handleBackClick = () => setSelectedDetail(null);
  const checkScroll = React.useCallback(() => { const container=scrollContainerRef.current;if(container){const{scrollLeft,scrollWidth,clientWidth}=container;setCanScrollLeft(scrollLeft > 1);setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);} }, []);
  React.useEffect(() => { const container=scrollContainerRef.current;if(container&&isMobile&&!selectedDetail){checkScroll();window.addEventListener('resize', checkScroll); container.addEventListener('scroll',checkScroll,{passive:true});return()=>{window.removeEventListener('resize', checkScroll); container.removeEventListener('scroll',checkScroll);};}else{setCanScrollLeft(false);setCanScrollRight(false);}}, [isMobile, checkScroll, activeMenu, selectedDetail, portfolioNavData]);
  const handleScroll = (direction: 'left' | 'right') => { const container=scrollContainerRef.current;if(container){const scrollAmount=container.clientWidth*0.7;container.scrollBy({left:direction==='left'?-scrollAmount:scrollAmount,behavior:'smooth'});}};


  // --- Render Functions ---
  const renderHeader = () => ( <header className="flex h-16 shrink-0 items-center border-b px-4 pr-10 md:pr-12 relative"> {activeMenu && !isLoading && ( <TooltipProvider delayDuration={100}> <Breadcrumb> <BreadcrumbList className="items-center"> {!selectedDetail && ( <BreadcrumbItem><Tooltip><TooltipTrigger asChild><BreadcrumbPage className="block truncate max-w-[120px] xs:max-w-[180px] sm:max-w-[250px]">{activeMenu}</BreadcrumbPage></TooltipTrigger><TooltipContent><p>{activeMenu}</p></TooltipContent></Tooltip></BreadcrumbItem> )} {selectedDetail && ( <BreadcrumbItem><Tooltip><TooltipTrigger asChild><button onClick={handleBackClick} className="text-muted-foreground hover:text-foreground transition-colors truncate max-w-[100px] xs:max-w-[150px] sm:max-w-[200px]">{activeMenu}</button></TooltipTrigger><TooltipContent><p>{activeMenu}</p></TooltipContent></Tooltip></BreadcrumbItem> )} {selectedDetail && <BreadcrumbSeparator />} {selectedDetail && ( <BreadcrumbItem><Tooltip><TooltipTrigger asChild><BreadcrumbPage className="block truncate max-w-[120px] xs:max-w-[180px] sm:max-w-[250px]">{selectedDetail.title}</BreadcrumbPage></TooltipTrigger><TooltipContent><p>{selectedDetail.title}</p></TooltipContent></Tooltip></BreadcrumbItem> )} </BreadcrumbList> </Breadcrumb> </TooltipProvider> )} {isLoading && <Skeleton className="h-5 w-3/4 rounded-md" />} </header> );
  const renderContent = () => ( <div className="p-4 pt-4"> {selectedDetail ? ( <div> <button onClick={handleBackClick} className="flex items-center gap-1 mb-4 text-sm text-muted-foreground hover:text-foreground"> <ArrowLeft className="h-4 w-4" /> <span>Kembali ke {activeMenu}</span> </button> <h2 className="text-xl font-semibold mb-2">{selectedDetail.title}</h2> <p className="text-muted-foreground mb-4">{selectedDetail.description}</p> {selectedDetail.tags && selectedDetail.tags.length > 0 && ( <div className="flex flex-wrap gap-2 mb-4"> {selectedDetail.tags.map((tag: string, index: number) => ( <Badge key={index} variant="secondary" className="rounded-full">{tag}</Badge> ))} </div> )} {selectedDetail.linkUrl && ( <div className="mt-4 mb-4"> <a href={selectedDetail.linkUrl} target="_blank" rel="noopener noreferrer" className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 gap-2")}> <Globe className="h-4 w-4" /> <span>Lihat Tautan</span> </a> </div> )} {(() => { const imageUrls = selectedDetail.imageUrls || []; const imageCount = imageUrls.length; if (imageCount === 0) return null; if (imageCount === 1) { return ( <div className="mt-4 mb-4 grid grid-cols-1 gap-2"> <div className="aspect-video relative w-full overflow-hidden rounded-xl bg-muted/50"> <Image src={imageUrls[0]} alt={`Project image 1 for ${selectedDetail.title}`} fill className="object-cover" priority sizes="(max-width: 768px) 100vw, 50vw" /> </div> </div> ); } if (imageCount === 2) { return ( <div className="mt-4 mb-4 grid grid-cols-2 gap-2"> {imageUrls.map((url: string, index: number) => ( <div key={index} className="aspect-video relative w-full overflow-hidden rounded-xl bg-muted/50"> <Image src={url} alt={`Project image ${index + 1} for ${selectedDetail.title}`} fill className="object-cover" priority={index === 0} sizes="(max-width: 768px) 50vw, 33vw" /> </div> ))} </div> ); } if (imageCount >= 3) { return ( <div className="mt-4 mb-4 grid grid-cols-2 gap-2"> <div className="relative col-span-2 aspect-video w-full overflow-hidden rounded-xl bg-muted/50"> <Image src={imageUrls[0]} alt={`Project image 1 for ${selectedDetail.title}`} fill className="object-cover" priority={true} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" /> </div> <div className="relative col-span-1 aspect-video w-full overflow-hidden rounded-xl bg-muted/50"> <Image src={imageUrls[1]} alt={`Project image 2 for ${selectedDetail.title}`} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" /> </div> <div className="relative col-span-1 aspect-video w-full overflow-hidden rounded-xl bg-muted/50"> <Image src={imageUrls[2]} alt={`Project image 3 for ${selectedDetail.title}`} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" /> </div> </div> ); } return null; })()} </div> ) : ( <div className="space-y-4"> <p className="text-muted-foreground">{getActiveContent()}</p> <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4"> {getActiveDetails().map((detail, i) => { const coverUrl = detail.imageUrls?.[0]; return ( <div key={detail.title + i} className={cn( "bg-transparent", "border border-border/40", "rounded-2xl", "cursor-pointer", "hover:border-border/80 hover:shadow-lg", "transition-all duration-300", "group flex flex-col overflow-hidden" )} onClick={() => handleDetailClick(detail)}> <div className="relative w-full aspect-video bg-muted/60"> {coverUrl ? ( <Image src={coverUrl} alt={`Cover for ${detail.title}`} fill className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105" sizes="(max-width: 768px) 100vw, 50vw" /> ) : ( <div className="flex h-full w-full items-center justify-center"> <PictureInPictureIcon className="h-12 w-12 text-muted-foreground/30" /> </div> )} </div> <div className="p-3 flex-1 flex flex-col justify-between"> <h3 className="font-semibold mb-1 truncate">{detail.title}</h3> <p className="text-xs text-primary/80 group-hover:text-primary flex items-center mt-1 self-end transition-colors duration-200"> Lihat Detail <ChevronRight className="h-3 w-3 ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" /> </p> </div> </div> ); })} </div> </div> )} </div> );

  // --- Render Utama Komponen ---
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="h-12 w-44 rounded-full" aria-label="Lihat Portofolio">
          Lihat Portofolio
          <ArrowUpRight className="h-5 w-5 ml-1" />
        </Button>
      </DialogTrigger>
      <DialogContent className="overflow-hidden p-0 rounded-lg md:max-h-[550px] md:max-w-[700px] lg:max-w-[850px] mt-8 mb-8 flex flex-col h-screen md:h-auto">
        <DialogTitle className="sr-only">Portofolio</DialogTitle>
        <DialogDescription className="sr-only">Jelajahi proyek dan keahlian saya.</DialogDescription>

        {isLoading && ( <div className="flex items-center justify-center flex-1 p-4"> <p>Loading portfolio...</p> </div> )}
        {error && !isLoading && ( <div className="flex items-center justify-center flex-1 p-6 text-center text-destructive"> <p>Error: {error}</p> </div> )}
        {!isLoading && !error && portfolioNavData.length === 0 && ( <div className="flex items-center justify-center flex-1 p-6 text-center"> <p>Tidak ada data portofolio.</p> </div> )}

        {!isLoading && !error && portfolioNavData.length > 0 && (
             <>
                {/* Tampilan Mobile */}
                {isMobile && (
                  <motion.div className="flex h-full flex-1 flex-col mb-8 rounded-lg" variants={dialogContainerVariants} initial="hidden" animate="visible">
                     <motion.div variants={dialogItemVariants} className="shrink-0"> {renderHeader()} </motion.div>
                    {!selectedDetail && activeMenu && ( <motion.div className="px-4 pt-4 pb-2 border-b relative shrink-0" variants={dialogItemVariants}> <Button variant="ghost" size="icon" className={cn("absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/80 hover:bg-background backdrop-blur-sm transition-opacity duration-300", canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none")} onClick={() => handleScroll('left')} aria-label="Scroll tabs ke kiri"> <ChevronLeft className="h-5 w-5" /> </Button> <div ref={scrollContainerRef} className="overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide"> <Tabs value={activeMenu} className="w-full inline-block" onValueChange={handleMenuClick}> <TabsList className="flex justify-start"> {portfolioNavData.map((item) => (<TabsTrigger key={item.name} value={item.name} className="flex-shrink-0 rounded-md data-[state=active]:rounded-md">{item.name}</TabsTrigger>))} </TabsList> </Tabs> </div> <Button variant="ghost" size="icon" className={cn("absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/80 hover:bg-background backdrop-blur-sm transition-opacity duration-300", canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none")} onClick={() => handleScroll('right')} aria-label="Scroll tabs ke kanan"> <ChevronRight className="h-5 w-5" /> </Button> </motion.div> )}
                     <motion.div className="flex-1 overflow-y-auto min-h-0" variants={dialogItemVariants}> {renderContent()} </motion.div>
                     <motion.div className="p-4 border-t shrink-0 bg-background" variants={dialogItemVariants}> <DialogClose asChild><Button variant="outline" className="w-full rounded-full">Close</Button></DialogClose> </motion.div>
                  </motion.div>
                )}
                {/* === Tampilan Non-Mobile (Dengan Perbaikan Scroll) === */}
                {!isMobile && (
                    <SidebarProvider>
                        <motion.div className="flex h-[550px] flex-1 overflow-hidden" variants={dialogContainerVariants} initial="hidden" animate="visible">
                            {/* Sidebar */}
                            <motion.div variants={dialogItemVariants} className="h-full">
                               <Sidebar collapsible="none" className="flex h-full border-r w-60 lg:w-64 rounded-l-lg">
                                 <SidebarContent className="flex flex-col">
                                     {/* Pastikan SidebarGroup bisa scroll jika menu banyak */}
                                     <SidebarGroup className="flex-1 overflow-y-auto min-h-0">
                                         <SidebarGroupContent> <SidebarMenu> {portfolioNavData.map((item) => { const IconComp = item.icon; return ( <SidebarMenuItem key={item.name}> <SidebarMenuButton onClick={() => handleMenuClick(item.name)} isActive={item.name === activeMenu && !selectedDetail} tooltip={{ children: item.name, side:"right", align:"center" }} className="rounded-md"> <IconComp className="h-5 w-5 mr-2 flex-shrink-0" /> <span className="truncate">{item.name}</span> </SidebarMenuButton> </SidebarMenuItem> ); })} </SidebarMenu> </SidebarGroupContent>
                                    </SidebarGroup>
                                 </SidebarContent>
                               </Sidebar>
                            </motion.div>
                            {/* Main Content Area */}
                            {/* Hapus overflow-hidden dari main, tambahkan wrapper scroll */}
                            <motion.main className="flex h-full flex-1 flex-col bg-background rounded-r-lg" variants={dialogItemVariants}>
                                {renderHeader()} {/* Header tetap di atas */}
                                {/* Wrapper untuk konten yang bisa discroll */}
                                <div className="flex-1 overflow-y-auto min-h-0">
                                    {renderContent()} {/* Konten dirender di sini */}
                                </div>
                            </motion.main>
                        </motion.div>
                    </SidebarProvider>
                )}
                {/* === Akhir Perbaikan Non-Mobile === */}
             </>
        )}
      </DialogContent>
    </Dialog>
  );
}