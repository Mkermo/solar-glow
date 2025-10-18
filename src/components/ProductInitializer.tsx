import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { createProductsTableDirect, insertSampleProducts, sampleProducts } from '@/lib/productUtils';

export function ProductInitializer() {
  const [hasProducts, setHasProducts] = useState<boolean | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const [tableStatus, setTableStatus] = useState<'checking' | 'exists' | 'missing'>('checking');
  
  useEffect(() => {
    async function checkProducts() {
      try {
        // First check if the products table exists
        const tableCheck = await supabase.rpc('check_table_exists', { table_name: 'products' })
          .catch(err => {
            // If the RPC doesn't exist, handle it gracefully
            console.warn('check_table_exists RPC not found, using fallback');
            return { data: null, error: err };
          });
          
        // If RPC failed or returned false, try direct query to confirm
        if (tableCheck.error || tableCheck.data === false) {
          try {
            const { data, error, count } = await supabase
              .from('products')
              .select('*', { count: 'exact' })
              .limit(1);
              
            if (error) {
              if (error.code === 'PGRST116') {
                // Table doesn't exist
                console.warn('Products table does not exist');
                setTableStatus('missing');
                setHasProducts(false);
                return;
              }
              
              // Other error
              throw error;
            }
            
            // Table exists but might be empty
            setTableStatus('exists');
            setHasProducts(count !== null && count > 0);
          } catch (err) {
            console.error('Error checking products table:', err);
            // Assume table missing on error
            setTableStatus('missing');
            setHasProducts(false);
          }
        } else {
          // RPC worked and confirms table exists
          setTableStatus('exists');
          
          // Now check if it has products
          const { data, error, count } = await supabase
            .from('products')
            .select('*', { count: 'exact' })
            .limit(1);
            
          if (error) {
            console.error('Error checking products count:', error);
            return;
          }
          
          setHasProducts(count !== null && count > 0);
        }
      } catch (err) {
        console.error('Failed to check for products', err);
      }
    }

    checkProducts();
  }, []);

  async function createSampleProducts() {
    setIsCreating(true);
    
    try {
      // First make sure products table exists
      if (tableStatus === 'missing') {
        // Try to create table first
        const createResult = await createProductsTableDirect();
        
        if (!createResult.success) {
          throw new Error(`Failed to create products table: ${createResult.message}`);
        }
        
        toast({
          title: "Products table created",
          description: createResult.message,
          duration: 3000,
        });
        
        // Wait a moment for table to be fully ready
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Now insert sample products
      const result = await insertSampleProducts();
      
      if (!result.success) {
        throw new Error(`Failed to insert sample products: ${result.message}`);
      }
      
      toast({
        title: "Sample products created",
        description: "Sample products were successfully added to the database.",
        duration: 5000,
      });
      
      setHasProducts(true);
      // Force page reload to show new products
      window.location.reload();
      
    } catch (error) {
      console.error('Error creating sample products:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create sample products. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsCreating(false);
    }
  }

  // Function to create products table
  async function createProductsTable() {
    setIsCreating(true);
    
    try {
      // First try direct SQL approach if RPC fails
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
      
      try {
        // Try calling RPC first
        const { error } = await supabase.rpc('create_products_table');
        
        if (error) {
          console.warn('RPC failed, trying direct SQL approach', error);
          throw error;
        }
        
        toast({
          title: "Products table created",
          description: "Products table was successfully created using RPC",
          duration: 3000,
        });
      } catch (rpcErr) {
        // RPC failed, try direct SQL as fallback
        try {
          // Try using stored procedure if available
          const { error: sqlError } = await supabase
            .from('_exec_sql')
            .insert({ sql: createTableSQL });
          
          if (sqlError) {
            toast({
              title: "Error creating table",
              description: "Could not create products table. Please contact your administrator.",
              variant: "destructive",
              duration: 5000,
            });
            return;
          }
          
          toast({
            title: "Products table created",
            description: "Products table was successfully created using SQL",
            duration: 3000,
          });
        } catch (sqlErr) {
          console.error('Failed to create products table via SQL', sqlErr);
          toast({
            title: "Error creating table",
            description: "Could not create products table with either method. Please check Supabase permissions.",
            variant: "destructive",
            duration: 5000,
          });
          return;
        }
      }
      
      // Update state
      setTableStatus('exists');
      setHasProducts(false);
    } catch (err) {
      console.error('Failed to create products table', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Unknown error creating table",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsCreating(false);
    }
  }

  if (hasProducts === null && tableStatus === 'checking') {
    return <div className="text-center py-4">Checking product database...</div>;
  }

  if (hasProducts === true) {
    return null;
  }
  
  if (tableStatus === 'missing') {
    return (
      <Alert className="mb-6 border-yellow-500">
        <AlertTitle>Products table missing</AlertTitle>
        <AlertDescription>
          The products table does not exist in your database. Would you like to create it?
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            <Button 
              onClick={createProductsTable} 
              disabled={isCreating}
              className="bg-yellow-500 hover:bg-yellow-600"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Table...
                </>
              ) : (
                'Create Products Table'
              )}
            </Button>
            
            <Button 
              onClick={createSampleProducts}
              disabled={isCreating}
              variant="outline"
            >
              Force Direct Product Creation
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="mb-6">
      <AlertTitle>No products found</AlertTitle>
      <AlertDescription>
        Your product catalog is empty. Would you like to create some sample products?
        <div className="mt-4">
          <Button 
            onClick={createSampleProducts} 
            disabled={isCreating}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Sample Products'
            )}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}