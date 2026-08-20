import { Router } from 'express';
import { FarmerController } from '../controllers/farmerController';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';

const router = Router();

router.use(authenticateToken, requireRole(['FARMER', 'ADMIN']));

router.get('/dashboard', FarmerController.getDashboardStats);
router.get('/products', FarmerController.getFarmerProducts);
router.get('/orders', FarmerController.getFarmerOrders);
router.patch('/orders/:orderId/status', FarmerController.updateOrderStatus);

export default router;
