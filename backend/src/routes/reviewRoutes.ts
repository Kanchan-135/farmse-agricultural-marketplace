import { Router } from 'express';
import { ReviewController } from '../controllers/reviewController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/product/:productId', ReviewController.getProductReviews);
router.post('/', authenticateToken, ReviewController.createReview);

export default router;
