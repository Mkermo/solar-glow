import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { generateCspHeader } from "./src/lib/csp";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      host: true,
      port: 3000,
      proxy: {
        // Add proxy for Supabase auth endpoints
        '/auth/v1': {
          target: env.VITE_SUPABASE_URL,
          changeOrigin: true,
          secure: true,
          ws: true,
          rewrite: (path) => path.replace(/^\/auth\/v1/, '/auth/v1'),
          headers: {
            'apikey': env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      },
      cors: {
        origin: true,
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        credentials: true
      }
    },
    plugins: [
      react({
        jsxRuntime: 'automatic',
      }),
      mode === 'development' &&
      componentTagger(),
      {
        name: 'configure-response-headers',
        configureServer: (server) => {
          server.middlewares.use((_req, res, next) => {
            // Add CSP headers
            res.setHeader('Content-Security-Policy', generateCspHeader());
            next();
          });
        },
      },
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      'process.env.SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'process.env.SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY)
    },
    envDir: '.',
  }
});
