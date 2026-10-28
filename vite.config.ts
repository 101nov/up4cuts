import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      includeAssets: ["favicon.ico"],

      manifest: {
        name: "UP4cuts - Korean Photo Booth",
        short_name: "UP4cuts",
        description: "Korean 4-cut photo booth at UP Diliman",

        start_url: "/",
        scope: "/",
        display: "standalone",

        background_color: "#faf7f5",
        theme_color: "#e65b79",

        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },

      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],

        navigateFallback: "/index.html",
      },
    }),
  ],

  server: {
    host: "0.0.0.0",
    allowedHosts: [".trycloudflare.com"],
  },
});