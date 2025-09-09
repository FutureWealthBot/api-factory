declare module 'mime' {
  export function getType(path: string): string | null;
  export function getExtension(mimeType: string): string | null;
  const types: {
    getType: typeof getType;
    getExtension: typeof getExtension;
  };
  export default types;
}
declare module 'mime';
