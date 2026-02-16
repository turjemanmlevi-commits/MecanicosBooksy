import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pjwucakxqubrvbuzvidn.supabase.co';
const supabaseKey = 'sb_publishable__FgRx0gwyqc-YypwsuHNpA_Q9GqzwuF';

export const supabase = createClient(supabaseUrl, supabaseKey);
