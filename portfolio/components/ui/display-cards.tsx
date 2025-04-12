// DisplayCards.jsx
'use client';

import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react"; // Import Sparkles untuk fallback icon

// Interface untuk props DisplayCard (tetap sama)
interface DisplayCardProps {
  className?: string;
  icon?: React.ReactNode; // Icon akan berupa node React
  title?: string;
  description?: string;
  date?: string; // Jadikan opsional atau hapus
  iconClassName?: string;
  titleClassName?: string;
}

// Komponen untuk satu kartu display (modifikasi)
function DisplayCard({
  className,
  icon, // Terima icon sebagai node
  title = "Kategori", // Default title
  description = "Lihat Proyek", // Default description
  date, // Date sekarang opsional
  iconClassName = "text-sky-500 bg-sky-700", // Default styling icon (bisa dihapus jika selalu dari props)
  titleClassName = "text-sky-500", // Default styling title (bisa dihapus jika selalu dari props)
}: DisplayCardProps) {
  return (
    <div
      className={cn(
        "relative flex h-44 w-[26rem] -skew-y-[8deg] select-none flex-col justify-between rounded-xl border-2 border-transparent bg-muted/70 backdrop-blur-sm px-6 py-4 transition-all duration-700 after:absolute after:-right-1 after:top-[-5%] after:h-[110%] after:w-[20rem] after:bg-gradient-to-l after:from-background after:to-transparent after:content-[''] hover:border-white/20 hover:bg-muted [&>*]:flex [&>*]:items-center [&>*]:gap-2 dark:border dark:border-white/5",
        className
      )}
    >
      {/* Bagian atas: Ikon dan Judul */}
      <div>
        {/* Gunakan iconClassName dari props */}
        <span className={cn("relative inline-block rounded-full p-1.5", iconClassName)}>
          {/* Render icon node yang diterima atau fallback */}
          {icon || <Sparkles className="size-4" />}
        </span>
        {/* Gunakan titleClassName dari props */}
        <p className={cn("text-lg font-medium", titleClassName)}>{title}</p>
      </div>
      {/* Deskripsi */}
      <p className="whitespace-nowrap text-lg">{description}</p>
      {/* Tanggal (hanya render jika ada) */}
      {date && <p className="text-muted-foreground">{date}</p>}
    </div>
  );
}

// Interface untuk props group kartu (tetap sama)
interface DisplayCardsProps {
  cards?: DisplayCardProps[]; // Data kartu sekarang dari props
}

// Komponen utama yang merender beberapa DisplayCard (modifikasi)
export default function DisplayCards({ cards }: DisplayCardsProps) {
  // Hapus definisi defaultCards

  // Handle jika tidak ada kartu yang di-pass (opsional)
  if (!cards || cards.length === 0) {
    // Bisa return null atau placeholder
    // return <div>Tidak ada data untuk ditampilkan.</div>;
     return null;
  }

  // Render grid yang menumpuk kartu dari props
  return (
    <div className="grid [grid-template-areas:'stack'] place-items-center opacity-100 animate-in fade-in-0 duration-700 -ml-12">
      {/* Loop melalui data kartu dari props */}
      {cards.map((cardProps, index) => (
        <DisplayCard key={index} {...cardProps} />
      ))}
    </div>
  );
}