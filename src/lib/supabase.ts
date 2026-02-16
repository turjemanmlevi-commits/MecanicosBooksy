import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ogppbgxtjkrmbtuxizcy.supabase.co';
const supabaseKey = 'sb_publishable_zPF421AO_kGBFJkR28L8uA_ca1QB0EJ';

export const supabase = createClient(supabaseUrl, supabaseKey);
