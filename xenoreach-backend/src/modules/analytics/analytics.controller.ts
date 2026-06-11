import { Request, Response, NextFunction } from 'express';
import { AnalyticsRepository } from './analytics.repository';
import { successResponse } from '../../shared/types/api-response.types';

const repo = new AnalyticsRepository();

export class AnalyticsController {
  async getOverview(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await repo.getOverview();
      res.json(successResponse(data));
    } catch (err) {
      next(err);
    }
  }

  async getCampaigns(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const data = await repo.getCampaignComparison(limit);
      res.json(successResponse(data));
    } catch (err) {
      next(err);
    }
  }

  async getChannels(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await repo.getChannelPerformance();
      res.json(successResponse(data));
    } catch (err) {
      next(err);
    }
  }

  async getTrends(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const data = await repo.getTrends(days);
      res.json(successResponse(data));
    } catch (err) {
      next(err);
    }
  }

  async getRevenue(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await repo.getRevenueBreakdown();
      res.json(successResponse(data));
    } catch (err) {
      next(err);
    }
  }

  async getAudience(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await repo.getAudienceHealth();
      res.json(successResponse(data));
    } catch (err) {
      next(err);
    }
  }
}
