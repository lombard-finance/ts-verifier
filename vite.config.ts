import path from 'node:path';

import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [],
    resolve: {
    alias: {
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
    },
  },
  define: {
    'process.env': {},
    global: 'globalThis',
  },
  build: {
    sourcemap: false,
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
    },
    rollupOptions: {
      external: [],
      output: [
        {
          format: 'es',
          dir: 'dist',
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
        },
      ],
    },
  },
});
