import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { env } from './config/env';

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: [env.FRONTEND_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  })
);
app.use(express.json());

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    phase: 'Phase 2',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api', routes);

// Global Error Handler
app.use(errorHandler);
