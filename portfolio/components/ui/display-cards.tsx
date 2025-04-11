// DisplayCards.jsx (atau nama file Anda)
'use client';

import { cn } from "@/lib/utils"; // Sesuaikan path ke utilitas cn Anda
import { Sparkles } from "lucide-react"; // Import ikon Sparkles

// Interface untuk props DisplayCard
interface DisplayCardProps {
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  date?: string;
  iconClassName?: string;
  titleClassName?: string;
}

// Komponen untuk satu kartu display
function DisplayCard({
  className,
  // --- AWAL PERUBAHAN WARNA DEFAULT PROPS ---
  icon = <Sparkles className="size-4 text-sky-300" />, // Ubah: blue -> sky
  title = "Featured",
  description = "Discover amazing content",
  date = "Just now",
  iconClassName = "text-sky-500", // Ubah: blue -> sky
  titleClassName = "text-sky-500", // Ubah: blue -> sky
  // --- AKHIR PERUBAHAN WARNA DEFAULT PROPS ---
}: DisplayCardProps) {
  return (
    // Container utama kartu
    <div
      className={cn(
        "relative flex h-44 w-[26rem] -skew-y-[8deg] select-none flex-col justify-between rounded-xl border-2 border-transparent bg-muted/70 backdrop-blur-sm px-6 py-4 transition-all duration-700 after:absolute after:-right-1 after:top-[-5%] after:h-[110%] after:w-[20rem] after:bg-gradient-to-l after:from-background after:to-transparent after:content-[''] hover:border-white/20 hover:bg-muted [&>*]:flex [&>*]:items-center [&>*]:gap-2 dark:border dark:border-white/5", // Tambah border dasar untuk dark mode jika perlu
        className
      )}
    >
      {/* Bagian atas: Ikon dan Judul */}
      <div>
        {/* --- AWAL PERUBAHAN WARNA BACKGROUND ICON --- */}
        <span className="relative inline-block rounded-full bg-sky-700 p-1.5"> {/* Ubah: blue -> sky */}
        {/* --- AKHIR PERUBAHAN WARNA BACKGROUND ICON --- */}
          {icon}
        </span>
        {/* Judul dengan className dari props */}
        <p className={cn("text-lg font-medium", titleClassName)}>{title}</p>
      </div>
      {/* Deskripsi */}
      <p className="whitespace-nowrap text-lg">{description}</p>
      {/* Tanggal */}
      <p className="text-muted-foreground">{date}</p>
    </div>
  );
}

// Interface untuk props group kartu
interface DisplayCardsProps {
  cards?: DisplayCardProps[];
}

// Komponen utama yang merender beberapa DisplayCard
export default function DisplayCards({ cards }: DisplayCardsProps) {
  // Data kartu default jika tidak ada props 'cards' yang diberikan
  // --- AWAL PERUBAHAN WARNA DALAM DATA DEFAULT ---
  const defaultCards = [
    {
      icon: <Sparkles className="size-4 text-sky-300" />, // Ubah: blue -> sky
      title: "Featured",
      description: "Discover amazing content",
      date: "Just now",
      iconClassName: "text-sky-500", // Ubah: blue -> sky
      titleClassName: "text-sky-500", // Ubah: blue -> sky
      className:
        "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      icon: <Sparkles className="size-4 text-sky-300" />, // Ubah: blue -> sky
      title: "Popular",
      description: "Trending this week",
      date: "2 days ago",
      iconClassName: "text-sky-500", // Ubah: blue -> sky
      titleClassName: "text-sky-500", // Ubah: blue -> sky
      className:
        "[grid-area:stack] translate-x-12 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      icon: <Sparkles className="size-4 text-sky-300" />, // Ubah: blue -> sky
      title: "New",
      description: "Latest updates and features",
      date: "Today",
      iconClassName: "text-sky-500", // Ubah: blue -> sky
      titleClassName: "text-sky-500", // Ubah: blue -> sky
      className:
        "[grid-area:stack] translate-x-24 translate-y-20 hover:translate-y-10",
    },
  ];
  // --- AKHIR PERUBAHAN WARNA DALAM DATA DEFAULT ---

  // Gunakan props 'cards' jika ada, jika tidak gunakan 'defaultCards'
  const displayCards = cards || defaultCards;

  // Render grid yang menumpuk kartu
  return (
    <div className="grid [grid-template-areas:'stack'] place-items-center opacity-100 animate-in fade-in-0 duration-700 -ml-12">
      {/* Loop melalui data kartu dan render setiap DisplayCard */}
      {displayCards.map((cardProps, index) => (
        <DisplayCard key={index} {...cardProps} />
      ))}
    </div>
  );
}