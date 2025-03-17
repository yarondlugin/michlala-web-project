import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig({
    plugins: [TanStackRouterVite({ autoCodeSplitting: true }), mkcert(), react()],
    server: {
        port: 5173,
		https: true,
    },
});
