import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";


export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: "ow-chatbot.js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
              return 'ow-chatbot.css'; 
          }
          return 'assets/[name].[hash][extname]';
      }
      },
    },
  },
});
