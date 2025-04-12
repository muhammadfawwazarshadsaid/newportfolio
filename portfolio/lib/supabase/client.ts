// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

// Ambil variabel lingkungan
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Pastikan variabel lingkungan ada
if (!supabaseUrl || !supabaseAnonKey) {
  // Di lingkungan produksi, mungkin lebih baik log error tanpa throw
  // agar build tidak gagal, tapi beri peringatan jelas.
  console.error("Supabase URL or Anon Key is missing from environment variables.");
  // throw new Error("Supabase URL or Anon Key is missing from environment variables.")
}

export function createClient() {
  // Buat client hanya jika URL dan Key ada
  if (!supabaseUrl || !supabaseAnonKey) {
     // Kembalikan null atau throw error tergantung strategi Anda
     console.error("Cannot create Supabase client due to missing env vars.");
     // return null; // Atau throw error
     throw new Error("Cannot create Supabase client due to missing env vars.");
  }
  // Buat client untuk penggunaan di sisi browser ('use client')
  return createBrowserClient(supabaseUrl!, supabaseAnonKey!)
}

// Anda mungkin juga perlu membuat client untuk sisi server jika menggunakan Server Actions/Components
// import { createServerClient, type CookieOptions } from '@supabase/ssr'
// import { cookies } from 'next/headers'
// export function createSupabaseServerClient() { ... }