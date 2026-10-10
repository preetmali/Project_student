import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { TeamController } from '../controllers/teamController';
import { JoinRequestController } from '../controllers/joinRequestController';

const router = Router();

router.get('/:id', requireAuth, TeamController.getTeamById);
router.get('/:id/members', requireAuth, TeamController.getTeamMembers);
router.delete('/:teamId/members/:userId', requireAuth, TeamController.removeTeamMember);
router.delete('/:id/members/:userId', requireAuth, TeamController.removeTeamMember);

router.get('/:id/join-requests', requireAuth, JoinRequestController.getTeamJoinRequests);
router.post('/:id/join-requests', requireAuth, JoinRequestController.createTeamJoinRequest);

export default router;
