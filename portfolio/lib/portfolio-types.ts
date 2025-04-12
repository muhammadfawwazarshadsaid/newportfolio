// lib/portfolio-types.ts
import { ElementType } from "react"; // Tipe untuk komponen React seperti ikon

// 1. Tipe data langsung dari tabel Supabase

export interface CategoryFromDB {
  id: string; // uuid
  name: string;
  icon_name: string; // Nama ikon (string)
  content: string | null;
  order: number | null; // Kolom order ditambahkan
  created_at: string;
}

export interface ProjectFromDB {
  id: string; // uuid
  category_id: string; // uuid
  title: string;
  description: string | null;
  tags: string[] | null; // Array teks di DB bisa null
  link_url: string | null;
  image_urls: string[] | null; // Array teks di DB bisa null
  order: number | null; // Kolom order
  created_at: string;
  // Properti ini ditambahkan saat join di Supabase query
  categories?: { name: string } | null; // Relasi join (opsional)
  // Anda bisa juga definisikan properti hasil pemetaan manual jika perlu
  category_name?: string; // Hasil pemetaan manual
}

export interface CVFromDB {
  id: string; // uuid
  file_name: string;
  storage_path: string;
  public_url: string;
  is_active: boolean;
  uploaded_at: string;
}


// 2. Tipe data yang mungkin digunakan di frontend setelah transformasi

// Tipe untuk detail proyek yang siap ditampilkan (array sudah pasti array, dll)
export interface ProjectDetail {
    title: string;
    description: string; // Di frontend, kita pastikan tidak null
    tags: string[];      // Di frontend, kita pastikan array (bisa kosong)
    linkUrl?: string;     // Opsional
    imageUrls: string[];   // Di frontend, kita pastikan array (bisa kosong)
}

// Tipe untuk kategori yang siap ditampilkan (dengan komponen ikon & detail)
export interface PortfolioCategory {
    id: string;          // Simpan ID
    name: string;
    icon: ElementType; // Komponen Ikon React
    content: string;     // Pastikan tidak null
    details: ProjectDetail[];
}

// 3. Tipe data untuk props komponen UI (jika terpisah)

// Tipe props untuk komponen DisplayCard
export interface DisplayCardProps {
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  date?: string;
  iconClassName?: string;
  titleClassName?: string;
}