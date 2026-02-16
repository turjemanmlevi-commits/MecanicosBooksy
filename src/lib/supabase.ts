import { createClient } from '@supabase/supabase-js';

// Hardcoded values as primary to ensure it always works, environment variables as override if present
const DEFAULT_URL = 'https://pjwucakxqubrvbuzvidn.supabase.co';
const DEFAULT_KEY = 'sb_publishable__FgRx0gwyqc-YypwsuHNpA_Q9GqzwuF';

let supabaseUrl = DEFAULT_URL;
let supabaseKey = DEFAULT_KEY;

try {
    // @ts-ignore - Safe access in Vite
    if (typeof import.meta !== 'undefined' && import.meta.env) {
        supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_URL;
        supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_KEY;
    }
} catch (e) {
    console.warn('Could not access environment variables, using fallbacks');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
