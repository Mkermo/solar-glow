import { createClient } from '@supabase/supabase-js';

// Try to get from environment variables first
let supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
let supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// If environment variables are not available, use hardcoded values
if (!supabaseUrl || !supabaseKey) {
  console.warn('Using fallback Supabase credentials. Environment variables not loaded properly.');
  supabaseUrl = "https://ketesbnrumxbvwuaqefa.supabase.co";
  supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtldGVzYm5ydW14YnZ3dWFxZWZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NDg1ODcsImV4cCI6MjA2MjUyNDU4N30._E9BrV3rNrzz-cDvbUoyUkbcuhW-95rDANA2nnheEFc";
}

// Create a single instance of the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Debug function to test connection
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, name')
      .limit(1);

    if (error) throw error;
    console.log('Supabase connection test:', data);
    return true;
  } catch (err) {
    console.error('Supabase connection test failed:', err);
    return false;
  }
};

// Run connection test
testConnection();

export const checkSupabaseConnection = async () => {
  try {
    // Try a simpler health check first
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Auth check failed:', error);
      return { 
        connected: false, 
        error,
        details: `Auth check failed: ${error.message}`
      };
    }

    return { connected: true, data };
  } catch (err) {
    console.error('Connection error:', {
      message: err instanceof Error ? err.message : 'Unknown error',
      url: supabaseUrl
    });
    
    return { 
      connected: false, 
      error: err,
      details: 'Connection failed - please check your network connection'
    };
  }
};

export const fetchProduct = async (id: string) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};
