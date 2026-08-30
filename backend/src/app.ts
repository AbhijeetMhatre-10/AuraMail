import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { authRoutes } from './routes/auth.routes.js';
import { emailRoutes } from './routes/email.routes.js';
import { threadRoutes } from './routes/thread.routes.js';
import { aiRoutes } from './routes/ai.routes.js';
import { searchRoutes } from './routes/search.routes.js';
import { activityRoutes } from './routes/activity.routes.js';
import { errorHandler } from './middleware/error.middleware.js';
import { sendSuccess } from './utils/response.js';
import { isDbConnected } from './config/db.js';

export const app = express();

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Managed on frontend for dev flexibility
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
app.use(
  cors({
    origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Body and cookie parsing
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  return sendSuccess(res, {
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: isDbConnected() ? 'connected' : 'disconnected/in-memory-fallback',
    geminiKeyConfigured: Boolean(env.GEMINI_API_KEY),
    googleOAuthConfigured: Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
    environment: env.NODE_ENV,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/threads', threadRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/search', searchRoutes);
app.use('/api', activityRoutes);

// Central error handler
app.use(errorHandler);
