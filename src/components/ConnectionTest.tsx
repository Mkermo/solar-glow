import { useEffect, useState } from 'react';
import { checkSupabaseConnection } from '../lib/supabase';

const RETRY_COUNT = 3;
const RETRY_DELAY = 2000; // 2 seconds

export function ConnectionTest() {
  const [status, setStatus] = useState('Testing connection...');
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    const testWithRetry = async () => {
      try {
        setStatus(`Attempt ${attempts + 1}/${RETRY_COUNT}...`);
        const result = await checkSupabaseConnection();

        if (result.connected) {
          setStatus('Connected! ✅');
          setError(null);
        } else {
          if (attempts < RETRY_COUNT - 1) {
            setAttempts((prev) => prev + 1);
            setTimeout(testWithRetry, RETRY_DELAY);
          } else {
            setStatus('Connection failed ❌');
            setError(result.details);
          }
        }
      } catch (err) {
        setStatus('Error');
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    testWithRetry();
  }, [attempts]);

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <div className="font-semibold mb-2">Connection Status: {status}</div>
      {error && (
        <div className="text-red-500 mt-2 text-sm">
          Error Details: {error}
        </div>
      )}
    </div>
  );
}
