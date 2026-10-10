import { Router } from 'express';
import { SkillController } from '../controllers/skillController';

const router = Router();

router.get('/', SkillController.getAllSkills);

export default router;
