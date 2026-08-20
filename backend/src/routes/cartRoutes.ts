import { Router } from 'express';
import { CartController } from '../controllers/cartController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', CartController.getCart);
router.post('/items', CartController.addItem);
router.put('/items/:itemId', CartController.updateItem);
router.delete('/items/:itemId', CartController.removeItem);
router.delete('/', CartController.clearCart);

export default router;
