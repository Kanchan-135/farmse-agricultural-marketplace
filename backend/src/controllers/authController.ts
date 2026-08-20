import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../models/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name is required'),
  role: z.enum(['CUSTOMER', 'FARMER', 'ADMIN']).default('CUSTOMER'),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  pincode: z.string().optional().nullable(),
  // Farmer specific fields
  farmName: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  farmSizeAcres: z.union([z.number(), z.string()]).optional().nullable(),
  experienceYears: z.union([z.number(), z.string()]).optional().nullable(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const data = registerSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase().trim() },
      });

      if (existingUser) {
        return sendError(res, 'An account with this email already exists', 400);
      }

      const hashedPassword = await hashPassword(data.password);

      // Role check: If registering as ADMIN via public API, deny unless no admin exists
      let assignedRole = data.role;
      if (assignedRole === 'ADMIN') {
        const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
        if (adminCount > 0) {
          assignedRole = 'CUSTOMER'; // Prevent unauthorized admin self-promotion
        }
      }

      // Create user
      const user = await prisma.user.create({
        data: {
          email: data.email.toLowerCase().trim(),
          password: hashedPassword,
          name: data.name.trim(),
          role: assignedRole,
          phone: data.phone || null,
          address: data.address || null,
          city: data.city || null,
          state: data.state || null,
          pincode: data.pincode || null,
          isApproved: true,
        },
      });

      // Create associated profile based on role
      if (assignedRole === 'FARMER') {
        await prisma.farmerProfile.create({
          data: {
            userId: user.id,
            farmName: data.farmName || `${user.name}'s Farm`,
            bio: data.bio || 'Dedicated to fresh, sustainable agricultural produce direct from farm.',
            location: data.location || data.city || 'Local Farm',
            state: data.state || 'India',
            farmSizeAcres: data.farmSizeAcres ? Number(data.farmSizeAcres) : 5,
            experienceYears: data.experienceYears ? Number(data.experienceYears) : 3,
            isVerified: true,
          },
        });
      } else {
        await prisma.customerProfile.create({
          data: {
            userId: user.id,
            defaultAddress: data.address || '',
          },
        });
      }

      // Initialize empty Cart & Wishlist
      try {
        await prisma.cart.create({ data: { userId: user.id } });
      } catch (err) {
        console.warn('[Register] Cart creation notice:', err);
      }

      try {
        await prisma.wishlist.create({ data: { userId: user.id } });
      } catch (err) {
        console.warn('[Register] Wishlist creation notice:', err);
      }

      // Fetch user with profile
      const userProfile = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          phone: true,
          avatar: true,
          address: true,
          city: true,
          state: true,
          pincode: true,
          isActive: true,
          isApproved: true,
          farmerProfile: true,
          customerProfile: true,
          createdAt: true,
        },
      });

      const token = generateToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isApproved: user.isApproved,
        isActive: user.isActive,
      });

      return sendSuccess(
        res,
        {
          token,
          user: userProfile,
        },
        'Registration successful! Welcome to FarmSe.',
        201
      );
    } catch (error: any) {
      console.error('[Registration Error Details]:', error);

      if (error instanceof z.ZodError) {
        const validationMsg = error.errors[0]?.message || 'Validation error';
        return sendError(res, validationMsg, 400, error.errors);
      }

      // Handle Prisma Unique Constraint error (P2002)
      if (error.code === 'P2002') {
        const target = Array.isArray(error.meta?.target) ? error.meta.target.join(', ') : 'email';
        return sendError(res, `An account with this ${target} already exists`, 400);
      }

      const errorMessage = error.message || 'Failed to register account';
      return sendError(res, errorMessage, 500, error.message);
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const data = loginSchema.parse(req.body);

      const user = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase().trim() },
        include: {
          farmerProfile: true,
          customerProfile: true,
        },
      });

      if (!user) {
        return sendError(res, 'Invalid email or password', 401);
      }

      if (!user.isActive) {
        return sendError(res, 'Your account has been deactivated. Please contact support.', 403);
      }

      const isPasswordValid = await comparePassword(data.password, user.password);
      if (!isPasswordValid) {
        return sendError(res, 'Invalid email or password', 401);
      }

      const token = generateToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isApproved: user.isApproved,
        isActive: user.isActive,
      });

      const { password, ...userWithoutPassword } = user;

      return sendSuccess(
        res,
        {
          token,
          user: userWithoutPassword,
        },
        'Login successful'
      );
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return sendError(res, error.errors[0]?.message || 'Validation error', 400, error.errors);
      }
      return sendError(res, 'Failed to login', 500, error.message);
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 401);
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          phone: true,
          avatar: true,
          address: true,
          city: true,
          state: true,
          pincode: true,
          isActive: true,
          isApproved: true,
          farmerProfile: true,
          customerProfile: true,
          createdAt: true,
        },
      });

      if (!user) {
        return sendError(res, 'User not found', 404);
      }

      return sendSuccess(res, user);
    } catch (error: any) {
      return sendError(res, 'Failed to fetch user profile', 500, error.message);
    }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 401);
      }

      const {
        name,
        phone,
        avatar,
        address,
        city,
        state,
        pincode,
        // Farmer profile
        farmName,
        bio,
        location,
        farmSizeAcres,
        experienceYears,
        bankAccount,
        ifscCode,
        // Customer profile
        preferredLanguage,
        defaultAddress,
      } = req.body;

      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          name: name ? name.trim() : undefined,
          phone: phone !== undefined ? phone : undefined,
          avatar: avatar !== undefined ? avatar : undefined,
          address: address !== undefined ? address : undefined,
          city: city !== undefined ? city : undefined,
          state: state !== undefined ? state : undefined,
          pincode: pincode !== undefined ? pincode : undefined,
        },
      });

      if (req.user.role === 'FARMER' && (farmName || bio || location || farmSizeAcres || experienceYears || bankAccount || ifscCode)) {
        await prisma.farmerProfile.upsert({
          where: { userId: req.user.id },
          create: {
            userId: req.user.id,
            farmName: farmName || `${updatedUser.name}'s Farm`,
            bio,
            location: location || city || 'Local Farm',
            state: state || 'India',
            farmSizeAcres: farmSizeAcres ? Number(farmSizeAcres) : undefined,
            experienceYears: experienceYears ? Number(experienceYears) : undefined,
            bankAccount,
            ifscCode,
          },
          update: {
            farmName,
            bio,
            location,
            state,
            farmSizeAcres: farmSizeAcres ? Number(farmSizeAcres) : undefined,
            experienceYears: experienceYears ? Number(experienceYears) : undefined,
            bankAccount,
            ifscCode,
          },
        });
      } else if (req.user.role === 'CUSTOMER' && (preferredLanguage || defaultAddress)) {
        await prisma.customerProfile.upsert({
          where: { userId: req.user.id },
          create: {
            userId: req.user.id,
            preferredLanguage: preferredLanguage || 'English',
            defaultAddress: defaultAddress || address,
          },
          update: {
            preferredLanguage,
            defaultAddress,
          },
        });
      }

      const fullUser = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          phone: true,
          avatar: true,
          address: true,
          city: true,
          state: true,
          pincode: true,
          isActive: true,
          isApproved: true,
          farmerProfile: true,
          customerProfile: true,
          createdAt: true,
        },
      });

      return sendSuccess(res, fullUser, 'Profile updated successfully');
    } catch (error: any) {
      console.error('[Update Profile Error]:', error);
      return sendError(res, 'Failed to update profile', 500, error.message);
    }
  }

  static async changePassword(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 401);
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return sendError(res, 'Current password and new password are required', 400);
      }

      if (newPassword.length < 6) {
        return sendError(res, 'New password must be at least 6 characters', 400);
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
      });

      if (!user) {
        return sendError(res, 'User not found', 404);
      }

      const isCurrentValid = await comparePassword(currentPassword, user.password);
      if (!isCurrentValid) {
        return sendError(res, 'Current password is incorrect', 400);
      }

      const hashedNewPassword = await hashPassword(newPassword);

      await prisma.user.update({
        where: { id: req.user.id },
        data: { password: hashedNewPassword },
      });

      return sendSuccess(res, null, 'Password changed successfully');
    } catch (error: any) {
      return sendError(res, 'Failed to change password', 500, error.message);
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) {
        return sendError(res, 'Email is required', 400);
      }

      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });

      if (!user) {
        // Return success even if user not found for security
        return sendSuccess(res, null, 'If this email is registered, password reset instructions have been sent.');
      }

      // Demo/MVP: Return success message
      return sendSuccess(res, null, 'Password reset instructions have been sent to your email address.');
    } catch (error: any) {
      return sendError(res, 'Failed to process password reset', 500, error.message);
    }
  }
}
