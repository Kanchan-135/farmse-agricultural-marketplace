import prisma from '../models/prisma';

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type?: 'INFO' | 'ORDER' | 'PROMOTION' | 'SYSTEM';
  link?: string;
}

export class NotificationService {
  static async create(params: CreateNotificationParams) {
    try {
      return await prisma.notification.create({
        data: {
          userId: params.userId,
          title: params.title,
          message: params.message,
          type: params.type || 'INFO',
          link: params.link,
        },
      });
    } catch (error) {
      console.error('Failed to create notification:', error);
      return null;
    }
  }

  static async notifyFarmersNewOrder(farmerIds: string[], orderNumber: string) {
    const uniqueIds = Array.from(new Set(farmerIds));
    for (const farmerId of uniqueIds) {
      await this.create({
        userId: farmerId,
        title: 'New Order Received! 🌾',
        message: `You have received an order #${orderNumber}. Please review and update status.`,
        type: 'ORDER',
        link: '/farmer/orders',
      });
    }
  }

  static async notifyCustomerOrderStatus(customerId: string, orderNumber: string, status: string) {
    await this.create({
      userId: customerId,
      title: `Order Update: ${status} 📦`,
      message: `Your order #${orderNumber} is now marked as ${status}.`,
      type: 'ORDER',
      link: `/customer/orders`,
    });
  }
}
