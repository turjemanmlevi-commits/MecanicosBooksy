import { createClient } from '@supabase/supabase-js';

// Use environment variables from Vite, with fallbacks for production robustness
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pjwucakxqubrvbuzvidn.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable__FgRx0gwyqc-YypwsuHNpA_Q9GqzwuF';

export const supabase = createClient(supabaseUrl, supabaseKey);
