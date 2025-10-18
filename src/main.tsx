import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

if (import.meta.env.DEV) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  console.log('[Supabase] URL:', supabaseUrl ?? 'undefined');

  if (supabaseAnonKey) {
    console.log('[Supabase] anon key (first 8 chars):', `${supabaseAnonKey.slice(0, 8)}…`);
  } else {
    console.warn('[Supabase] anon key is undefined');
  }
}

createRoot(document.getElementById("root")!).render(<App />);
