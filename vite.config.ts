import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
    base: './',
    publicDir: 'assets',
    build: {
        outDir: 'dist',
        assetsDir: '',
        chunkSizeWarningLimit: 2048,
        copyPublicDir: true,
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, '.'),
        },
    },
});
