import { Router } from 'express';
import { CustomerController } from './customer.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { paginationMiddleware } from '../../middleware/pagination.middleware';

const router = Router();
const controller = new CustomerController();

router.use(authMiddleware);

router.get('/metrics/summary', (req, res, next) => controller.getMetricsSummary(req, res, next));
router.get('/', paginationMiddleware, (req, res, next) => controller.findAll(req, res, next));
router.get('/:id', (req, res, next) => controller.findById(req, res, next));
router.get('/:id/orders', (req, res, next) => controller.getOrderHistory(req, res, next));
router.get('/:id/events', (req, res, next) => controller.getCommunicationHistory(req, res, next));

export default router;
