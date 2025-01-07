import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Todo & Habit Tracker",
        short_name: "TodoTracker",
        description: "Track your daily tasks and build better habits",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        shortcuts: [
          {
            name: "Add Task",
            short_name: "Add",
            description: "Add a new task",
            url: "/?action=new",
            icons: [{ src: "/add-task.png", sizes: "192x192" }],
          },
          {
            name: "Statistics",
            short_name: "Stats",
            description: "View your progress",
            url: "/stats",
            icons: [{ src: "/stats.png", sizes: "192x192" }],
          },
        ],
        share_target: {
          action: "/?share-target",
          method: "POST",
          enctype: "multipart/form-data",
          params: {
            title: "name",
            text: "description",
          },
        },
      },
    }),
  ],
});
