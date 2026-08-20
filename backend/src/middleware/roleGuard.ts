import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, Role } from '../types';
import { sendError } from '../utils/response';

export const requireRole = (allowedRoles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    if (!allowedRoles.includes(req.user.role as Role)) {
      return sendError(
        res,
        `Access denied. Requires one of the following roles: ${allowedRoles.join(', ')}`,
        403
      );
    }

    next();
  };
};

export const requireApprovedFarmer = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return sendError(res, 'Authentication required', 401);
  }

  if (req.user.role !== 'FARMER' && req.user.role !== 'ADMIN') {
    return sendError(res, 'Access restricted to approved Farmers only', 403);
  }

  if (req.user.role === 'FARMER' && !req.user.isApproved) {
    return sendError(
      res,
      'Your Farmer profile is pending administrator approval before you can list products.',
      403
    );
  }

  next();
};
