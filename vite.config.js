import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// Allows users to install your app on their homescreens
const manifestForPlugin = {
  registerType: "autoUpdate",
  includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.png"],
  // injectRegister: "auto",
  manifest: {
    name: "Todo & Habit Tracker",
    short_name: "Dobit App",
    description: "Track your daily tasks and build better habits",
    theme_color: "#ffffff",
    background_color: "#ffffff",
    display: "standalone",
    scope: "/",
    start_url: "/",
    orientation: "portrait",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "favicon",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "apple touch icon",
      },
      {
        src: "/maskable_icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
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
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), VitePWA({ manifestForPlugin })],
});
