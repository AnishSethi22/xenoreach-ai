import { Router, Request, Response, NextFunction } from 'express';
import { AnalyticsController } from './analytics.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const controller = new AnalyticsController();

router.use(authMiddleware);

router.get('/overview', (req: Request, res: Response, next: NextFunction) => controller.getOverview(req, res, next));
router.get('/campaigns', (req: Request, res: Response, next: NextFunction) => controller.getCampaigns(req, res, next));
router.get('/channels', (req: Request, res: Response, next: NextFunction) => controller.getChannels(req, res, next));
router.get('/trends', (req: Request, res: Response, next: NextFunction) => controller.getTrends(req, res, next));
router.get('/revenue', (req: Request, res: Response, next: NextFunction) => controller.getRevenue(req, res, next));
router.get('/audience', (req: Request, res: Response, next: NextFunction) => controller.getAudience(req, res, next));

export default router;
