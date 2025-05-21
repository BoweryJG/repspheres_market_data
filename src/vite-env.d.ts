/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Vite environment variables
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_API_URL?: string;
  
  // React App environment variables (for Netlify compatibility)
  readonly REACT_APP_SUPABASE_URL?: string;
  readonly REACT_APP_SUPABASE_ANON_KEY?: string;
  readonly REACT_APP_API_URL?: string;
  
  // Node environment
  readonly NODE_ENV?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
