import { Request, Response, NextFunction } from 'express';
import { CampaignService } from './campaign.service';
import { createCampaignDto, updateCampaignDto } from './campaign.dto';
import { successResponse } from '../../shared/types/api-response.types';
import { AppError } from '../../middleware/error.middleware';

const service = new CampaignService();

export class CampaignController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = createCampaignDto.safeParse(req.body);
      if (!parsed.success) throw new AppError(parsed.error.message, 400);
      const campaign = await service.create(parsed.data);
      res.status(201).json(successResponse(campaign));
    } catch (err) {
      next(err);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(String(req.query.page)) || 1;
      const limit = parseInt(String(req.query.limit)) || 20;
      const status = req.query.status ? String(req.query.status) : undefined;
      const result = await service.findAll(page, limit, status);
      res.json(successResponse(result));
    } catch (err) {
      next(err);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const campaign = await service.findById(String(req.params.id));
      res.json(successResponse(campaign));
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = updateCampaignDto.safeParse(req.body);
      if (!parsed.success) throw new AppError(parsed.error.message, 400);
      const campaign = await service.update(String(req.params.id), parsed.data);
      res.json(successResponse(campaign));
    } catch (err) {
      next(err);
    }
  }

  async launch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await service.launch(String(req.params.id));
      res.json(successResponse(result, 'Campaign launched successfully'));
    } catch (err) {
      next(err);
    }
  }

  async pause(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const campaign = await service.pause(String(req.params.id));
      res.json(successResponse(campaign, 'Campaign paused'));
    } catch (err) {
      next(err);
    }
  }

  async resume(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const campaign = await service.resume(String(req.params.id));
      res.json(successResponse(campaign, 'Campaign resumed'));
    } catch (err) {
      next(err);
    }
  }

  async stop(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const campaign = await service.stop(String(req.params.id));
      res.json(successResponse(campaign, 'Campaign stopped'));
    } catch (err) {
      next(err);
    }
  }

  async complete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const campaign = await service.complete(String(req.params.id));
      res.json(successResponse(campaign, 'Campaign completed'));
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await service.delete(String(req.params.id));
      res.json(successResponse(null, 'Campaign deleted'));
    } catch (err) {
      next(err);
    }
  }

  async duplicate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const campaign = await service.duplicate(String(req.params.id));
      res.json(successResponse(campaign, 'Campaign duplicated'));
    } catch (err) {
      next(err);
    }
  }

  async getRecipients(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(String(req.query.page)) || 1;
      const limit = parseInt(String(req.query.limit)) || 20;
      const result = await service.getRecipients(String(req.params.id), page, limit);
      res.json(successResponse(result));
    } catch (err) {
      next(err);
    }
  }

  async getEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const events = await service.getRecentEvents(String(req.params.id));
      res.json(successResponse(events));
    } catch (err) {
      next(err);
    }
  }
}
