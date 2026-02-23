import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. Security Headers (Helmet)
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://apis.google.com", "https://*.supabase.co"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "blob:", "https://images.unsplash.com", "https://picsum.photos", "https://*.supabase.co"],
        connectSrc: ["'self'", "https://*.supabase.co", "https://*.google.com", "wss://*.supabase.co", "ws://localhost:*", "ws://0.0.0.0:*"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'self'", "https://*.supabase.co"],
        frameAncestors: ["*"], // Allow being embedded in any iframe (required for AI Studio)
        upgradeInsecureRequests: [],
      },
    },
    frameguard: false, // Disable X-Frame-Options to allow iframe embedding
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  }));

  // 2. CORS Configuration
  const allowedOrigins = [
    process.env.APP_URL,
    'http://localhost:3000',
  ].filter(Boolean) as string[];

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Allow from whitelisted origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow from AI Studio preview URLs
      if (origin.includes('.run.app')) {
        return callback(null, true);
      }
      
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-client-info', 'apikey'],
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
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
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
