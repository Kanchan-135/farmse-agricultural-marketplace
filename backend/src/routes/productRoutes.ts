import { Router } from 'express';
import { ProductController } from '../controllers/productController';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';

const router = Router();

// Public routes
router.get('/', ProductController.getAll);
router.get('/featured', ProductController.getFeatured);
router.get('/:id', ProductController.getById);

// Protected Farmer/Admin routes
router.post('/', authenticateToken, requireRole(['FARMER', 'ADMIN']), ProductController.create);
router.put('/:id', authenticateToken, requireRole(['FARMER', 'ADMIN']), ProductController.update);
router.delete('/:id', authenticateToken, requireRole(['FARMER', 'ADMIN']), ProductController.delete);

export default router;
