import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthUser } from '../types';

export const generateToken = (user: AuthUser): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      isApproved: user.isApproved,
      isActive: user.isActive,
    },
    config.jwtSecret,
    {
      expiresIn: config.jwtExpiresIn as any,
    }
  );
};

export const verifyToken = (token: string): AuthUser | null => {
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthUser;
    return decoded;
  } catch (error) {
    return null;
  }
};
