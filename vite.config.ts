import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// Dev server runs at "/"; production build is served from
// https://<user>.github.io/drugaway/.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/drugaway/" : "/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon-192.png", "icon-512.png"],
      // scope + start_url are derived from `base` by the plugin.
      manifest: {
        name: "drugaway",
        short_name: "drugaway",
        description: "Track days clean and pause before a relapse.",
        theme_color: "#0f172a",
        background_color: "#0f172a",
        display: "standalone",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
}));
