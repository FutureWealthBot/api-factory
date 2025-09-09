
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type */
declare module 'chokidar' {
	export interface WatchOptions {
		ignored?: string | RegExp | (string | RegExp)[];
		persistent?: boolean;
		ignoreInitial?: boolean;
		cwd?: string;
	}

	export function watch(paths: string | string[], options?: WatchOptions): {
		close(): Promise<void> | void;
		on(event: 'add' | 'change' | 'unlink' | 'addDir' | 'unlinkDir' | 'error', listener: (...args: any[]) => void): void;
	};

		const _default: { watch: typeof watch };
		export default _default;
}
