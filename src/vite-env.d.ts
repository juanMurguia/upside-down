/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APPLE_MUSIC_TOKEN?: string;
  readonly VITE_APPLE_MUSIC_STOREFRONT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
