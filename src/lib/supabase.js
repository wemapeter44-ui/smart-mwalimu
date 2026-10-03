import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yrvzwgfnowastmprvpgo.supabase.co';
const supabaseKey = 'sb_publishable_-yr8PYBr-Oh4nUTG3CMcnQ_uO2KnYPv';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});