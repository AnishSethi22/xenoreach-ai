import { Request, Response, NextFunction } from 'express';
import { AiService } from './ai.service';
import { successResponse } from '../../shared/types/api-response.types';
import { AppError } from '../../middleware/error.middleware';
import { prisma } from '../../config/database';

const service = new AiService();

export class AiController {
  async translateGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { goal } = req.body;
      if (!goal || typeof goal !== 'string') {
        throw new AppError('goal is required', 400);
      }
      const result = await service.translateGoal(goal);
      res.json(successResponse(result));
    } catch (err) {
      next(err);
    }
  }

  async generateMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { goal, channel, audienceDescription, brandTone } = req.body;
      if (!goal || !channel || !audienceDescription) {
        throw new AppError('goal, channel, and audienceDescription are required', 400);
      }
      const result = await service.generateMessage({ goal, channel, audienceDescription, brandTone });
      res.json(successResponse(result));
    } catch (err) {
      next(err);
    }
  }

  async copilot(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { question, history = [] } = req.body;
      if (!question || typeof question !== 'string') {
        throw new AppError('question is required', 400);
      }
      const { answer, provider } = await service.copilotAnswer(question, history);
      res.json(successResponse({ answer, provider }));
    } catch (err) {
      next(err);
    }
  }

  async getInsights(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const insights = await prisma.aiInsight.findMany({
        orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
        where: {
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
      });
      res.json(successResponse(insights));
    } catch (err) {
      next(err);
    }
  }

  async refreshInsights(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const insights = await service.generateInsights();

      await prisma.aiInsight.deleteMany({});

      const created = await prisma.aiInsight.createMany({
        data: insights.map((i) => ({
          ...i,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        })),
      });

      res.json(successResponse({ count: created.count }, 'Insights refreshed'));
    } catch (err) {
      next(err);
    }
  }
}
