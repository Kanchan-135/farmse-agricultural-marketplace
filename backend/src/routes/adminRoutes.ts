import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';

const router = Router();

// Protect all /admin routes with JWT authentication and strict ADMIN role check
router.use(authenticateToken, requireRole(['ADMIN']));

// 1. Platform Analytics & Overview
router.get('/stats', AdminController.getPlatformStats);

// 2. User & Customer Management
router.get('/users', AdminController.getUsers);
router.patch('/users/:id/toggle-status', AdminController.toggleUserStatus);
router.delete('/users/:id', AdminController.deleteUser);

// 3. Farmer Verification & Approvals
router.patch('/farmers/:id/toggle-approval', AdminController.toggleFarmerApproval);

// 4. Platform Orders, Status Overrides, Refunds & Disputes
router.get('/orders', AdminController.getAllOrders);
router.get('/orders/:id', AdminController.getOrderById);
router.patch('/orders/:id/status', AdminController.updateOrderStatus);
router.post('/orders/:id/refund', AdminController.handleRefund);

// 5. Moderation & Reviews
router.get('/reviews', AdminController.getAllReviews);
router.delete('/reviews/:id', AdminController.deleteReview);

export default router;
