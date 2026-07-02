import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'fs';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'serve-p1-index',
      configureServer(server) {
        return () => {
          server.middlewares.use((req, res, next) => {
            if (req.url === '/' || req.url === '/index.html') {
              const html = readFileSync(
                resolve(__dirname, 'p1/index.html'),
                'utf-8'
              );
              server.transformIndexHtml(req.url, html).then(transformed => {
                res.setHeader('Content-Type', 'text/html');
                res.end(transformed);
              });
              return;
            }
            next();
          });
        };
      },
    },
  ],
  server: {
    port: 5173,
    strictPort: true,
  },
});

