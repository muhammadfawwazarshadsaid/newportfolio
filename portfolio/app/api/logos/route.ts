// app/api/logos/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs'; // Modul filesystem Node.js
import path from 'path'; // Modul path Node.js

export async function GET() {
  // Tentukan path absolut ke direktori public/logo
  // process.cwd() memberikan root direktori proyek Anda
    //   const logoDirectory = path.join(process.cwd(), 'public', 'logo');
    const logoDirectory = path.join(process.cwd(), 'public', 'logo');

  try {
    // Baca isi direktori
    const filenames = fs.readdirSync(logoDirectory);

    // Filter hanya file gambar (contoh: .png, .svg, .jpg, .jpeg, .webp, .gif)
    const imageFiles = filenames.filter(file =>
      /\.(png|svg|jpg|jpeg|webp|gif)$/i.test(file)
    );

    // Kembalikan daftar nama file sebagai JSON
    return NextResponse.json(imageFiles);

  } catch (error) {
    console.error('Error reading logo directory:', error);
    // Kembalikan error jika direktori tidak ditemukan atau ada masalah lain
    return NextResponse.json(
      { error: 'Failed to read logo directory' },
      { status: 500 }
    );
  }
}