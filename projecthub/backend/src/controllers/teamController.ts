import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { TeamService } from '../services/teamService';

export class TeamController {
  public static async getTeamById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const teamId = req.params.id;
      const currentUserId = req.user?.id;
      const team = await TeamService.getTeamById(teamId, currentUserId);
      res.json(team);
    } catch (error) {
      next(error);
    }
  }

  public static async getTeamMembers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const teamId = req.params.id;
      const members = await TeamService.getTeamMembers(teamId);
      res.json(members);
    } catch (error) {
      next(error);
    }
  }

  public static async removeTeamMember(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const teamId = req.params.teamId || req.params.id;
      const userIdToRemove = req.params.userId;
      const requesterUserId = req.user!.id;
      await TeamService.removeTeamMember(teamId, userIdToRemove, requesterUserId);
      res.json({ message: 'Team member removed successfully.' });
    } catch (error) {
      next(error);
    }
  }
}
