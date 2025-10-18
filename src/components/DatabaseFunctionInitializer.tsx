import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export const DatabaseFunctionInitializer = () => {
  const [status, setStatus] = useState<'checking' | 'missing' | 'complete'>('checking');
  const [message, setMessage] = useState('Checking database functions...');
  const [details, setDetails] = useState<string[]>([]);

  // Define required functions
  const requiredFunctions = [
    'check_table_exists',
    'get_table_columns',
    'initialize_products_table',
    'check_product_stock',
  ];

  // Check if database functions exist
  const checkDatabaseFunctions = async () => {
    setStatus('checking');
    setMessage('Checking database functions...');
    setDetails([]);

    try {
      // Check for each function
      const missingFunctions = [];
      
      for (const funcName of requiredFunctions) {
        try {
          // Try to run the function with some basic parameter
          // For check_table_exists, we'll check if the products table exists
          if (funcName === 'check_table_exists') {
            await supabase.rpc('check_table_exists', { table_name: 'products' });
            setDetails(prev => [...prev, `✅ Found function: ${funcName}`]);
          } else {
            // Skip checking other functions if we can't call check_table_exists
            // This is a sign that we need to create all functions
            missingFunctions.push(funcName);
          }
        } catch (err) {
          setDetails(prev => [...prev, `❌ Missing function: ${funcName}`]);
          missingFunctions.push(funcName);
        }
      }
      
      if (missingFunctions.length > 0) {
        setStatus('missing');
        setMessage(`Missing ${missingFunctions.length} required database functions`);
      } else {
        setStatus('complete');
        setMessage('All required database functions are present');
      }
    } catch (error) {
      console.error('Error checking database functions:', error);
      setStatus('missing');
      setMessage('Error checking database functions');
      setDetails(prev => [...prev, `Error: ${error instanceof Error ? error.message : String(error)}`]);
    }
  };

  useEffect(() => {
    checkDatabaseFunctions();
  }, []);

  return (
    <div className="space-y-4 my-4">
      <Alert variant={status === 'complete' ? 'default' : 'destructive'}>
        <AlertTitle className="flex items-center gap-2">
          {status === 'checking' ? (
            <AlertCircle className="h-4 w-4" />
          ) : status === 'complete' ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          {message}
        </AlertTitle>
        <AlertDescription>
          {details.length > 0 && (
            <div className="mt-2 text-xs font-mono bg-muted p-2 rounded">
              {details.map((detail, i) => (
                <div key={i}>{detail}</div>
              ))}
            </div>
          )}
        </AlertDescription>
      </Alert>

      <div className="flex gap-2">
        <Button 
          size="sm"
          variant="secondary"
          onClick={checkDatabaseFunctions}
        >
          Check Again
        </Button>
        
        <a 
          href="/sql/create-database-functions.sql" 
          download="create-database-functions.sql"
          className="inline-block"
        >
          <Button size="sm">
            Download SQL Fix
          </Button>
        </a>
      </div>
      
      <div className="text-sm text-muted-foreground mt-4">
        <p>To fix this issue:</p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Download the SQL fix above</li>
          <li>Go to <a href="https://app.supabase.com" target="_blank" rel="noopener" className="text-primary underline">Supabase Dashboard</a></li>
          <li>Open SQL Editor</li>
          <li>Paste the SQL and click Run</li>
          <li>Return here and click "Check Again"</li>
        </ol>
      </div>
    </div>
  );
};