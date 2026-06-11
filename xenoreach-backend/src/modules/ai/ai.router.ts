import { Router, Request, Response, NextFunction } from 'express';
import { AiController } from './ai.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const controller = new AiController();

router.use(authMiddleware);

router.post('/translate-goal', (req: Request, res: Response, next: NextFunction) => controller.translateGoal(req, res, next));
router.post('/generate-message', (req: Request, res: Response, next: NextFunction) => controller.generateMessage(req, res, next));
router.post('/copilot', (req: Request, res: Response, next: NextFunction) => controller.copilot(req, res, next));
router.get('/insights', (req: Request, res: Response, next: NextFunction) => controller.getInsights(req, res, next));
router.post('/insights/refresh', (req: Request, res: Response, next: NextFunction) => controller.refreshInsights(req, res, next));

export default router;
