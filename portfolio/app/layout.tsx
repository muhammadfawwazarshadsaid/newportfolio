import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Arshad Said",
  description: "His portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        // Correct cn usage
        className={cn(
            "antialiased", // Static base class
            geistSans.variable, // Font variable class
            geistMono.variable, // Font variable class
            "bg-background",
            "bg-[url('/bg.png')]",
            "bg-cover bg-center bg-no-repeat",
            "min-h-screen"
            // "bg-fixed" // Optional
        )}>
        {children} {/* Konten halaman (termasuk HeroSection) akan dirender di sini */}
      </body>
    </html>
  );
}
