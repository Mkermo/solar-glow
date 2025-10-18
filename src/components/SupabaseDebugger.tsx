import React, { useState, useEffect } from 'react';
import { supabase, checkSupabaseConnection } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RotateCw } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';

/**
 * A debug component to diagnose Supabase connection issues
 */
export function SupabaseDebugger() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [error, setError] = useState<any>(null);
  const [dbTables, setDbTables] = useState<string[]>([]);
  const [productCount, setProductCount] = useState<number | null>(null);
  const [hasRls, setHasRls] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [rpcStatus, setRpcStatus] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();

  useEffect(() => {
    checkConnection();
  }, []);

  // Check if the required RPCs exist
  const checkRpcs = async () => {
    try {
      const rpcsToCheck = ['check_table_exists', 'create_products_table'];
      const results: {[key: string]: boolean} = {};
      
      for (const rpcName of rpcsToCheck) {
        try {
          // We're just testing if the RPC exists, so we'll use dummy params
          await supabase.rpc(rpcName, rpcName === 'check_table_exists' ? { table_name: 'dummy' } : {});
          results[rpcName] = true;
        } catch (err) {
          // Check if the error is because the RPC doesn't exist
          const error = err as any;
          results[rpcName] = !(error?.message?.includes('function') && error?.message?.includes('does not exist'));
        }
      }
      
      setRpcStatus(results);
      return results;
    } catch (err) {
      console.error('Failed to check RPCs:', err);
      return {};
    }
  };

  const checkConnection = async () => {
    try {
      setChecking(true);
      setConnectionStatus('checking');
      setError(null);
      
      // Basic connection test
      const result = await checkSupabaseConnection();
      
      if (!result.connected) {
        console.error('Connection test failed:', result);
        setConnectionStatus('error');
        setError(result.details || 'Connection failed. Check console for details.');
        setChecking(false);
        return;
      }
      
      // Check RPCs
      await checkRpcs();
      
      // Check RPCs
      const rpcsResult = await checkRpcs();
      
      // Try to get database schema to check permissions
      const { data: tablesData, error: tablesError } = await supabase
        .from('pg_catalog.pg_tables')
        .select('tablename')
        .eq('schemaname', 'public');
        
      if (tablesError) {
        // If this fails, it's likely an RLS issue
        console.log('Could not list tables - this is normal with RLS:', tablesError);
        setHasRls(true);
      } else {
        setHasRls(false);
        if (tablesData) {
          setDbTables(tablesData.map(t => t.tablename));
        }
      }
      
      // Specifically check products table
      const { data: productsData, error: productsError, count } = await supabase
        .from('products')
        .select('*', { count: 'exact' })
        .limit(1);
        
      if (productsError) {
        if (productsError.code === 'PGRST116') {
          // Table doesn't exist
          setError(`Table 'products' does not exist. Please create the table first.`);
          setConnectionStatus('error');
        } else {
          setError(productsError.message);
          setConnectionStatus('error');
        }
      } else {
        setConnectionStatus('connected');
        setProductCount(count);
      }
    } catch (err) {
      console.error('Connection check failed:', err);
      setConnectionStatus('error');
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setChecking(false);
    }
  };
  
  const createProductsTable = async () => {
    try {
      setChecking(true);
      const { error } = await supabase.rpc('create_products_table');
      
      if (error) {
        setError(`Failed to create products table: ${error.message}`);
        return;
      }
      
      await checkConnection();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error during table creation');
    } finally {
      setChecking(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Supabase Connection Debug
          <Badge variant={
            connectionStatus === 'connected' ? 'success' : 
            connectionStatus === 'error' ? 'destructive' : 
            'outline'
          }>
            {connectionStatus === 'connected' ? 'Connected' : 
             connectionStatus === 'error' ? 'Error' : 
             'Checking...'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-1">Connection Status:</h3>
            <p className={
              connectionStatus === 'connected' ? 'text-green-600' :
              connectionStatus === 'error' ? 'text-red-600' :
              'text-yellow-600'
            }>
              {connectionStatus === 'connected' ? 'Successfully connected to Supabase' :
               connectionStatus === 'error' ? 'Failed to connect to Supabase' :
               'Checking connection...'}
            </p>
          </div>
          
          {error && (
            <div>
              <h3 className="font-medium mb-1 text-red-600">Error:</h3>
              <pre className="bg-red-50 p-3 rounded text-red-800 text-sm overflow-auto max-h-40">
                {typeof error === 'object' ? JSON.stringify(error, null, 2) : error}
              </pre>
            </div>
          )}
          
          {connectionStatus === 'connected' && (
            <>
              <div>
                <h3 className="font-medium mb-1">Products:</h3>
                <p>Found {productCount === null ? '?' : productCount} products in database</p>
              </div>
              
              {hasRls === false && dbTables.length > 0 && (
                <div>
                  <h3 className="font-medium mb-1">Available Tables:</h3>
                  <div className="flex flex-wrap gap-1">
                    {dbTables.map(table => (
                      <Badge key={table} variant="outline">{table}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {hasRls === true && (
                <div className="text-yellow-600">
                  <p>Row Level Security is enabled. Limited table visibility is normal.</p>
                </div>
              )}
            </>
          )}
          <div>
            <h3 className="font-medium mb-1">Required Database Functions:</h3>
            <div className="grid grid-cols-1 gap-2 mt-2">
              <div className="flex items-center justify-between border p-2 rounded">
                <span>check_table_exists</span>
                <Badge variant={rpcStatus['check_table_exists'] ? 'success' : 'destructive'}>
                  {rpcStatus['check_table_exists'] ? 'Available' : 'Missing'}
                </Badge>
              </div>
              <div className="flex items-center justify-between border p-2 rounded">
                <span>create_products_table</span>
                <Badge variant={rpcStatus['create_products_table'] ? 'success' : 'destructive'}>
                  {rpcStatus['create_products_table'] ? 'Available' : 'Missing'}
                </Badge>
              </div>
            </div>
          </div>

          {(!rpcStatus['check_table_exists'] || !rpcStatus['create_products_table']) && (
            <Alert>
              <AlertTitle>Missing Database Functions</AlertTitle>
              <AlertDescription>
                Some required database functions are missing. These are needed to properly initialize the products table.
                If you have admin rights, you can create these functions directly in the Supabase dashboard or contact your administrator.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Button 
          onClick={checkConnection} 
          disabled={checking}
          variant="outline"
        >
          {checking ? (
            <>
              <RotateCw className="mr-2 h-4 w-4 animate-spin" /> Checking
            </>
          ) : (
            'Test Connection'
          )}
        </Button>
        
        {connectionStatus === 'error' && (
          <Button 
            onClick={createProductsTable}
            disabled={checking}
            variant="default"
          >
            Create Products Table
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}