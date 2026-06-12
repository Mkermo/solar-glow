import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug configuration
console.log('Initializing Supabase with:', {
  url: supabaseUrl,
  keyExists: !!supabaseKey
});

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    storageKey: 'supabase-auth',
    storage: window.localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: false // Disable automatic URL detection
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

export default supabase;