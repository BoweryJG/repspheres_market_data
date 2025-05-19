// Declare the Deno global to suppress errors
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

// Declare module types for external dependencies
declare module 'https://deno.land/std@0.177.0/http/server.ts' {
  export interface ServeInit {
    port?: number;
    hostname?: string;
    handler: (request: Request) => Response | Promise<Response>;
    onError?: (error: unknown) => Response | Promise<Response>;
    signal?: AbortSignal;
  }

  export type Handler = (request: Request) => Response | Promise<Response>;

  export function serve(
    handler: Handler | ServeInit, 
    options?: Omit<ServeInit, 'handler'>
  ): void;
}

declare module 'https://esm.sh/@supabase/supabase-js@2.21.0' {
  export interface SupabaseClientOptions {
    auth?: {
      autoRefreshToken?: boolean;
      persistSession?: boolean;
      detectSessionInUrl?: boolean;
    };
    global?: {
      headers?: Record<string, string>;
      fetch?: typeof fetch;
    };
  }

  export interface SupabaseClient {
    from: (table: string) => any;
    auth: any;
    storage: any;
    rpc: (fn: string, params?: any) => any;
  }

  export function createClient(
    supabaseUrl: string,
    supabaseKey: string,
    options?: SupabaseClientOptions
  ): SupabaseClient;
}
