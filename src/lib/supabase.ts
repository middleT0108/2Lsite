import { createClient } from '@supabase/supabase-js';

// Lấy URL và key từ biến môi trường
// CHÚ Ý: Chỉ dùng anon key ở frontend, KHÔNG BAO GIỜ dùng service role key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Thiếu biến môi trường VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY');
}

// Khởi tạo Supabase client với cấu hình auth
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
