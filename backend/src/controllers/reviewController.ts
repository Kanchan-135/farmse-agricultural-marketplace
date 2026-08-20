import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../models/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export const reviewSchema = z.object({
  productId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export class ReviewController {
  static async createReview(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 401);
      }

      const data = reviewSchema.parse(req.body);

      // Check if product exists
      const product = await prisma.product.findUnique({
        where: { id: data.productId },
      });

      if (!product) {
        return sendError(res, 'Product not found', 404);
      }

      // Check if customer has already reviewed this product
      const existingReview = await prisma.review.findFirst({
        where: {
          productId: data.productId,
          customerId: req.user.id,
        },
      });

      let review;
      if (existingReview) {
        review = await prisma.review.update({
          where: { id: existingReview.id },
          data: {
            rating: data.rating,
            comment: data.comment,
          },
        });
      } else {
        review = await prisma.review.create({
          data: {
            productId: data.productId,
            customerId: req.user.id,
            rating: data.rating,
            comment: data.comment,
          },
        });
      }

      // Recalculate average rating for product
      const allReviews = await prisma.review.findMany({
        where: { productId: data.productId },
        select: { rating: true },
      });

      const avgRating =
        allReviews.reduce((sum, r) => sum + r.rating, 0) / (allReviews.length || 1);

      await prisma.product.update({
        where: { id: data.productId },
        data: {
          rating: parseFloat(avgRating.toFixed(1)),
          reviewCount: allReviews.length,
        },
      });

      // Also recalculate farmer's overall rating
      const farmerProducts = await prisma.product.findMany({
        where: { farmerId: product.farmerId, reviewCount: { gt: 0 } },
        select: { rating: true, reviewCount: true },
      });

      if (farmerProducts.length > 0) {
        const totalScore = farmerProducts.reduce((acc, p) => acc + p.rating * p.reviewCount, 0);
        const totalReviews = farmerProducts.reduce((acc, p) => acc + p.reviewCount, 0);
        const farmerAvg = totalReviews > 0 ? totalScore / totalReviews : 5.0;

        await prisma.farmerProfile.updateMany({
          where: { userId: product.farmerId },
          data: { rating: parseFloat(farmerAvg.toFixed(1)) },
        });
      }

      return sendSuccess(res, review, 'Thank you! Your review has been published.', 201);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return sendError(res, error.errors[0]?.message || 'Validation error', 400);
      }
      return sendError(res, 'Failed to submit review', 500, error.message);
    }
  }

  static async getProductReviews(req: Request, res: Response) {
    try {
      const { productId } = req.params;

      const reviews = await prisma.review.findMany({
        where: { productId },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              avatar: true,
              city: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return sendSuccess(res, reviews);
    } catch (error: any) {
      return sendError(res, 'Failed to fetch reviews', 500, error.message);
    }
  }
}
