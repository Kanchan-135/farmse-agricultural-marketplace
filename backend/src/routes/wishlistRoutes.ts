import { Router } from 'express';
import { WishlistController } from '../controllers/wishlistController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', WishlistController.getWishlist);
router.post('/toggle', WishlistController.toggle);

export default router;
