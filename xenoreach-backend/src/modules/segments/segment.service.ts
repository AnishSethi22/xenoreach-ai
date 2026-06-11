import { SegmentRepository } from './segment.repository';
import { AppError } from '../../middleware/error.middleware';
import { SegmentRule } from '../../shared/types/segment-rule.types';

const repo = new SegmentRepository();

export class SegmentService {
  async preview(rules: SegmentRule) {
    return repo.previewAudience(rules);
  }

  async create(data: { name: string; description?: string; rules: SegmentRule; isDynamic: boolean }) {
    const preview = await repo.previewAudience(data.rules);
    return repo.create({
      ...data,
      customerCount: preview.count,
    });
  }

  async findAll() {
    return repo.findAll();
  }

  async findById(id: string) {
    const segment = await repo.findById(id);
    if (!segment) throw new AppError('Segment not found', 404);

    const rules = segment.rules as unknown as SegmentRule;
    const preview = segment.isDynamic ? await repo.previewAudience(rules) : null;

    return {
      ...segment,
      currentCount: preview?.count ?? segment.customerCount,
      sample: preview?.sample ?? [],
    };
  }

  async delete(id: string) {
    const segment = await repo.findById(id);
    if (!segment) throw new AppError('Segment not found', 404);
    return repo.delete(id);
  }

  async getCustomerIds(rules: SegmentRule): Promise<string[]> {
    return repo.getCustomerIdsByRules(rules);
  }
}
