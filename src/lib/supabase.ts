import { createClient } from '@supabase/supabase-js';

// Define the production URL and Key directly as constants
// This ensures that even if Vite env variables fail to load, the app has a working connection
const URL = 'https://pjwucakxqubrvbuzvidn.supabase.co';
const KEY = 'sb_publishable__FgRx0gwyqc-YypwsuHNpA_Q9GqzwuF';

// Create the client using hardcoded values (standard practice for public anon keys in Motobox)
export const supabase = createClient(URL, KEY);
