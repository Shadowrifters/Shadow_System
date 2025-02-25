// server/supabaseAuthClient.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseAuthUrl = process.env.SUPABASE_AUTH_URL;
const supabaseAuthKey = process.env.SUPABASE_AUTH_KEY;

if (!supabaseAuthUrl) throw new Error('SUPABASE_AUTH_URL is required.');
if (!supabaseAuthKey) throw new Error('SUPABASE_AUTH_KEY is required.');

export const supabaseAuth = createClient(supabaseAuthUrl, supabaseAuthKey, {
  auth: {
    persistSession: true,
  },
});
