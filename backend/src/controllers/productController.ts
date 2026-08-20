import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../models/prisma';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  categoryId: z.string().min(1, 'Valid Category ID is required'),
  price: z.number().positive('Price must be greater than 0'),
  originalPrice: z.number().positive().optional().nullable(),
  quantity: z.number().nonnegative('Quantity cannot be negative'),
  unit: z.string().default('kg'),
  location: z.string().min(2, 'Location is required'),
  harvestDate: z.string().optional().nullable(),
  isOrganic: z.boolean().default(false),
  isAvailable: z.boolean().default(true),
  images: z.array(z.string()).default([]),
});

const formatProduct = (product: any) => {
  if (!product) return null;
  let parsedImages: string[] = [];
  try {
    if (Array.isArray(product.images)) {
      parsedImages = product.images;
    } else if (typeof product.images === 'string') {
      parsedImages = JSON.parse(product.images);
    }
  } catch (e) {
    parsedImages = product.images ? [product.images] : [];
  }
  return {
    ...product,
    images: parsedImages,
  };
};

export class ProductController {
  static async getAll(req: Request, res: Response) {
    try {
      const {
        search,
        categoryId,
        categorySlug,
        minPrice,
        maxPrice,
        location,
        isOrganic,
        isAvailable,
        farmerId,
        unit,
        sortBy = 'newest',
        page = '1',
        limit = '12',
      } = req.query;

      const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
      const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 12));
      const skip = (pageNum - 1) * limitNum;

      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search as string } },
          { description: { contains: search as string } },
          { location: { contains: search as string } },
        ];
      }

      if (categoryId) {
        where.categoryId = categoryId as string;
      } else if (categorySlug) {
        where.category = { slug: categorySlug as string };
      }

      if (farmerId) {
        where.farmerId = farmerId as string;
      }

      if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = parseFloat(minPrice as string);
        if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
      }

      if (location) {
        where.location = { contains: location as string };
      }

      if (isOrganic !== undefined) {
        where.isOrganic = isOrganic === 'true';
      }

      if (isAvailable !== undefined) {
        where.isAvailable = isAvailable === 'true';
      } else {
        if (!farmerId) {
          where.isAvailable = true;
        }
      }

      if (unit) {
        where.unit = unit as string;
      }

      let orderBy: any = { createdAt: 'desc' };
      if (sortBy === 'price_asc') orderBy = { price: 'asc' };
      if (sortBy === 'price_desc') orderBy = { price: 'desc' };
      if (sortBy === 'rating_desc') orderBy = { rating: 'desc' };
      if (sortBy === 'harvest_recent') orderBy = { harvestDate: 'desc' };
      if (sortBy === 'name_asc') orderBy = { name: 'asc' };

      const [total, products] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
          where,
          include: {
            category: { select: { id: true, name: true, slug: true } },
            farmer: {
              select: {
                id: true,
                name: true,
                avatar: true,
                city: true,
                state: true,
                farmerProfile: {
                  select: {
                    farmName: true,
                    isVerified: true,
                    rating: true,
                    location: true,
                  },
                },
              },
            },
          },
          orderBy,
          skip,
          take: limitNum,
        }),
      ]);

      const formatted = products.map(formatProduct);
      return sendPaginated(res, formatted, total, pageNum, limitNum);
    } catch (error: any) {
      return sendError(res, 'Failed to fetch products', 500, error.message);
    }
  }

  static async getFeatured(req: Request, res: Response) {
    try {
      const products = await prisma.product.findMany({
        where: {
          isAvailable: true,
          quantity: { gt: 0 },
        },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          farmer: {
            select: {
              id: true,
              name: true,
              avatar: true,
              farmerProfile: {
                select: {
                  farmName: true,
                  isVerified: true,
                  rating: true,
                },
              },
            },
          },
        },
        orderBy: [{ rating: 'desc' }, { createdAt: 'desc' }],
        take: 8,
      });

      return sendSuccess(res, products.map(formatProduct));
    } catch (error: any) {
      return sendError(res, 'Failed to fetch featured products', 500, error.message);
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          category: true,
          farmer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              avatar: true,
              city: true,
              state: true,
              farmerProfile: true,
            },
          },
          reviews: {
            include: {
              customer: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });

      if (!product) {
        return sendError(res, 'Product not found', 404);
      }

      const relatedProducts = await prisma.product.findMany({
        where: {
          categoryId: product.categoryId,
          id: { not: product.id },
          isAvailable: true,
        },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          farmer: {
            select: {
              id: true,
              name: true,
              farmerProfile: { select: { farmName: true, isVerified: true } },
            },
          },
        },
        take: 4,
      });

      return sendSuccess(res, {
        ...formatProduct(product),
        relatedProducts: relatedProducts.map(formatProduct),
      });
    } catch (error: any) {
      return sendError(res, 'Failed to fetch product details', 500, error.message);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 401);
      }

      if (req.user.role !== 'FARMER' && req.user.role !== 'ADMIN') {
        return sendError(res, 'Only verified Farmers can list agricultural products', 403);
      }

      const data = productSchema.parse(req.body);

      const product = await prisma.product.create({
        data: {
          farmerId: req.user.id,
          categoryId: data.categoryId,
          name: data.name,
          description: data.description,
          price: data.price,
          originalPrice: data.originalPrice,
          quantity: data.quantity,
          unit: data.unit,
          location: data.location,
          harvestDate: data.harvestDate ? new Date(data.harvestDate) : null,
          isOrganic: data.isOrganic,
          isAvailable: data.isAvailable,
          images: JSON.stringify(data.images),
        },
        include: {
          category: true,
          farmer: {
            select: {
              id: true,
              name: true,
              farmerProfile: true,
            },
          },
        },
      });

      return sendSuccess(res, formatProduct(product), 'Product listed successfully!', 201);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return sendError(res, error.errors[0]?.message || 'Validation error', 400, error.errors);
      }
      return sendError(res, 'Failed to create product', 500, error.message);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 401);
      }

      const { id } = req.params;

      const existing = await prisma.product.findUnique({
        where: { id },
      });

      if (!existing) {
        return sendError(res, 'Product not found', 404);
      }

      if (existing.farmerId !== req.user.id && req.user.role !== 'ADMIN') {
        return sendError(res, 'You do not have permission to modify this product', 403);
      }

      const data = req.body;

      const updated = await prisma.product.update({
        where: { id },
        data: {
          name: data.name !== undefined ? data.name : undefined,
          description: data.description !== undefined ? data.description : undefined,
          categoryId: data.categoryId !== undefined ? data.categoryId : undefined,
          price: data.price !== undefined ? parseFloat(data.price) : undefined,
          originalPrice: data.originalPrice !== undefined ? (data.originalPrice ? parseFloat(data.originalPrice) : null) : undefined,
          quantity: data.quantity !== undefined ? parseFloat(data.quantity) : undefined,
          unit: data.unit !== undefined ? data.unit : undefined,
          location: data.location !== undefined ? data.location : undefined,
          harvestDate: data.harvestDate !== undefined ? (data.harvestDate ? new Date(data.harvestDate) : null) : undefined,
          isOrganic: data.isOrganic !== undefined ? Boolean(data.isOrganic) : undefined,
          isAvailable: data.isAvailable !== undefined ? Boolean(data.isAvailable) : undefined,
          images: data.images !== undefined ? (typeof data.images === 'string' ? data.images : JSON.stringify(data.images)) : undefined,
        },
        include: {
          category: true,
          farmer: {
            select: {
              id: true,
              name: true,
              farmerProfile: true,
            },
          },
        },
      });

      return sendSuccess(res, formatProduct(updated), 'Product updated successfully');
    } catch (error: any) {
      return sendError(res, 'Failed to update product', 500, error.message);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 401);
      }

      const { id } = req.params;

      const existing = await prisma.product.findUnique({
        where: { id },
      });

      if (!existing) {
        return sendError(res, 'Product not found', 404);
      }

      if (existing.farmerId !== req.user.id && req.user.role !== 'ADMIN') {
        return sendError(res, 'You do not have permission to delete this product', 403);
      }

      await prisma.product.delete({
        where: { id },
      });

      return sendSuccess(res, null, 'Product removed from listings');
    } catch (error: any) {
      return sendError(res, 'Failed to delete product', 500, error.message);
    }
  }
}
