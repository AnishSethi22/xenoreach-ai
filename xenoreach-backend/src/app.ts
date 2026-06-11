import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './config/env';
import { errorMiddleware } from './middleware/error.middleware';

import customerRouter from './modules/customers/customer.router';
import segmentRouter from './modules/segments/segment.router';
import campaignRouter from './modules/campaigns/campaign.router';
import analyticsRouter from './modules/analytics/analytics.router';
import aiRouter from './modules/ai/ai.router';
import authRouter from './modules/auth/auth.router';

const app = express();

app.use(helmet());
app.use(cors({
  origin: [env.FRONTEND_URL, 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    version: '1.0.0',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    demoMode: env.DEMO_MODE,
  });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/customers', customerRouter);
app.use('/api/v1/segments', segmentRouter);
app.use('/api/v1/campaigns', campaignRouter);
app.use('/api/v1/analytics', analyticsRouter);
app.use('/api/v1/ai', aiRouter);

app.use(errorMiddleware);

app.listen(env.PORT, () => {
  console.log(`XenoReach Backend running on port ${env.PORT} [${env.NODE_ENV}]`);
  if (env.DEMO_MODE) {
    console.log('Demo mode is ENABLED — authentication bypassed for reviewers');
  }
});

export default app;
