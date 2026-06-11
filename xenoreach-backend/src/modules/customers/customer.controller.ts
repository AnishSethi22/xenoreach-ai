import { Request, Response, NextFunction } from 'express';
import { CustomerService } from './customer.service';
import { successResponse } from '../../shared/types/api-response.types';

const service = new CustomerService();

export class CustomerController {
  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        city: req.query.city ? String(req.query.city) : undefined,
        loyaltyTier: req.query.loyaltyTier ? String(req.query.loyaltyTier) : undefined,
        rfmSegment: req.query.rfmSegment ? String(req.query.rfmSegment) : undefined,
        minSpend: req.query.minSpend ? Number(req.query.minSpend) : undefined,
        maxSpend: req.query.maxSpend ? Number(req.query.maxSpend) : undefined,
      };
      const result = await service.findAll(req.pagination, filters);
      res.json(successResponse(result));
    } catch (err) {
      next(err);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customer = await service.findById(String(req.params.id));
      res.json(successResponse(customer));
    } catch (err) {
      next(err);
    }
  }

  async getOrderHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(String(req.query.page)) || 1;
      const limit = parseInt(String(req.query.limit)) || 10;
      const result = await service.getOrderHistory(String(req.params.id), page, limit);
      res.json(successResponse(result));
    } catch (err) {
      next(err);
    }
  }

  async getCommunicationHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(String(req.query.page)) || 1;
      const limit = parseInt(String(req.query.limit)) || 10;
      const result = await service.getCommunicationHistory(String(req.params.id), page, limit);
      res.json(successResponse(result));
    } catch (err) {
      next(err);
    }
  }

  async getMetricsSummary(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await service.getMetricsSummary();
      res.json(successResponse(summary));
    } catch (err) {
      next(err);
    }
  }
}
