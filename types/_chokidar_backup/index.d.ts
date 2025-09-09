declare module 'chokidar' {
  interface WatchOptions {}
  function watch(paths: string | string[], options?: WatchOptions): any;
  export default { watch };
}
