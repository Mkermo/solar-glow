import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// The Laravel backend (API + Filament admin) runs on port 8000.
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
});
