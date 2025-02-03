import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';

export default defineConfig({
    plugins: [
		TanStackRouterVite({ autoCodeSplitting: true }),
		react(),
	],
    server: {
        port: 5173,
    },
});
