import { Router, Request, Response, NextFunction } from 'express';
import { SegmentController } from './segment.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const controller = new SegmentController();

router.use(authMiddleware);

router.post('/preview', (req: Request, res: Response, next: NextFunction) => controller.preview(req, res, next));
router.post('/', (req: Request, res: Response, next: NextFunction) => controller.create(req, res, next));
router.get('/', (req: Request, res: Response, next: NextFunction) => controller.findAll(req, res, next));
router.get('/:id', (req: Request, res: Response, next: NextFunction) => controller.findById(req, res, next));
router.delete('/:id', (req: Request, res: Response, next: NextFunction) => controller.delete(req, res, next));

export default router;
