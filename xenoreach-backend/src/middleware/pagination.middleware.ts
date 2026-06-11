import { Request, Response, NextFunction } from 'express';
import { PaginationQuery } from '../shared/types/api-response.types';

declare global {
  namespace Express {
    interface Request {
      pagination: PaginationQuery;
    }
  }
}

export function paginationMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  const sortBy = req.query.sortBy as string | undefined;
  const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';
  const search = req.query.search as string | undefined;

  req.pagination = { page, limit, sortBy, sortOrder, search };
  next();
}
