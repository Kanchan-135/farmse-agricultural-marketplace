import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', NotificationController.getMyNotifications);
router.patch('/:id/read', NotificationController.markAsRead);

export default router;
