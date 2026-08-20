import { Router } from 'express';
import { CategoryController } from '../controllers/categoryController';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';

const router = Router();

router.get('/', CategoryController.getAll);
router.get('/:slug', CategoryController.getBySlug);
router.post('/', authenticateToken, requireRole(['ADMIN']), CategoryController.create);
router.put('/:id', authenticateToken, requireRole(['ADMIN']), CategoryController.update);
router.delete('/:id', authenticateToken, requireRole(['ADMIN']), CategoryController.delete);

export default router;
