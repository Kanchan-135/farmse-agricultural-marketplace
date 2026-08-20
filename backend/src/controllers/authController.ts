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
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  // Farmer specific fields
  farmName: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  farmSizeAcres: z.number().optional(),
  experienceYears: z.number().optional(),
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
        where: { email: data.email.toLowerCase() },
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

      // Create user and profile in transaction
      const newUser = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: data.email.toLowerCase(),
            password: hashedPassword,
            name: data.name,
            role: assignedRole,
            phone: data.phone,
            address: data.address,
            city: data.city,
            state: data.state,
            pincode: data.pincode,
            isApproved: assignedRole === 'FARMER' ? true : true, // Set to true for quick start, admin can suspend
          },
        });

        if (assignedRole === 'FARMER') {
          await tx.farmerProfile.create({
            data: {
              userId: user.id,
              farmName: data.farmName || `${user.name}'s Farm`,
              bio: data.bio || 'Dedicated to fresh, sustainable agricultural produce direct from farm.',
              location: data.location || data.city || 'Local Farm',
              state: data.state || 'India',
              farmSizeAcres: data.farmSizeAcres || 5,
              experienceYears: data.experienceYears || 3,
              isVerified: true,
            },
          });
        } else if (assignedRole === 'CUSTOMER') {
          await tx.customerProfile.create({
            data: {
              userId: user.id,
              defaultAddress: data.address || '',
            },
          });
        }

        // Initialize empty Cart & Wishlist
        await tx.cart.create({ data: { userId: user.id } });
        await tx.wishlist.create({ data: { userId: user.id } });

        return user;
      });

      // Fetch user with profile
      const userProfile = await prisma.user.findUnique({
        where: { id: newUser.id },
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
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        isApproved: newUser.isApproved,
        isActive: newUser.isActive,
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
      if (error instanceof z.ZodError) {
        return sendError(res, error.errors[0]?.message || 'Validation error', 400, error.errors);
      }
      return sendError(res, 'Failed to register account', 500, error.message);
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const data = loginSchema.parse(req.body);

      const user = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase() },
        include: {
          farmerProfile: true,
          customerProfile: true,
        },
      });

      if (!user) {
        return sendError(res, 'Invalid email or password', 401);
      }

      if (!user.isActive) {
        return sendError(res, 'Your account is deactivated. Please contact support.', 403);
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

      const { password, ...safeUser } = user;

      return sendSuccess(
        res,
        {
          token,
          user: safeUser,
        },
        'Logged in successfully'
      );
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return sendError(res, error.errors[0]?.message || 'Validation error', 400);
      }
      return sendError(res, 'Failed to log in', 500, error.message);
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
          updatedAt: true,
        },
      });

      if (!user) {
        return sendError(res, 'User not found', 404);
      }

      return sendSuccess(res, user);
    } catch (error: any) {
      return sendError(res, 'Failed to retrieve profile', 500, error.message);
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
        address,
        city,
        state,
        pincode,
        avatar,
        // Farmer profile updates
        farmName,
        bio,
        location,
        farmSizeAcres,
        experienceYears,
      } = req.body;

      const updatedUser = await prisma.$transaction(async (tx) => {
        const user = await tx.user.update({
          where: { id: req.user!.id },
          data: {
            name: name !== undefined ? name : undefined,
            phone: phone !== undefined ? phone : undefined,
            address: address !== undefined ? address : undefined,
            city: city !== undefined ? city : undefined,
            state: state !== undefined ? state : undefined,
            pincode: pincode !== undefined ? pincode : undefined,
            avatar: avatar !== undefined ? avatar : undefined,
          },
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
          },
        });

        if (req.user!.role === 'FARMER' && (farmName || bio || location || farmSizeAcres || experienceYears)) {
          await tx.farmerProfile.upsert({
            where: { userId: req.user!.id },
            update: {
              farmName: farmName !== undefined ? farmName : undefined,
              bio: bio !== undefined ? bio : undefined,
              location: location !== undefined ? location : undefined,
              farmSizeAcres: farmSizeAcres !== undefined ? Number(farmSizeAcres) : undefined,
              experienceYears: experienceYears !== undefined ? Number(experienceYears) : undefined,
            },
            create: {
              userId: req.user!.id,
              farmName: farmName || `${user.name}'s Farm`,
              bio: bio || '',
              location: location || city || 'Local Farm',
              farmSizeAcres: farmSizeAcres ? Number(farmSizeAcres) : 5,
              experienceYears: experienceYears ? Number(experienceYears) : 3,
            },
          });
        }

        return user;
      });

      return sendSuccess(res, updatedUser, 'Profile updated successfully');
    } catch (error: any) {
      return sendError(res, 'Failed to update profile', 500, error.message);
    }
  }

  static async changePassword(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 401);
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword || newPassword.length < 6) {
        return sendError(res, 'New password must be at least 6 characters', 400);
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
      });

      if (!user) {
        return sendError(res, 'User not found', 404);
      }

      const isMatch = await comparePassword(currentPassword, user.password);
      if (!isMatch) {
        return sendError(res, 'Incorrect current password', 400);
      }

      const hashedNew = await hashPassword(newPassword);
      await prisma.user.update({
        where: { id: req.user.id },
        data: { password: hashedNew },
      });

      return sendSuccess(res, null, 'Password updated successfully');
    } catch (error: any) {
      return sendError(res, 'Failed to change password', 500, error.message);
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;
    if (!email) {
      return sendError(res, 'Please provide your email address', 400);
    }
    // Simulation / token generation for password reset
    return sendSuccess(
      res,
      { resetToken: `RST_${Date.now()}` },
      'If an account with this email exists, a password reset link has been dispatched.'
    );
  }
}
