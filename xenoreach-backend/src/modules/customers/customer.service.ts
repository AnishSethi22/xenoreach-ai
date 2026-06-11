import { CustomerRepository } from './customer.repository';
import { AppError } from '../../middleware/error.middleware';
import { paginatedResponse } from '../../shared/types/api-response.types';
import { PaginationQuery } from '../../shared/types/api-response.types';

const repo = new CustomerRepository();

export class CustomerService {
  async findAll(pagination: PaginationQuery, filters: {
    city?: string;
    loyaltyTier?: string;
    rfmSegment?: string;
    minSpend?: number;
    maxSpend?: number;
  }) {
    const { customers, total } = await repo.findAll(pagination, filters);
    return paginatedResponse(customers, total, pagination.page, pagination.limit);
  }

  async findById(id: string) {
    const customer = await repo.findById(id);
    if (!customer) throw new AppError('Customer not found', 404);
    return customer;
  }

  async getOrderHistory(customerId: string, page: number, limit: number) {
    const customer = await repo.findById(customerId);
    if (!customer) throw new AppError('Customer not found', 404);
    const { orders, total } = await repo.findOrderHistory(customerId, page, limit);
    return paginatedResponse(orders, total, page, limit);
  }

  async getCommunicationHistory(customerId: string, page: number, limit: number) {
    const customer = await repo.findById(customerId);
    if (!customer) throw new AppError('Customer not found', 404);
    const { events, total } = await repo.findCommunicationHistory(customerId, page, limit);
    return paginatedResponse(events, total, page, limit);
  }

  async getMetricsSummary() {
    return repo.getMetricsSummary();
  }
}
