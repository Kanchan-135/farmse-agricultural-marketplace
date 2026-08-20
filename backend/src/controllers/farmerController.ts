import { Response } from 'express';
import prisma from '../models/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';
import { NotificationService } from '../services/notificationService';

export class FarmerController {
  static async getDashboardStats(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 401);
      }

      const farmerId = req.user.id;

      // Parallel metric queries
      const [
        totalProducts,
        activeProducts,
        totalOrderItems,
        orderItems,
        recentProducts,
      ] = await Promise.all([
        prisma.product.count({ where: { farmerId } }),
        prisma.product.count({ where: { farmerId, isAvailable: true } }),
        prisma.orderItem.count({ where: { farmerId } }),
        prisma.orderItem.findMany({
          where: { farmerId },
          include: {
            order: {
              select: {
                id: true,
                orderNumber: true,
                orderStatus: true,
                paymentStatus: true,
                paymentMethod: true,
                createdAt: true,
                customer: {
                  select: {
                    id: true,
                    name: true,
                    city: true,
                    phone: true,
                  },
                },
              },
            },
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                unit: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        }),
        prisma.product.findMany({
          where: { farmerId },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
      ]);

      // Calculate Total Revenue (completed/shipped/preparing/confirmed orders)
      const allFarmerOrderItems = await prisma.orderItem.findMany({
        where: {
          farmerId,
          order: {
            orderStatus: { not: 'CANCELLED' },
          },
        },
        select: { subtotal: true },
      });

      const totalRevenue = allFarmerOrderItems.reduce((acc, item) => acc + item.subtotal, 0);

      // Pending fulfillment count
      const pendingOrdersCount = await prisma.orderItem.count({
        where: {
          farmerId,
          order: {
            orderStatus: { in: ['PENDING', 'CONFIRMED', 'PREPARING'] },
          },
        },
      });

      // Farmer profile info
      const farmerProfile = await prisma.farmerProfile.findUnique({
        where: { userId: farmerId },
      });

      return sendSuccess(res, {
        stats: {
          totalProducts,
          activeProducts,
          totalOrders: totalOrderItems,
          pendingOrders: pendingOrdersCount,
          totalRevenue,
          rating: farmerProfile?.rating || 5.0,
          isVerified: farmerProfile?.isVerified || false,
        },
        recentOrders: orderItems,
        recentProducts,
      });
    } catch (error: any) {
      return sendError(res, 'Failed to fetch farmer dashboard analytics', 500, error.message);
    }
  }

  static async getFarmerProducts(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 401);
      }

      const products = await prisma.product.findMany({
        where: { farmerId: req.user.id },
        include: {
          category: { select: { id: true, name: true } },
          _count: {
            select: { orderItems: true, reviews: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return sendSuccess(res, products);
    } catch (error: any) {
      return sendError(res, 'Failed to fetch farmer inventory', 500, error.message);
    }
  }

  static async getFarmerOrders(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 401);
      }

      const farmerId = req.user.id;
      const { status } = req.query;

      const orderWhere: any = {};
      if (status && status !== 'ALL') {
        orderWhere.orderStatus = status;
      }

      const orderItems = await prisma.orderItem.findMany({
        where: {
          farmerId,
          order: orderWhere,
        },
        include: {
          product: true,
          order: {
            include: {
              customer: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                  address: true,
                  city: true,
                  state: true,
                  pincode: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return sendSuccess(res, orderItems);
    } catch (error: any) {
      return sendError(res, 'Failed to fetch farmer orders', 500, error.message);
    }
  }

  static async updateOrderStatus(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 401);
      }

      const { orderId } = req.params;
      const { status } = req.body;

      const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
      if (!validStatuses.includes(status)) {
        return sendError(res, `Invalid order status. Allowed: ${validStatuses.join(', ')}`, 400);
      }

      // Check if this order contains products from this farmer (or user is admin)
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: true,
          customer: true,
        },
      });

      if (!order) {
        return sendError(res, 'Order not found', 404);
      }

      const isFarmerProduct = order.items.some((item) => item.farmerId === req.user!.id);
      if (!isFarmerProduct && req.user.role !== 'ADMIN') {
        return sendError(res, 'You do not have permission to update this order', 403);
      }

      const updated = await prisma.order.update({
        where: { id: orderId },
        data: {
          orderStatus: status as any,
          paymentStatus: status === 'DELIVERED' && order.paymentMethod === 'COD' ? 'COMPLETED' : undefined,
        },
      });

      // Send in-app notification to customer
      await NotificationService.notifyCustomerOrderStatus(order.customerId, order.orderNumber, status);

      return sendSuccess(res, updated, `Order status updated to ${status}`);
    } catch (error: any) {
      return sendError(res, 'Failed to update order status', 500, error.message);
    }
  }
}
