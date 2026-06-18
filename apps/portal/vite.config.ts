import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
import { buildVersionPlugin } from "./plugins/build-version";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff2}"],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        navigateFallback: "index.html",
      },
      manifest: {
        id: "/",
        name: "La Emperatriz",
        short_name: "Emperatriz",
        description: "Portal de clientas La Emperatriz",
        lang: "es",
        theme_color: "#C8102E",
        background_color: "#F7F7F7",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/favicon.jpeg",
            sizes: "500x500",
            type: "image/jpeg",
            purpose: "any",
          },
          {
            src: "/favicon.jpeg",
            sizes: "500x500",
            type: "image/jpeg",
            purpose: "maskable",
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
    buildVersionPlugin(),
  ],
  server: {
    port: 5174,
    strictPort: true,
  },
  preview: {
    port: 5174,
    strictPort: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
