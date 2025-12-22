/// <reference types="vite/client" />

// CSS module declarations
declare module '*.css' {
    const content: Record<string, string>;
    export default content;
}

declare module '*.css?inline' {
    const content: string;
    export default content;
}

// Environment variables
interface ImportMetaEnv {
    readonly VITE_GEMINI_API_KEY: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
