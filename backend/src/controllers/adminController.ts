import { Response } from 'express';
import prisma from '../models/prisma';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class AdminController {
  static async getPlatformStats(req: AuthenticatedRequest, res: Response) {
    try {
      const [
        totalUsers,
        totalFarmers,
        totalCustomers,
        totalProducts,
        totalOrders,
        deliveredOrders,
        recentOrders,
        recentUsers,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: 'FARMER' } }),
        prisma.user.count({ where: { role: 'CUSTOMER' } }),
        prisma.product.count(),
        prisma.order.count(),
        prisma.order.findMany({
          where: { orderStatus: { not: 'CANCELLED' } },
          select: { totalAmount: true },
        }),
        prisma.order.findMany({
          include: {
            customer: { select: { id: true, name: true, email: true } },
            items: { include: { product: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 8,
        }),
        prisma.user.findMany({
          orderBy: { createdAt: 'desc' },
          take: 6,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            isApproved: true,
            createdAt: true,
            farmerProfile: true,
          },
        }),
      ]);

      const totalRevenue = deliveredOrders.reduce((sum, ord) => sum + ord.totalAmount, 0);

      // Pending farmer approvals
      const pendingFarmersCount = await prisma.user.count({
        where: { role: 'FARMER', isApproved: false },
      });

      return sendSuccess(res, {
        stats: {
          totalUsers,
          totalFarmers,
          totalCustomers,
          totalProducts,
          totalOrders,
          totalRevenue,
          pendingFarmersCount,
        },
        recentOrders,
        recentUsers,
      });
    } catch (error: any) {
      return sendError(res, 'Failed to fetch platform metrics', 500, error.message);
    }
  }

  static async getUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const { role, search, page = '1', limit = '20' } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 20;
      const skip = (pageNum - 1) * limitNum;

      const where: any = {};
      if (role && ['CUSTOMER', 'FARMER', 'ADMIN'].includes(role as string)) {
        where.role = role;
      }
      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } },
          { phone: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      const [total, users] = await Promise.all([
        prisma.user.count({ where }),
        prisma.user.findMany({
          where,
          include: {
            farmerProfile: true,
            customerProfile: true,
            _count: { select: { products: true, orders: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limitNum,
        }),
      ]);

      return sendPaginated(res, users, total, pageNum, limitNum);
    } catch (error: any) {
      return sendError(res, 'Failed to fetch users', 500, error.message);
    }
  }

  static async toggleUserStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const user = await prisma.user.findUnique({ where: { id } });

      if (!user) {
        return sendError(res, 'User not found', 404);
      }

      const updated = await prisma.user.update({
        where: { id },
        data: { isActive: !user.isActive },
        select: { id: true, name: true, email: true, isActive: true },
      });

      return sendSuccess(
        res,
        updated,
        `User ${updated.isActive ? 'activated' : 'deactivated'} successfully`
      );
    } catch (error: any) {
      return sendError(res, 'Failed to update user status', 500, error.message);
    }
  }

  static async toggleFarmerApproval(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const user = await prisma.user.findUnique({
        where: { id },
        include: { farmerProfile: true },
      });

      if (!user || user.role !== 'FARMER') {
        return sendError(res, 'Farmer profile not found', 404);
      }

      const newApprovalStatus = !user.isApproved;

      await prisma.$transaction([
        prisma.user.update({
          where: { id },
          data: { isApproved: newApprovalStatus },
        }),
        prisma.farmerProfile.updateMany({
          where: { userId: id },
          data: { isVerified: newApprovalStatus },
        }),
      ]);

      return sendSuccess(
        res,
        { isApproved: newApprovalStatus },
        `Farmer ${newApprovalStatus ? 'approved and verified' : 'suspended'}`
      );
    } catch (error: any) {
      return sendError(res, 'Failed to update farmer approval', 500, error.message);
    }
  }

  static async getAllOrders(req: AuthenticatedRequest, res: Response) {
    try {
      const { status, page = '1', limit = '20' } = req.query;
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 20;
      const skip = (pageNum - 1) * limitNum;

      const where: any = {};
      if (status && status !== 'ALL') {
        where.orderStatus = status;
      }

      const [total, orders] = await Promise.all([
        prisma.order.count({ where }),
        prisma.order.findMany({
          where,
          include: {
            customer: { select: { id: true, name: true, email: true, phone: true } },
            items: {
              include: {
                product: true,
                farmer: { select: { id: true, name: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limitNum,
        }),
      ]);

      return sendPaginated(res, orders, total, pageNum, limitNum);
    } catch (error: any) {
      return sendError(res, 'Failed to fetch platform orders', 500, error.message);
    }
  }

  static async getAllReviews(req: AuthenticatedRequest, res: Response) {
    try {
      const reviews = await prisma.review.findMany({
        include: {
          customer: { select: { id: true, name: true, email: true } },
          product: { select: { id: true, name: true, images: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      return sendSuccess(res, reviews);
    } catch (error: any) {
      return sendError(res, 'Failed to fetch reviews', 500, error.message);
    }
  }

  static async deleteReview(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const review = await prisma.review.findUnique({ where: { id } });

      if (!review) {
        return sendError(res, 'Review not found', 404);
      }

      await prisma.review.delete({ where: { id } });

      // Recalculate product rating
      const remainingReviews = await prisma.review.findMany({
        where: { productId: review.productId },
        select: { rating: true },
      });

      const avg =
        remainingReviews.length > 0
          ? remainingReviews.reduce((a, b) => a + b.rating, 0) / remainingReviews.length
          : 0;

      await prisma.product.update({
        where: { id: review.productId },
        data: { rating: parseFloat(avg.toFixed(1)), reviewCount: remainingReviews.length },
      });

      return sendSuccess(res, null, 'Review removed successfully');
    } catch (error: any) {
      return sendError(res, 'Failed to delete review', 500, error.message);
    }
  }
}
