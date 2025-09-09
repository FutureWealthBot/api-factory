import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'dist',
        emptyOutDir: true,
    },
    server: {
        host: '0.0.0.0',
        port: 5176,
        strictPort: false,
        proxy: {
            '/tiers': 'http://localhost:3000',
            '/marketplace': 'http://localhost:3000',
            '/billing': 'http://localhost:3000',
            '/sdk-templates': 'http://localhost:3000',
            // Add more API routes as needed
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './'),
        },
    },
});
