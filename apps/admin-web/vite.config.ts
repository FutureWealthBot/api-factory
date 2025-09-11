import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: (() => {
      const adminApiUrl = process.env.ADMIN_API_URL || 'http://localhost:5178';
      return {
        '/_api': { target: adminApiUrl, changeOrigin: true },
        '/api': { target: adminApiUrl, changeOrigin: true },
      };
    })(),
  }
  ,
  build: {
    target: 'es2022',
    modulePreload: { polyfill: false },
    cssMinify: true,
    sourcemap: false
  },
  esbuild: {
    legalComments: 'none'
  }
});
