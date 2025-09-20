/* eslint-disable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-explicit-any */
declare module 'chokidar' {
  interface WatchOptions {}
  function watch(paths: string | string[], options?: WatchOptions): any;
  export default { watch };
}

declare module 'mime' {
  export function getType(path: string): string | null;
  export function getExtension(mimeType: string): string | null;
  const types: { getType: typeof getType; getExtension: typeof getExtension };
  export default types;
}

// Minimal global shims for optional Fastify plugins imported dynamically.
declare module '@fastify/swagger';
declare module '@fastify/swagger-ui';
declare module '@fastify/static';

// Provide a minimal JSX namespace to satisfy isolated TS projects that
// may not automatically include the react-jsx runtime types in certain build contexts.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
