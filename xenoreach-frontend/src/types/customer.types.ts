export interface Customer {
  id: string;
  externalId: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  createdAt: string;
  updatedAt: string;
  metrics: CustomerMetrics | null;
}

export interface CustomerMetrics {
  customerId: string;
  totalSpend: string;
  orderCount: number;
  avgOrderValue: string;
  lastOrderDate: string | null;
  firstOrderDate: string | null;
  daysSinceLast: number | null;
  engagementScore: string;
  churnProbability: string;
  purchasePropensity: string;
  loyaltyTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  loyaltyPoints: number;
  recencyScore: number | null;
  frequencyScore: number | null;
  monetaryScore: number | null;
  rfmSegment: string | null;
  updatedAt: string;
}

export interface Order {
  id: string;
  customerId: string;
  orderNumber: string;
  status: string;
  totalAmount: string;
  itemCount: number;
  channel: string | null;
  storeId: string | null;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string | null;
  productName: string | null;
  category: string | null;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
}

export interface CustomerSummary {
  totalCustomers: number;
  avgTotalSpend: string | null;
  avgEngagementScore: string | null;
  avgChurnProbability: string | null;
  avgOrderCount: string | null;
  totalRevenue: string | null;
  loyaltyTierCounts: Array<{ loyaltyTier: string; _count: number }>;
  rfmSegmentCounts: Array<{ rfmSegment: string | null; _count: number }>;
  churnRiskCount: number;
}
