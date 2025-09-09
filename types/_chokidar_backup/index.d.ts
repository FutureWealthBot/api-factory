/* eslint-disable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-explicit-any */
declare module 'chokidar' {
  interface WatchOptions {}
  function watch(paths: string | string[], options?: WatchOptions): any;
  export default { watch };
}
