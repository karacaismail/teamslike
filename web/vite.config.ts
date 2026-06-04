import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  // Base path. Local dev = "/"; GitHub Pages serves under /<repo>/, so the
  // deploy workflow sets VITE_BASE="/<repo>/". The router reads import.meta.env.BASE_URL.
  base: process.env.VITE_BASE || "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  server: { port: 5173 },
  build: {
    rollupOptions: {
      output: {
        // Vendor split. Icons live in one cacheable chunk: the app uses ~181
        // Phosphor icons, each shipping 6 weight variants (~535kB / ~119kB gzip)
        // — that's inherent, not a tree-shaking miss. Icons are imported only via
        // "@/lib/icons" (per-icon deep paths), so this stays one predictable file
        // instead of ~181 micro-chunks. Function form keeps it tree-shaken.
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("@phosphor-icons")) return "vendor-icons";
          if (id.includes("@radix-ui")) return "vendor-radix";
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id))
            return "vendor-react";
          if (/[\\/]node_modules[\\/](@tanstack[\\/]react-query|zustand|i18next|react-i18next)[\\/]/.test(id))
            return "vendor-data";
          return undefined;
        },
      },
    },
  },
});
