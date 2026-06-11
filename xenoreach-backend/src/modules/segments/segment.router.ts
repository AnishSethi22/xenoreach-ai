import { Router } from 'express';
import { SegmentController } from './segment.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const controller = new SegmentController();

router.use(authMiddleware);

router.post('/preview', (req, res, next) => controller.preview(req, res, next));
router.post('/', (req, res, next) => controller.create(req, res, next));
router.get('/', (req, res, next) => controller.findAll(req, res, next));
router.get('/:id', (req, res, next) => controller.findById(req, res, next));
router.delete('/:id', (req, res, next) => controller.delete(req, res, next));

export default router;
