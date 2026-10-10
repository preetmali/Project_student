import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { DashboardService } from '../services/dashboardService';

export class DashboardController {
  public static async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const stats = await DashboardService.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
}
