/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SERVER_URL: string;
    readonly VITE_GOOGLE_CLIENT_ID: string;
    readonly VITE_POSTS_PER_PAGE: number;
    readonly VITE_AI_PROFILE_PICTURE?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
