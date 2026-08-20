import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';

const router = Router();

router.use(authenticateToken, requireRole(['ADMIN']));

router.get('/stats', AdminController.getPlatformStats);
router.get('/users', AdminController.getUsers);
router.patch('/users/:id/toggle-status', AdminController.toggleUserStatus);
router.patch('/farmers/:id/toggle-approval', AdminController.toggleFarmerApproval);
router.get('/orders', AdminController.getAllOrders);
router.get('/reviews', AdminController.getAllReviews);
router.delete('/reviews/:id', AdminController.deleteReview);

export default router;
