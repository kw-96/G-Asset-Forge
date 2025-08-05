// Simplified Fabric.js type declarations to avoid conflicts
declare module 'fabric' {
  export const fabric: any;
}

// Global fabric types
declare global {
  const fabric: unknown;
}