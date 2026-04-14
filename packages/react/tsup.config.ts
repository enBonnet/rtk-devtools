import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/production.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  splitting: false,
  external: ['react', 'react-dom', 'react-redux', '@reduxjs/toolkit'],
})
