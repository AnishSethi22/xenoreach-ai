import { Router, Request, Response, NextFunction } from 'express';
import { CampaignController } from './campaign.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const controller = new CampaignController();

router.use(authMiddleware);

router.post('/', (req: Request, res: Response, next: NextFunction) => controller.create(req, res, next));
router.get('/', (req: Request, res: Response, next: NextFunction) => controller.findAll(req, res, next));
router.get('/:id', (req: Request, res: Response, next: NextFunction) => controller.findById(req, res, next));
router.patch('/:id', (req: Request, res: Response, next: NextFunction) => controller.update(req, res, next));
router.post('/:id/launch', (req: Request, res: Response, next: NextFunction) => controller.launch(req, res, next));
router.post('/:id/pause', (req: Request, res: Response, next: NextFunction) => controller.pause(req, res, next));
router.post('/:id/resume', (req: Request, res: Response, next: NextFunction) => controller.resume(req, res, next));
router.post('/:id/stop', (req: Request, res: Response, next: NextFunction) => controller.stop(req, res, next));
router.post('/:id/complete', (req: Request, res: Response, next: NextFunction) => controller.complete(req, res, next));
router.post('/:id/duplicate', (req: Request, res: Response, next: NextFunction) => controller.duplicate(req, res, next));
router.delete('/:id', (req: Request, res: Response, next: NextFunction) => controller.delete(req, res, next));
router.get('/:id/recipients', (req: Request, res: Response, next: NextFunction) => controller.getRecipients(req, res, next));
router.get('/:id/events', (req: Request, res: Response, next: NextFunction) => controller.getEvents(req, res, next));

export default router;
