import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { ProfileService } from '../services/profileService';
import { parseBody, profileUpdateSchema, addSkillSchema } from '../utils/validate';

export class ProfileController {
  public static async getMyProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const profile = await ProfileService.getProfileByUserId(userId);
      res.json(profile);
    } catch (error) {
      next(error);
    }
  }

  public static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const data = parseBody(profileUpdateSchema, req.body);
      const updated = await ProfileService.updateProfile(userId, data);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  }

  public static async addSkill(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const data = parseBody(addSkillSchema, req.body);
      const added = await ProfileService.addUserSkill(userId, data);
      res.status(201).json(added);
    } catch (error) {
      next(error);
    }
  }

  public static async deleteSkill(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const skillId = req.params.id;
      await ProfileService.deleteUserSkill(userId, skillId);
      res.json({ message: 'Skill removed successfully.' });
    } catch (error) {
      next(error);
    }
  }
}
