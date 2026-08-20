import { Response } from 'express';
import prisma from '../models/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class NotificationController {
  static async getMyNotifications(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 401);
      }

      const notifications = await prisma.notification.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        take: 30,
      });

      const unreadCount = await prisma.notification.count({
        where: { userId: req.user.id, isRead: false },
      });

      return sendSuccess(res, { notifications, unreadCount });
    } catch (error: any) {
      return sendError(res, 'Failed to fetch notifications', 500, error.message);
    }
  }

  static async markAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 401);
      }

      const { id } = req.params;

      if (id === 'all') {
        await prisma.notification.updateMany({
          where: { userId: req.user.id, isRead: false },
          data: { isRead: true },
        });
        return sendSuccess(res, null, 'All notifications marked as read');
      }

      await prisma.notification.updateMany({
        where: { id, userId: req.user.id },
        data: { isRead: true },
      });

      return sendSuccess(res, null, 'Notification marked as read');
    } catch (error: any) {
      return sendError(res, 'Failed to update notification', 500, error.message);
    }
  }
}
