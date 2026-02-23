import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. Security Headers (Helmet)
  app.use(helmet({
    contentSecurityPolicy: false,
    frameguard: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  }));

  // 2. CORS Configuration
  app.use(cors({
    origin: process.env.APP_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-client-info'],
    credentials: true,
  }));

  // 3. Additional Security Middlewares
  app.use(express.json({ limit: '10kb' })); // Limit body size to prevent DoS
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // 4. API Routes (if any)
  app.get('/api/health', (req, res) => {
    res.json({ status: 'secure', timestamp: new Date().toISOString() });
  });

  // 5. Vite Integration or Static Files
  if (process.env.NODE_ENV !== 'production') {
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.error('Failed to create Vite server:', e);
    }
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`
🛡️  Studio VIP Gold - Secure Server Running
🚀  URL: http://0.0.0.0:${PORT}
🔒  Security Headers: Enabled (Helmet)
🔑  CORS: Configured
    `);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
