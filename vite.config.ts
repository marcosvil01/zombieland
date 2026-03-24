import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    // Evita conflicto con la carpeta assets/ del juego
    assetsDir: '_build',
    target: 'esnext',
    minify: 'esbuild',
  },
});
