import { defineConfig } from 'tsup'
export default defineConfig({
  entry: ['src/index.ts'],
  target: 'node20',
  format: ['esm', 'cjs'],
  sourcemap: true,
  clean: true,
  dts: false,
  minify: false,
})
