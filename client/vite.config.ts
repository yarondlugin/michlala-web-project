import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import mkcert from 'vite-plugin-mkcert';
import fs from 'fs';

export default defineConfig(({ mode, isPreview }) => {
    const plugins = [TanStackRouterVite({ autoCodeSplitting: true }), react()];
    const env = loadEnv(mode, process.cwd(), '');

    return {
        plugins: [...plugins, !isPreview ? mkcert() : undefined],
        server: {
            port: 5173,
            https: {
                key: fs.readFileSync(env.VITE_KEY_PATH ?? ''),
                cert: fs.readFileSync(env.VITE_CERT_PATH ?? ''),
            },
        },
    };
});
