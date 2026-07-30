import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

function apiDevServerPlugin() {
  return {
    name: 'api-dev-server',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        // Helper to collect request body
        const getRawBody = () => new Promise<string>((resolve) => {
          let body = '';
          req.on('data', (chunk: any) => { body += chunk; });
          req.on('end', () => resolve(body));
        });

        // Response helper to match Vercel API signature
        const customRes = res as any;
        customRes.status = function(code: number) {
          this.statusCode = code;
          return this;
        };
        customRes.json = function(data: any) {
          this.setHeader('Content-Type', 'application/json');
          this.end(JSON.stringify(data));
          return this;
        };

        try {
          const rawBody = await getRawBody();
          if (rawBody) {
            try {
              req.body = JSON.parse(rawBody);
            } catch (e) {
              req.body = rawBody;
            }
          }

          if (req.url.startsWith('/api/config')) {
            const configHandler = (await import('./api/config.js')).default;
            return await configHandler(req, customRes);
          }

          if (req.url.startsWith('/api/upload')) {
            const uploadHandler = (await import('./api/upload.js')).default;
            return await uploadHandler(req, customRes);
          }
        } catch (err: any) {
          console.error('Vite Dev Server API Middleware error:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: err.message }));
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), apiDevServerPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: false,
  },
});
