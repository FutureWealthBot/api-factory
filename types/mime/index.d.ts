
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type */
declare module 'mime' {
	/** Return the mime type for a filename or extension */
	export function getType(path: string): string | null;

	/** Return a recommended extension for a mime type */
	export function getExtension(mimeType: string): string | null;

	const types: {
		getType: typeof getType;
		getExtension: typeof getExtension;
	};

	export default types;
}
