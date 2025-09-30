import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pino from 'pino';
import erRouter from './routes/er';
import liveTokenRouter from './routes/liveToken';

dotenv.config();

const logger = pino({ level: 'info' });
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

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/er', erRouter);
app.use('/api/live', liveTokenRouter);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});