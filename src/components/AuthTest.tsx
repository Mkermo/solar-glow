import { useEffect } from 'react';
import supabase from '../supabaseClient';

export default function AuthTest() {
  useEffect(() => {
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Auth Error:', error.message);
          return;
        }
        console.log('Auth Status:', data);
      } catch (err) {
        console.error('Connection Error:', err);
      }
    };

    testConnection();
  }, []);

  return <div>Check console for auth status</div>;
}