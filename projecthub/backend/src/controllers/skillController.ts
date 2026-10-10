import { Request, Response, NextFunction } from 'express';
import { SkillService } from '../services/skillService';

export class SkillController {
  public static async getAllSkills(req: Request, res: Response, next: NextFunction) {
    try {
      const skills = await SkillService.getAllSkills();
      res.json(skills);
    } catch (error) {
      next(error);
    }
  }
}
