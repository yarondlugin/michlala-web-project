/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SERVER_URL: string;
    readonly VITE_GOOGLE_CLIENT_ID: string;
    readonly VITE_POSTS_PER_PAGE: number;
    readonly VITE_COMMENTS_PER_PAGE: number;
    readonly VITE_AI_PROFILE_PICTURE?: string;
    readonly VITE_KEY_PATH: string;
    readonly VITE_CERT_PATH: string;
    readonly VITE_CONFETTI_DURATION_MS: number;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
