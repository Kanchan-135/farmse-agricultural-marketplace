import { Response } from 'express';
import prisma from '../models/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class WishlistController {
  static async getWishlist(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 401);
      }

      let wishlist = await prisma.wishlist.findUnique({
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

      if (!wishlist) {
        await prisma.wishlist.create({
          data: { userId: req.user.id },
        });

        wishlist = await prisma.wishlist.findUnique({
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

      const products = (wishlist?.items || []).map((item) => {
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
          wishlistItemId: item.id,
          ...item.product,
          images: parsedImages,
        };
      });

      return sendSuccess(res, products);
    } catch (error: any) {
      return sendError(res, 'Failed to fetch wishlist', 500, error.message);
    }
  }

  static async toggle(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 401);
      }

      const { productId } = req.body;

      if (!productId) {
        return sendError(res, 'Product ID is required', 400);
      }

      let wishlist = await prisma.wishlist.findUnique({
        where: { userId: req.user.id },
      });

      if (!wishlist) {
        wishlist = await prisma.wishlist.create({
          data: { userId: req.user.id },
        });
      }

      const existing = await prisma.wishlistItem.findUnique({
        where: {
          wishlistId_productId: {
            wishlistId: wishlist.id,
            productId,
          },
        },
      });

      if (existing) {
        await prisma.wishlistItem.delete({
          where: { id: existing.id },
        });
        return sendSuccess(res, { inWishlist: false }, 'Product removed from wishlist');
      } else {
        await prisma.wishlistItem.create({
          data: {
            wishlistId: wishlist.id,
            productId,
          },
        });
        return sendSuccess(res, { inWishlist: true }, 'Product added to wishlist');
      }
    } catch (error: any) {
      return sendError(res, 'Failed to toggle wishlist item', 500, error.message);
    }
  }
}
