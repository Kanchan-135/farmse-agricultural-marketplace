import { Response } from 'express';
import { z } from 'zod';
import prisma from '../models/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';
import { paymentService } from '../services/paymentService';
import { NotificationService } from '../services/notificationService';

export const checkoutSchema = z.object({
  shippingAddress: z.string().min(5, 'Shipping address is required'),
  contactPhone: z.string().min(7, 'Contact phone is required'),
  paymentMethod: z.enum(['COD', 'UPI', 'CARD', 'NETBANKING']).default('COD'),
  notes: z.string().optional(),
  // Optional direct buy items instead of cart
  directItem: z
    .object({
      productId: z.string(),
      quantity: z.number().positive(),
    })
    .optional(),
});

export class OrderController {
  static async checkout(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 401);
      }

      const data = checkoutSchema.parse(req.body);
      const customerId = req.user.id;

      // 1. Gather items either from direct buy or from Cart
      let itemsToOrder: { productId: string; quantity: number; unitPrice: number; farmerId: string; subtotal: number }[] = [];
      let totalAmount = 0;

      if (data.directItem) {
        const product = await prisma.product.findUnique({
          where: { id: data.directItem.productId },
        });

        if (!product || !product.isAvailable) {
          return sendError(res, 'Selected product is not available for purchase', 400);
        }

        if (product.quantity < data.directItem.quantity) {
          return sendError(res, `Insufficient stock. Only ${product.quantity} ${product.unit} available.`, 400);
        }

        const subtotal = data.directItem.quantity * product.price;
        itemsToOrder.push({
          productId: product.id,
          farmerId: product.farmerId,
          quantity: data.directItem.quantity,
          unitPrice: product.price,
          subtotal,
        });
        totalAmount = subtotal;
      } else {
        // Fetch cart items
        const cart = await prisma.cart.findUnique({
          where: { userId: customerId },
          include: {
            items: {
              include: { product: true },
            },
          },
        });

        if (!cart || cart.items.length === 0) {
          return sendError(res, 'Your cart is empty', 400);
        }

        // Validate stock for all cart items
        for (const item of cart.items) {
          if (!item.product.isAvailable || item.product.quantity < item.quantity) {
            return sendError(
              res,
              `Product "${item.product.name}" is out of stock or requested quantity exceeds available stock (${item.product.quantity} ${item.product.unit})`,
              400
            );
          }

          const subtotal = item.quantity * item.product.price;
          itemsToOrder.push({
            productId: item.product.id,
            farmerId: item.product.farmerId,
            quantity: item.quantity,
            unitPrice: item.product.price,
            subtotal,
          });
          totalAmount += subtotal;
        }
      }

      // Add delivery fee if subtotal <= 500
      const deliveryFee = totalAmount > 500 ? 0 : 40;
      const grandTotal = totalAmount + deliveryFee;

      const orderNumber = `FRM-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

      // 2. Process Payment via Payment Service abstraction
      const customer = await prisma.user.findUnique({ where: { id: customerId } });
      const paymentResult = await paymentService.processPayment({
        orderId: orderNumber,
        orderNumber,
        amount: grandTotal,
        currency: 'INR',
        customerName: customer?.name || 'Customer',
        customerEmail: customer?.email || '',
        customerPhone: data.contactPhone,
        method: data.paymentMethod,
      });

      // 3. Database transaction: Create order, create order items, deduct product inventory, empty cart
      const newOrder = await prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
          data: {
            orderNumber,
            customerId,
            totalAmount: grandTotal,
            shippingAddress: data.shippingAddress,
            contactPhone: data.contactPhone,
            paymentMethod: data.paymentMethod,
            paymentStatus: paymentResult.paymentStatus,
            orderStatus: 'PENDING',
            notes: data.notes,
            items: {
              create: itemsToOrder.map((item) => ({
                productId: item.productId,
                farmerId: item.farmerId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                subtotal: item.subtotal,
              })),
            },
          },
          include: {
            items: {
              include: {
                product: true,
                farmer: {
                  select: { id: true, name: true, phone: true },
                },
              },
            },
          },
        });

        // Deduct inventory quantities
        for (const item of itemsToOrder) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              quantity: { decrement: item.quantity },
            },
          });
        }

        // If from cart, clear cart items
        if (!data.directItem) {
          const userCart = await tx.cart.findUnique({ where: { userId: customerId } });
          if (userCart) {
            await tx.cartItem.deleteMany({ where: { cartId: userCart.id } });
          }
        }

        return order;
      });

      // 4. Notify Farmers and Customer asynchronously
      const farmerIds = itemsToOrder.map((item) => item.farmerId);
      await NotificationService.notifyFarmersNewOrder(farmerIds, orderNumber);
      await NotificationService.create({
        userId: customerId,
        title: 'Order Placed Successfully! 🛒',
        message: `Your order #${orderNumber} for ₹${grandTotal} has been placed.`,
        type: 'ORDER',
        link: `/customer/orders`,
      });

      return sendSuccess(
        res,
        {
          order: newOrder,
          payment: paymentResult,
        },
        'Order placed successfully!',
        201
      );
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return sendError(res, error.errors[0]?.message || 'Validation error', 400, error.errors);
      }
      return sendError(res, 'Failed to process order', 500, error.message);
    }
  }

  static async getCustomerOrders(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 401);
      }

      const orders = await prisma.order.findMany({
        where: { customerId: req.user.id },
        include: {
          items: {
            include: {
              product: true,
              farmer: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                  city: true,
                  farmerProfile: { select: { farmName: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return sendSuccess(res, orders);
    } catch (error: any) {
      return sendError(res, 'Failed to fetch customer orders', 500, error.message);
    }
  }

  static async getOrderById(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 401);
      }

      const { id } = req.params;

      const order = await prisma.order.findFirst({
        where: {
          OR: [{ id }, { orderNumber: id }],
        },
        include: {
          customer: {
            select: { id: true, name: true, email: true, phone: true },
          },
          items: {
            include: {
              product: true,
              farmer: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                  city: true,
                  farmerProfile: { select: { farmName: true, rating: true, isVerified: true } },
                },
              },
            },
          },
        },
      });

      if (!order) {
        return sendError(res, 'Order not found', 404);
      }

      // Authorization: Only owner customer, involved farmers, or admin can view
      const isCustomerOwner = order.customerId === req.user.id;
      const isFarmerInvolved = order.items.some((i) => i.farmerId === req.user!.id);
      const isAdmin = req.user.role === 'ADMIN';

      if (!isCustomerOwner && !isFarmerInvolved && !isAdmin) {
        return sendError(res, 'Unauthorized to view this order', 403);
      }

      return sendSuccess(res, order);
    } catch (error: any) {
      return sendError(res, 'Failed to fetch order details', 500, error.message);
    }
  }

  static async cancelOrder(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 401);
      }

      const { id } = req.params;
      const order = await prisma.order.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!order) {
        return sendError(res, 'Order not found', 404);
      }

      if (order.customerId !== req.user.id && req.user.role !== 'ADMIN') {
        return sendError(res, 'Unauthorized to cancel this order', 403);
      }

      if (['SHIPPED', 'DELIVERED', 'CANCELLED'].includes(order.orderStatus)) {
        return sendError(res, `Cannot cancel order in ${order.orderStatus} status`, 400);
      }

      // Transaction: cancel order and restore stock quantities
      const updated = await prisma.$transaction(async (tx) => {
        const ord = await tx.order.update({
          where: { id },
          data: { orderStatus: 'CANCELLED' },
        });

        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { quantity: { increment: item.quantity } },
          });
        }

        return ord;
      });

      return sendSuccess(res, updated, 'Order cancelled successfully and inventory restored');
    } catch (error: any) {
      return sendError(res, 'Failed to cancel order', 500, error.message);
    }
  }
}
