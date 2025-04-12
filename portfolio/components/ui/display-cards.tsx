// components/ui/display-cards.tsx
'use client';

import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import type { DisplayCardProps } from "@/lib/portfolio-types"; // <<< Import tipe data

// Komponen untuk satu kartu display
function DisplayCard({
  className,
  icon,
  title = "Kategori",
  description = "Lihat Proyek",
  date,
  iconClassName = "text-sky-500 bg-sky-700", // Anda bisa atur default atau hapus jika selalu dari props
  titleClassName = "text-sky-500",      // Anda bisa atur default atau hapus jika selalu dari props
}: DisplayCardProps) { // Pastikan tipe data sesuai
  return (
    <div
      className={cn(
        "relative flex h-44 w-[26rem] -skew-y-[8deg] select-none flex-col justify-between rounded-xl border-2 border-transparent bg-muted/70 backdrop-blur-sm px-6 py-4 transition-all duration-700 after:absolute after:-right-1 after:top-[-5%] after:h-[110%] after:w-[20rem] after:bg-gradient-to-l after:from-background after:to-transparent after:content-[''] hover:border-white/20 hover:bg-muted [&>*]:flex [&>*]:items-center [&>*]:gap-2 dark:border dark:border-white/5",
        className
      )}
    >
      <div>
        <span className={cn("relative inline-block rounded-full p-1.5", iconClassName)}>
          {icon || <Sparkles className="size-4" />} {/* Fallback icon */}
        </span>
        <p className={cn("text-lg font-medium", titleClassName)}>{title}</p>
      </div>
      <p className="whitespace-nowrap text-lg">{description}</p>
      {date && <p className="text-muted-foreground">{date}</p>}
    </div>
  );
}

// Interface props utama
interface DisplayCardsProps {
  cards?: DisplayCardProps[]; // Menerima array kartu
}

// Komponen utama
export default function DisplayCards({ cards }: DisplayCardsProps) {
  // Handle jika tidak ada kartu
  if (!cards || cards.length === 0) {
     return <div className="h-44 w-[26rem] flex items-center justify-center text-muted-foreground">Memuat kategori...</div>; // Placeholder loading/empty
  }

  return (
    <div className="grid [grid-template-areas:'stack'] place-items-center opacity-100 animate-in fade-in-0 duration-700 -ml-12">
      {/* Loop dari props */}
      {cards.map((cardProps, index) => (
        <DisplayCard key={index} {...cardProps} />
      ))}
    </div>
  );
}