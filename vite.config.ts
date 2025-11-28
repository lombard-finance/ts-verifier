import path from 'node:path';

import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [],
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
        {
          format: 'commonjs',
          dir: 'dist',
          entryFileNames: '[name].cjs',
          chunkFileNames: '[name].cjs',
        },
      ],
    },
  },
});
