import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    // Electron Forge Vite plugin outputs CommonJS by default
    // Output as .cjs to work with "type": "module" in package.json
    rollupOptions: {
      output: {
        format: 'cjs',
        entryFileNames: 'main.cjs',
      },
    },
  },
});
