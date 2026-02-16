import { createClient } from '@supabase/supabase-js';

// Switching to the project where Google Auth is already configured
const URL = 'https://ogppbgxtjkrmbtuxizcy.supabase.co';
const KEY = 'sb_publishable_zPF421AO_kGBFJkR28L8uA_ca1QB0EJ';

export const supabase = createClient(URL, KEY);
