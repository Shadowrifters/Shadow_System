import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabasePerformanceUrl = process.env.SUPABASE_PERFORMANCE_URL;
const supabasePerformanceKey = process.env.SUPABASE_PERFORMANCE_KEY;

console.log("SUPABASE_PERFORMANCE_URL:", supabasePerformanceUrl);
console.log("SUPABASE_PERFORMANCE_KEY:", supabasePerformanceKey);

if (!supabasePerformanceUrl) throw new Error('SUPABASE_PERFORMANCE_URL is required.');
if (!supabasePerformanceKey) throw new Error('SUPABASE_PERFORMANCE_KEY is required.');

export const supabasePerformance = createClient(supabasePerformanceUrl, supabasePerformanceKey, {
  auth: {
    persistSession: false,
  },
});
