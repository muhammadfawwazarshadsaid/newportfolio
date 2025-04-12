// lib/portfolio-types.ts
import { ElementType } from "react";

// Tipe data untuk detail proyek dari database
export interface ProjectFromDB {
  id: string; // uuid
  category_id: string; // uuid
  title: string;
  description: string | null;
  tags: string[] | null; // DB bisa null, defaultnya array kosong
  link_url: string | null;
  image_urls: string[] | null; // DB bisa null, defaultnya array kosong
  order: number | null;
  created_at: string; // timestamp as string
  // Tambahkan ini jika Anda join nama kategori di fetch
  category_name?: string;
  categories?: { name: string } | null; // Untuk hasil join Supabase
}

// Tipe data untuk kategori dari database
export interface CategoryFromDB {
  id: string; // uuid
  name: string;
  icon_name: string;
  content: string | null;
  created_at: string;
}

// Tipe data untuk CV dari database
export interface CVFromDB {
  id: string; // uuid
  file_name: string;
  storage_path: string;
  public_url: string;
  is_active: boolean;
  uploaded_at: string; // timestamp as string
}


// Tipe data yang digunakan di frontend (setelah transformasi)
export interface ProjectDetail {
    title: string;
    description: string; // Pastikan tidak null di frontend
    tags: string[];
    linkUrl?: string; // Opsional
    imageUrls: string[];
}
export interface PortfolioCategory {
    id: string; // Simpan ID kategori jika perlu
    name: string;
    icon: ElementType; // Komponen ikon React
    content: string; // Pastikan tidak null
    details: ProjectDetail[];
}

// Tipe data untuk props DisplayCard
export interface DisplayCardProps {
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  date?: string;
  iconClassName?: string;
  titleClassName?: string;
}