import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://mwfiwcgiqmonsxdoiocc.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_4kMaqiHygwebdse9YUrc8Q_VlqG0zK9';

export const hasSupabaseConfig = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = hasSupabaseConfig
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
