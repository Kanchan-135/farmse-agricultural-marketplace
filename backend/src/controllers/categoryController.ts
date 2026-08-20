import { Request, Response } from 'express';
import prisma from '../models/prisma';
import { sendSuccess, sendError } from '../utils/response';

export class CategoryController {
  static async getAll(req: Request, res: Response) {
    try {
      const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { products: { where: { isAvailable: true } } },
          },
        },
      });

      const formatted = categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: cat.image,
        icon: cat.icon,
        productCount: cat._count.products,
      }));

      return sendSuccess(res, formatted);
    } catch (error: any) {
      return sendError(res, 'Failed to fetch categories', 500, error.message);
    }
  }

  static async getBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const category = await prisma.category.findUnique({
        where: { slug },
        include: {
          products: {
            where: { isAvailable: true },
            include: {
              farmer: {
                select: {
                  id: true,
                  name: true,
                  city: true,
                  state: true,
                  farmerProfile: true,
                },
              },
            },
          },
        },
      });

      if (!category) {
        return sendError(res, 'Category not found', 404);
      }

      return sendSuccess(res, category);
    } catch (error: any) {
      return sendError(res, 'Failed to fetch category', 500, error.message);
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const { name, description, image, icon } = req.body;
      if (!name) {
        return sendError(res, 'Category name is required', 400);
      }

      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const existing = await prisma.category.findUnique({ where: { slug } });
      if (existing) {
        return sendError(res, 'A category with this name already exists', 400);
      }

      const category = await prisma.category.create({
        data: {
          name,
          slug,
          description,
          image,
          icon,
        },
      });

      return sendSuccess(res, category, 'Category created successfully', 201);
    } catch (error: any) {
      return sendError(res, 'Failed to create category', 500, error.message);
    }
  }
}
