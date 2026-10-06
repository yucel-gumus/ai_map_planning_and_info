/// <reference types="vite/client" />

declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

declare module '*.css?inline' {
  const content: string;
  export default content;
}

interface ImportMetaEnv {
  /** Optional absolute site base; empty = same-origin /api/generate-map */
  readonly VITE_API_BASE_URL?: string;
  /** Absolute gateway URL for direct client calls (e.g. /api/maps/config) */
  readonly VITE_API_URL?: string;
  /** Client API key sent as X-API-Key on direct gateway calls */
  readonly VITE_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}