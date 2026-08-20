import { Router, Response } from 'express';
import { upload } from '../middleware/upload';
import { authenticateToken } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';

const router = Router();

router.post(
  '/',
  authenticateToken,
  upload.single('file'),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.file) {
        return sendError(res, 'No file uploaded', 400);
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      return sendSuccess(res, { url: fileUrl, filename: req.file.filename }, 'File uploaded successfully');
    } catch (error: any) {
      return sendError(res, 'Failed to upload file', 500, error.message);
    }
  }
);

router.post(
  '/multiple',
  authenticateToken,
  upload.array('files', 5),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const files = (req.files as Express.Multer.File[]) || [];
      if (files.length === 0) {
        return sendError(res, 'No files uploaded', 400);
      }

      const urls = files.map((file) => `/uploads/${file.filename}`);
      return sendSuccess(res, { urls }, 'Files uploaded successfully');
    } catch (error: any) {
      return sendError(res, 'Failed to upload files', 500, error.message);
    }
  }
);

export default router;
