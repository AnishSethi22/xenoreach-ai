import { Router, Request, Response, NextFunction } from 'express';
import { CustomerController } from './customer.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { paginationMiddleware } from '../../middleware/pagination.middleware';

const router = Router();
const controller = new CustomerController();

router.use(authMiddleware);

router.get('/metrics/summary', (req: Request, res: Response, next: NextFunction) => controller.getMetricsSummary(req, res, next));
router.get('/', paginationMiddleware, (req: Request, res: Response, next: NextFunction) => controller.findAll(req, res, next));
router.get('/:id', (req: Request, res: Response, next: NextFunction) => controller.findById(req, res, next));
router.get('/:id/orders', (req: Request, res: Response, next: NextFunction) => controller.getOrderHistory(req, res, next));
router.get('/:id/events', (req: Request, res: Response, next: NextFunction) => controller.getCommunicationHistory(req, res, next));

export default router;
