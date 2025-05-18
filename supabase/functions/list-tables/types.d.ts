// Declare the Deno global to suppress errors
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

// Add any other necessary type declarations here
