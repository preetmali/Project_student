import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { ProfileController } from '../controllers/profileController';

const router = Router();

router.get('/', requireAuth, ProfileController.getMyProfile);
router.put('/', requireAuth, ProfileController.updateProfile);
router.post('/skills', requireAuth, ProfileController.addSkill);
router.delete('/skills/:id', requireAuth, ProfileController.deleteSkill);

export default router;
