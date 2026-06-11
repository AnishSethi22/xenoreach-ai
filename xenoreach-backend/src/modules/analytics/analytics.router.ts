import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const controller = new AnalyticsController();

router.use(authMiddleware);

router.get('/overview', (req, res, next) => controller.getOverview(req, res, next));
router.get('/campaigns', (req, res, next) => controller.getCampaigns(req, res, next));
router.get('/channels', (req, res, next) => controller.getChannels(req, res, next));
router.get('/trends', (req, res, next) => controller.getTrends(req, res, next));
router.get('/revenue', (req, res, next) => controller.getRevenue(req, res, next));
router.get('/audience', (req, res, next) => controller.getAudience(req, res, next));

export default router;
