import { Router } from 'express';
import { AiController } from './ai.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const controller = new AiController();

router.use(authMiddleware);

router.post('/translate-goal', (req, res, next) => controller.translateGoal(req, res, next));
router.post('/generate-message', (req, res, next) => controller.generateMessage(req, res, next));
router.post('/copilot', (req, res, next) => controller.copilot(req, res, next));
router.get('/insights', (req, res, next) => controller.getInsights(req, res, next));
router.post('/insights/refresh', (req, res, next) => controller.refreshInsights(req, res, next));

export default router;
