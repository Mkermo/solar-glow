// Direct product table creation utility
// This is a last-resort approach when Supabase RPCs and SQL execution fail

import { supabase } from '@/lib/supabase';

// Function to try creating products table using direct API calls
export async function createProductsTableDirect() {
  try {
    // Check if table exists first
    try {
      const { data, error, count } = await supabase
        .from('products')
        .select('*', { count: 'exact' })
        .limit(1);
        
      if (!error) {
        console.log('Products table already exists');
        return { success: true, message: 'Table already exists' };
      }
    } catch (e) {
      // Table doesn't exist, continue with creation
      console.log('Table check failed, continuing with creation:', e);
    }
    
    // Try to create the table using Supabase management API
    // Note: This requires special permissions and may not work in all environments
    
    // Option 1: Using supabase.rpc() with a custom SQL function
    try {
      console.log('Attempting to create table using RPC...');
      const { error: rpcError } = await supabase.rpc('create_products_table');
      if (!rpcError) {
        return { success: true, message: 'Table created using RPC' };
      } else {
        console.warn('RPC table creation failed:', rpcError);
      }
    } catch (rpcErr) {
      console.warn('RPC table creation error:', rpcErr);
    }
    
    // Option 2: Try SQL injection via function (this is a hack but might work)
    try {
      console.log('Attempting direct SQL table creation...');
      
      // First try using a SQL function if it exists
      const sqlCreateFunction = `
        select exists (
          select 1 from pg_proc 
          where proname = 'exec_sql' 
          and pronamespace = (select oid from pg_namespace where nspname = 'public')
        ) as exists;
      `;
      
      const { data: fnExists, error: fnCheckError } = await supabase.rpc('exec_sql', { sql: sqlCreateFunction });
      
      if (!fnCheckError && fnExists) {
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS public.products (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            price DECIMAL(10, 2) NOT NULL,
            image_url TEXT,
            category TEXT,
            stock INTEGER DEFAULT 0,
            features TEXT[] DEFAULT '{}'::TEXT[]
          );
        `;
        
        const { error: sqlExecError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
        
        if (!sqlExecError) {
          return { success: true, message: 'Table created using SQL function' };
        }
        
        console.warn('SQL function execution failed:', sqlExecError);
      }
    } catch (sqlErr) {
      console.warn('SQL table creation attempt failed:', sqlErr);
    }
    
    // Option 3: POST to Supabase's REST API (this is a fallback and requires special permissions)
    try {
      console.log('Attempting REST API table creation...');
      const response = await fetch('https://ketesbnrumxbvwuaqefa.supabase.co/rest/v1/rpc/create_products_table', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtldGVzYm5ydW14YnZ3dWFxZWZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NDg1ODcsImV4cCI6MjA2MjUyNDU4N30._E9BrV3rNrzz-cDvbUoyUkbcuhW-95rDANA2nnheEFc",
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtldGVzYm5ydW14YnZ3dWFxZWZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NDg1ODcsImV4cCI6MjA2MjUyNDU4N30._E9BrV3rNrzz-cDvbUoyUkbcuhW-95rDANA2nnheEFc"}`
        },
        body: JSON.stringify({})
      });
      
      if (response.ok) {
        return { success: true, message: 'Table created using REST API' };
      } else {
        console.warn(`REST API error: ${response.status} ${response.statusText}`);
      }
    } catch (restErr) {
      console.error('REST API attempt failed:', restErr);
    }
    
    return { success: false, message: 'All creation attempts failed' };
  } catch (err) {
    console.error('Failed to create products table:', err);
    return { success: false, message: err instanceof Error ? err.message : 'Unknown error' };
  }
}

// Sample products data for initializing the database
export const sampleProducts = [
  {
    name: 'Monocrystalline Solar Panel - 400W',
    description: 'High-efficiency monocrystalline solar panel with 21% conversion efficiency',
    price: 299.99,
    image_url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    category: 'panels',
    stock: 15,
    features: ['21% efficiency', 'Weather resistant', '25-year warranty']
  },
  {
    name: 'Lithium Battery Storage - 5kWh',
    description: 'High-capacity lithium battery for solar energy storage with built-in BMS',
    price: 2499.99,
    image_url: 'https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    category: 'storage',
    stock: 8,
    features: ['5kWh capacity', 'Smart BMS', '10-year warranty', 'Compact design']
  },
  {
    name: 'MPPT Charge Controller - 60A',
    description: 'Advanced MPPT charge controller for optimal solar charging efficiency',
    price: 349.99,
    image_url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    category: 'components',
    stock: 20,
    features: ['60A rating', 'Multiple charging profiles', 'LCD display', 'Bluetooth connectivity']
  },
  {
    name: 'Off-Grid Inverter - 3000W',
    description: 'Pure sine wave inverter for off-grid solar systems',
    price: 799.99,
    image_url: 'https://images.unsplash.com/photo-1605980413173-11c3d6a47a8f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    category: 'inverters',
    stock: 12,
    features: ['3000W continuous power', 'Pure sine wave', 'Built-in transfer switch', 'LCD display']
  },
  {
    name: 'Grid-Tied Inverter - 5kW',
    description: 'High-efficiency grid-tied inverter for residential solar systems',
    price: 1299.99,
    image_url: 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    category: 'inverters',
    stock: 10,
    features: ['5kW rated output', '98% efficiency', 'WiFi monitoring', 'Multiple MPPT inputs']
  },
  {
    name: 'Solar Panel Mounting System',
    description: 'Complete mounting kit for roof or ground installation of solar panels',
    price: 199.99,
    image_url: 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    category: 'accessories',
    stock: 25,
    features: ['Adjustable angle', 'Corrosion-resistant', 'Easy installation', 'Wind resistance up to 150mph']
  }
];

// Insert sample products
export async function insertSampleProducts() {
  try {
    const { error } = await supabase.from('products').insert(sampleProducts);
    
    if (error) {
      throw error;
    }
    
    return { success: true, message: 'Sample products created' };
  } catch (err) {
    console.error('Error creating sample products:', err);
    return { success: false, message: err instanceof Error ? err.message : 'Unknown error' };
  }
}