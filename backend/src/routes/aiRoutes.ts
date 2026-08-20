import { Router, Request, Response } from 'express';
import { AIService } from '../services/aiService';
import { authenticateToken } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';

const router = Router();

// Future-ready AI endpoint: Crop Recommendations
router.post('/crop-recommendation', authenticateToken, async (req: Request, res: Response) => {
  try {
    const result = await AIService.getCropRecommendations(req.body);
    return sendSuccess(res, result, 'Crop recommendations calculated');
  } catch (error: any) {
    return sendError(res, 'AI service unavailable', 500, error.message);
  }
});

// Future-ready AI endpoint: Price Prediction
router.post('/price-prediction', async (req: Request, res: Response) => {
  try {
    const result = await AIService.predictCropPrice(req.body);
    return sendSuccess(res, result, 'Price trend prediction generated');
  } catch (error: any) {
    return sendError(res, 'AI service unavailable', 500, error.message);
  }
});

// Future-ready AI endpoint: Disease Detection
router.post('/disease-detection', authenticateToken, async (req: Request, res: Response) => {
  try {
    const result = await AIService.detectCropDisease(req.body);
    return sendSuccess(res, result, 'Crop health diagnosis generated');
  } catch (error: any) {
    return sendError(res, 'AI service unavailable', 500, error.message);
  }
});

export default router;
