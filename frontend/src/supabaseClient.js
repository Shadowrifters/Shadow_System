// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_AUTH_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_AUTH_URL and VITE_SUPABASE_ANON_KEY must be set in your environment');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
