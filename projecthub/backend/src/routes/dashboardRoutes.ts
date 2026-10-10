import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { DashboardController } from '../controllers/dashboardController';

const router = Router();

router.get('/stats', requireAuth, DashboardController.getStats);

export default router;
