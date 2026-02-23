import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isValidUrl = (urlString: string) => {
  try { 
    return Boolean(new URL(urlString)); 
  }
  catch(e){ 
    return false; 
  }
}

const urlToUse = isValidUrl(supabaseUrl) ? supabaseUrl : 'https://placeholder.supabase.co';
const keyToUse = supabaseAnonKey || 'placeholder';

export const supabase = createClient(urlToUse, keyToUse);

if (!isValidUrl(supabaseUrl) || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials missing or invalid. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the Secrets panel.');
}
