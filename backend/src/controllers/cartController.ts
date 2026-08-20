import { Response } from 'express';
import prisma from '../models/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class CartController {
  static async getCart(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 401);
      }

      let cart = await prisma.cart.findUnique({
        where: { userId: req.user.id },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true,
                  farmer: {
                    select: {
                      id: true,
                      name: true,
                      city: true,
                      farmerProfile: { select: { farmName: true, isVerified: true } },
                    },
                  },
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!cart) {
        await prisma.cart.create({
          data: { userId: req.user.id },
        });

        cart = await prisma.cart.findUnique({
          where: { userId: req.user.id },
          include: {
            items: {
              include: {
                product: {
                  include: {
                    category: true,
                    farmer: {
                      select: {
                        id: true,
                        name: true,
                        city: true,
                        farmerProfile: { select: { farmName: true, isVerified: true } },
                      },
                    },
                  },
                },
              },
              orderBy: { createdAt: 'desc' },
            },
          },
        });
      }

      if (!cart) {
        return sendSuccess(res, {
          id: '',
          items: [],
          itemCount: 0,
          subtotal: 0,
          deliveryFee: 0,
          total: 0,
        });
      }

      // Calculate totals
      let subtotal = 0;
      let itemCount = 0;

      const formattedItems = cart.items.map((item) => {
        const itemSubtotal = item.quantity * item.product.price;
        subtotal += itemSubtotal;
        itemCount += 1;

        let parsedImages: string[] = [];
        try {
          if (Array.isArray(item.product.images)) {
            parsedImages = item.product.images;
          } else if (typeof item.product.images === 'string') {
            parsedImages = JSON.parse(item.product.images);
          }
        } catch (e) {
          parsedImages = item.product.images ? [item.product.images as any] : [];
        }

        return {
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          product: {
            ...item.product,
            images: parsedImages,
          },
          subtotal: itemSubtotal,
          isAvailable: item.product.isAvailable && item.product.quantity >= item.quantity,
        };
      });

      const deliveryFee = subtotal > 500 || subtotal === 0 ? 0 : 40;
      const total = subtotal + deliveryFee;

      return sendSuccess(res, {
        id: cart.id,
        items: formattedItems,
        itemCount,
        subtotal,
        deliveryFee,
        total,
      });
    } catch (error: any) {
      return sendError(res, 'Failed to fetch cart', 500, error.message);
    }
  }

  static async addItem(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 401);
      }

      const { productId, quantity = 1 } = req.body;
      const qty = Math.max(1, parseFloat(quantity) || 1);

      if (!productId) {
        return sendError(res, 'Product ID is required', 400);
      }

      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product || !product.isAvailable) {
        return sendError(res, 'This product is currently unavailable', 400);
      }

      if (product.quantity < qty) {
        return sendError(res, `Only ${product.quantity} ${product.unit} available in stock`, 400);
      }

      let cart = await prisma.cart.findUnique({
        where: { userId: req.user.id },
      });

      if (!cart) {
        cart = await prisma.cart.create({
          data: { userId: req.user.id },
        });
      }

      const existingItem = await prisma.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId,
          },
        },
      });

      if (existingItem) {
        const newQty = existingItem.quantity + qty;
        if (product.quantity < newQty) {
          return sendError(res, `Cannot add more. Total would exceed available stock (${product.quantity} ${product.unit})`, 400);
        }
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: newQty },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId,
            quantity: qty,
          },
        });
      }

      return sendSuccess(res, null, 'Product added to cart!');
    } catch (error: any) {
      return sendError(res, 'Failed to add item to cart', 500, error.message);
    }
  }

  static async updateItem(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 401);
      }

      const { itemId } = req.params;
      const { quantity } = req.body;
      const qty = parseFloat(quantity);

      const item = await prisma.cartItem.findUnique({
        where: { id: itemId },
        include: { cart: true, product: true },
      });

      if (!item || item.cart.userId !== req.user.id) {
        return sendError(res, 'Cart item not found', 404);
      }

      if (qty <= 0) {
        await prisma.cartItem.delete({ where: { id: itemId } });
        return sendSuccess(res, null, 'Item removed from cart');
      }

      if (item.product.quantity < qty) {
        return sendError(res, `Only ${item.product.quantity} ${item.product.unit} available in stock`, 400);
      }

      const updated = await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity: qty },
      });

      return sendSuccess(res, updated, 'Cart updated');
    } catch (error: any) {
      return sendError(res, 'Failed to update cart item', 500, error.message);
    }
  }

  static async removeItem(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 401);
      }

      const { itemId } = req.params;

      const item = await prisma.cartItem.findUnique({
        where: { id: itemId },
        include: { cart: true },
      });

      if (!item || item.cart.userId !== req.user.id) {
        return sendError(res, 'Cart item not found', 404);
      }

      await prisma.cartItem.delete({
        where: { id: itemId },
      });

      return sendSuccess(res, null, 'Item removed from cart');
    } catch (error: any) {
      return sendError(res, 'Failed to remove item', 500, error.message);
    }
  }

  static async clearCart(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 401);
      }

      const cart = await prisma.cart.findUnique({
        where: { userId: req.user.id },
      });

      if (cart) {
        await prisma.cartItem.deleteMany({
          where: { cartId: cart.id },
        });
      }

      return sendSuccess(res, null, 'Cart cleared');
    } catch (error: any) {
      return sendError(res, 'Failed to clear cart', 500, error.message);
    }
  }
}
