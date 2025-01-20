import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    "process.env": {}, // Polyfill process.env in the browser
  },
  build: {
    lib: {
      entry: "src/main.jsx", // Path to your main entry file
      name: "SearchWidget",
      fileName: "widget",
      formats: ["iife"], // Immediately Invoked Function Expression
    },
  },
});
