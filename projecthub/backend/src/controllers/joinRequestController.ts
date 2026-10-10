import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { JoinRequestService } from '../services/joinRequestService';
import { parseBody, createJoinRequestSchema } from '../utils/validate';
import { ProjectService } from '../services/projectService';
import { NotFoundError } from '../utils/errors';

export class JoinRequestController {
  public static async createProjectJoinRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const projectId = req.params.id;
      const requesterId = req.user!.id;
      const data = parseBody(createJoinRequestSchema, req.body);
      const request = await JoinRequestService.createJoinRequest(projectId, requesterId, data.message);
      res.status(201).json(request);
    } catch (error) {
      next(error);
    }
  }

  public static async createTeamJoinRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const teamId = req.params.teamId || req.params.id;
      const requesterId = req.user!.id;
      const data = parseBody(createJoinRequestSchema, req.body);

      // Find project associated with team
      let projectId = req.body.project_id;
      if (!projectId) {
        const teamRes = await ProjectService.getProjects({ page: 1, limit: 100 }, requesterId);
        const match = teamRes.data.find(p => p.team?.id === teamId);
        if (match) {
          projectId = match.id;
        } else {
          throw new NotFoundError('Associated project for team not found.');
        }
      }

      const request = await JoinRequestService.createJoinRequest(projectId, requesterId, data.message);
      res.status(201).json(request);
    } catch (error) {
      next(error);
    }
  }

  public static async getMyJoinRequests(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const requests = await JoinRequestService.getMyJoinRequests(userId);
      res.json(requests);
    } catch (error) {
      next(error);
    }
  }

  public static async getTeamJoinRequests(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const teamId = req.params.id || req.params.teamId;
      const leaderUserId = req.user!.id;
      const requests = await JoinRequestService.getTeamJoinRequests(teamId, leaderUserId);
      res.json(requests);
    } catch (error) {
      next(error);
    }
  }

  public static async acceptJoinRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const requestId = req.params.id;
      const leaderUserId = req.user!.id;
      const accepted = await JoinRequestService.acceptJoinRequest(requestId, leaderUserId);
      res.json({ message: 'Join request accepted.', request: accepted });
    } catch (error) {
      next(error);
    }
  }

  public static async rejectJoinRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const requestId = req.params.id;
      const leaderUserId = req.user!.id;
      const rejected = await JoinRequestService.rejectJoinRequest(requestId, leaderUserId);
      res.json({ message: 'Join request rejected.', request: rejected });
    } catch (error) {
      next(error);
    }
  }

  public static async cancelJoinRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const requestId = req.params.id;
      const requesterUserId = req.user!.id;
      const cancelled = await JoinRequestService.cancelJoinRequest(requestId, requesterUserId);
      res.json({ message: 'Join request cancelled.', request: cancelled });
    } catch (error) {
      next(error);
    }
  }
}
