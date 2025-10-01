import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pino from 'pino';
import rateLimit from 'express-rate-limit';
import { RATE_LIMITS } from './lib/constants';
import erRouter from './routes/er';
import liveTokenRouter from './routes/liveToken';
import benchmarkRouter from './routes/benchmark';

dotenv.config();

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const app = express();
const PORT = process.env.PORT || 5050;

// CORS configuration
app.use(
  cors({
    origin: process.env.WEB_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);

// Body parser
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: RATE_LIMITS.GENERAL.WINDOW_MS,
  max: RATE_LIMITS.GENERAL.MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to API routes only
app.use('/api/', limiter);

// Stricter rate limiting for expensive operations
const strictLimiter = rateLimit({
  windowMs: RATE_LIMITS.STRICT.WINDOW_MS,
  max: RATE_LIMITS.STRICT.MAX_REQUESTS,
  message: 'Too many expensive requests, please try again later.',
});

// Health check (no rate limit)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes with appropriate rate limiting
app.use('/api/er', strictLimiter, erRouter);
app.use('/api/live', liveTokenRouter);
app.use('/api/er/benchmark', strictLimiter, benchmarkRouter);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});