import { Request } from 'express';

export type Role = 'CUSTOMER' | 'FARMER' | 'ADMIN';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'COD' | 'UPI' | 'CARD' | 'NETBANKING';

export interface AuthUser {
  id: string;
  email: string;
  role: Role | string;
  name: string;
  isApproved: boolean;
  isActive: boolean;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}
