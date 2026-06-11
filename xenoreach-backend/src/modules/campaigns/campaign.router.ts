import { Router } from 'express';
import { CampaignController } from './campaign.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const controller = new CampaignController();

router.use(authMiddleware);

router.post('/', (req, res, next) => controller.create(req, res, next));
router.get('/', (req, res, next) => controller.findAll(req, res, next));
router.get('/:id', (req, res, next) => controller.findById(req, res, next));
router.patch('/:id', (req, res, next) => controller.update(req, res, next));
router.post('/:id/launch', (req, res, next) => controller.launch(req, res, next));
router.post('/:id/pause', (req, res, next) => controller.pause(req, res, next));
router.post('/:id/resume', (req, res, next) => controller.resume(req, res, next));
router.post('/:id/stop', (req, res, next) => controller.stop(req, res, next));
router.post('/:id/complete', (req, res, next) => controller.complete(req, res, next));
router.post('/:id/duplicate', (req, res, next) => controller.duplicate(req, res, next));
router.delete('/:id', (req, res, next) => controller.delete(req, res, next));
router.get('/:id/recipients', (req, res, next) => controller.getRecipients(req, res, next));
router.get('/:id/events', (req, res, next) => controller.getEvents(req, res, next));

export default router;
