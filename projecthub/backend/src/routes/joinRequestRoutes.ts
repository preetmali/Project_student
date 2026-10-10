import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { JoinRequestController } from '../controllers/joinRequestController';

const router = Router();

router.get('/my', requireAuth, JoinRequestController.getMyJoinRequests);
router.get('/me', requireAuth, JoinRequestController.getMyJoinRequests);

router.post('/:id/accept', requireAuth, JoinRequestController.acceptJoinRequest);
router.post('/:id/reject', requireAuth, JoinRequestController.rejectJoinRequest);
router.post('/:id/cancel', requireAuth, JoinRequestController.cancelJoinRequest);

export default router;
