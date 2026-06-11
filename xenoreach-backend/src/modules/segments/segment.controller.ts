import { Request, Response, NextFunction } from 'express';
import { SegmentService } from './segment.service';
import { previewSegmentDto, createSegmentDto } from './segment.dto';
import { successResponse } from '../../shared/types/api-response.types';
import { AppError } from '../../middleware/error.middleware';

const service = new SegmentService();

export class SegmentController {
  async preview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = previewSegmentDto.safeParse(req.body);
      if (!parsed.success) throw new AppError(parsed.error.message, 400);
      const result = await service.preview(parsed.data.rules as Parameters<typeof service.preview>[0]);
      res.json(successResponse(result));
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = createSegmentDto.safeParse(req.body);
      if (!parsed.success) throw new AppError(parsed.error.message, 400);
      const segment = await service.create(parsed.data as Parameters<typeof service.create>[0]);
      res.status(201).json(successResponse(segment));
    } catch (err) {
      next(err);
    }
  }

  async findAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const segments = await service.findAll();
      res.json(successResponse(segments));
    } catch (err) {
      next(err);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const segment = await service.findById(String(req.params.id));
      res.json(successResponse(segment));
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await service.delete(String(req.params.id));
      res.json(successResponse(null, 'Segment deleted'));
    } catch (err) {
      next(err);
    }
  }
}
