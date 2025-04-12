// lib/portfolio-data.ts
import { Laptop2Icon, PictureInPictureIcon, BarChart2 } from "lucide-react";

export const portfolioData = {
    nav: [
        {
          name: "Software Development & AI",
          icon: Laptop2Icon,
          content: "Berbagai proyek pengembangan perangkat lunak dan implementasi kecerdasan buatan.",
          details: [
            { title: "Project Alpha: Sistem Rekomendasi", description: "Pengembangan sistem rekomendasi berbasis konten untuk platform e-learning.", tags: ["Python", "Machine Learning", "FastAPI", "NextJs", "Docker"], linkUrl: "https://github.com/username/proyek-alpha", imageUrls: ["/images/covers/project-alpha.jpg"] },
            { title: "Project Beta: Aplikasi Mobile", description: "Pembuatan aplikasi mobile cross-platform menggunakan React Native.", tags: ["React Native", "JavaScript", "Firebase", "Expo", "Cloud Functions"], imageUrls: ["/images/covers/project-beta.png", "/images/covers/project-beta-2.jpg"] },
            { title: "Project Gamma: Chatbot AI", description: "Implementasi chatbot AI untuk layanan pelanggan otomatis.", tags: ["Python", "NLP", "Dialogflow", "Webhook", "Google Cloud"], linkUrl: "https://proyek-gamma-demo.netlify.app/", imageUrls: ["/images/covers/project-gamma-1.jpg", "/images/covers/project-gamma-2.png", "/images/covers/project-gamma-3.gif"] },
          ],
        },
        {
          name: "UX/UI Digital Product Design",
          icon: PictureInPictureIcon,
          content: "Desain antarmuka dan pengalaman pengguna untuk produk digital yang intuitif.",
          details: [
            { title: "Design System X", description: "Perancangan dan dokumentasi design system untuk konsistensi produk.", tags: ["Figma", "Storybook", "Design Tokens", "Collaboration"], linkUrl: "https://www.figma.com/community/file/12345", imageUrls: ["/images/covers/design-system-x.png"] },
            { title: "App Redesign Y", description: "Redesain aplikasi mobile untuk meningkatkan usability dan engagement pengguna.", tags: ["User Research", "Prototyping", "Usability Testing", "Figma", "Mobile UI"], imageUrls: ["/images/covers/app-redesign-y.jpg", "/images/covers/app-redesign-y-2.png"] },
          ],
        },
        {
          name: "Business Intelligence Analyst",
          icon: BarChart2,
          content: "Analisis data untuk mendukung pengambilan keputusan bisnis strategis.",
          details: [
            { title: "Sales Dashboard Q1", description: "Pembuatan dashboard interaktif untuk memvisualisasikan performa penjualan kuartal pertama.", tags: ["Tableau", "SQL", "Data Visualization", "ETL", "Dashboard"], linkUrl: "https://public.tableau.com/app/profile/namaanda", imageUrls: ["/images/covers/sales-dashboard.png"] },
            { title: "Market Trend Analysis", description: "Analisis tren pasar menggunakan data historis dan prediktif.", tags: ["Python", "Pandas", "Statistics", "Looker", "Data Modeling"], imageUrls: [] },
          ],
        },
      ],
};

// Definisikan juga tipe data jika menggunakan TypeScript
export type PortfolioData = typeof portfolioData;
export type PortfolioDetail = typeof portfolioData.nav[0]['details'][0];
export type PortfolioCategory = typeof portfolioData.nav[0];