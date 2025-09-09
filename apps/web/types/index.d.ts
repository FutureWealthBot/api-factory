declare module 'chokidar' {
  // conservative, minimal shape for WatchOptions — use Record to avoid empty-object lint rule
  type WatchOptions = Record<string, unknown>;
  function watch(paths: string | string[], options?: WatchOptions): unknown;
  // export the function as a named export; callers can import { watch } or use interop
  export { watch };
}

// `mime` shim is provided centrally in `types/mime/index.d.ts`; avoid duplicate declaration here.
