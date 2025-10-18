import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL. Add it to your environment configuration.');
}

if (!supabaseKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY. Add it to your environment configuration.');
}

// Create and export a single instance of the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    // Ensure we stay CSP friendly
    fetch: (...args) => fetch(...args),
  },
});

// Expose helpers for diagnostics (avoids leaking full anon key in logs)
export const SUPABASE_URL = () => supabaseUrl;
export const SUPABASE_ANON_KEY = () => `${supabaseKey.slice(0, 8)}...`;

// Debug function to test connection
export const testConnection = async () => {
  try {
    const { error } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .limit(1);

    if (error) throw error;
    console.log('Supabase connection test succeeded');
    return true;
  } catch (err) {
    console.error('Supabase connection test failed:', err);
    return false;
  }
};

export const checkProductsTable = async () => {
  try {
    // First, check if the table exists using system tables
    const { data: tableExists, error: tableError } = await supabase
      .rpc('check_table_exists', { table_name: 'products' });

    if (tableError) {
      console.log('Could not run check_table_exists RPC, trying alternative check');

      // Attempt to query the products table
      const { error } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .limit(1);

      if (error) {
        if (error.code === 'PGRST116') {
          // Table doesn't exist (not found)
          return { exists: false, reason: 'Table does not exist' };
        }

        if (error.code === '42501' || /permission/i.test(error.message ?? '') || /row-level security/i.test(error.message ?? '')) {
          // Table exists but the current key is not allowed to access it
          return { exists: true, reason: `Permission error: ${error.message}` };
        }

        return { exists: false, reason: error.message };
      }

      // If we got here, the table exists
      return { exists: true };
    }

    // If the RPC worked, use its result
    return { exists: !!tableExists };
  } catch (err) {
    console.error('Error checking products table:', err);
    return { exists: false, reason: err instanceof Error ? err.message : 'Unknown error' };
  }
};

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
      url: supabaseUrl ?? 'unknown'
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
