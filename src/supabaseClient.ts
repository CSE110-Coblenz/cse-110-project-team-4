import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log("[Supabase] URL =", supabaseUrl);
console.log("[Supabase] Anon key prefix =", supabaseAnonKey?.slice(0, 8));

export const supabase = (
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null
) as any 
