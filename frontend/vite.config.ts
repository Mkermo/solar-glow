import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// The Laravel backend (API + Filament admin) runs on port 8000 in dev.
// /api and /storage are proxied so the frontend needs no CORS setup in dev.
const BACKEND_URL = process.env.VITE_BACKEND_URL ?? "http://127.0.0.1:8000";

export default defineConfig({
  server: {
    host: true,
    port: 3000,
    proxy: {
      "/api": { target: BACKEND_URL, changeOrigin: true },
      "/storage": { target: BACKEND_URL, changeOrigin: true },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Build straight into Laravel's public/ so one domain serves everything:
    //   /        -> this SPA            /admin -> Filament        /api -> REST API
    // emptyOutDir:false keeps Laravel's own public files (index.php, .htaccess…).
    outDir: path.resolve(__dirname, "../backend/public"),
    emptyOutDir: false,
    assetsDir: "assets",
  },
});
