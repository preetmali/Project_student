import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { ProjectService } from '../services/projectService';
import {
  parseBody,
  createProjectSchema,
  updateProjectSchema,
  paginationQuerySchema,
} from '../utils/validate';

export class ProjectController {
  public static async createProject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const ownerId = req.user!.id;
      const data = parseBody(createProjectSchema, req.body);
      const project = await ProjectService.createProject(ownerId, data);
      res.status(201).json(project);
    } catch (error) {
      next(error);
    }
  }

  public static async getProjects(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const currentUserId = req.user?.id;
      const queryParams = parseBody(paginationQuerySchema, req.query);
      const result = await ProjectService.getProjects(queryParams, currentUserId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  public static async getMyProjects(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await ProjectService.getMyProjects(userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  public static async getProjectById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const projectId = req.params.id;
      const currentUserId = req.user?.id;
      const project = await ProjectService.getProjectById(projectId, currentUserId);
      res.json(project);
    } catch (error) {
      next(error);
    }
  }

  public static async updateProject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const ownerId = req.user!.id;
      const projectId = req.params.id;
      const data = parseBody(updateProjectSchema, req.body);
      const updated = await ProjectService.updateProject(projectId, ownerId, data);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  }

  public static async deleteProject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const ownerId = req.user!.id;
      const projectId = req.params.id;
      await ProjectService.deleteProject(projectId, ownerId);
      res.json({ message: 'Project deleted successfully.' });
    } catch (error) {
      next(error);
    }
  }
}
