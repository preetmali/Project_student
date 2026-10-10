import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { ProjectController } from '../controllers/projectController';
import { TeamController } from '../controllers/teamController';
import { JoinRequestController } from '../controllers/joinRequestController';

const router = Router();

router.get('/', requireAuth, ProjectController.getProjects);
router.post('/', requireAuth, ProjectController.createProject);

router.get('/my', requireAuth, ProjectController.getMyProjects);
router.get('/me', requireAuth, ProjectController.getMyProjects);

router.get('/:id', requireAuth, ProjectController.getProjectById);
router.put('/:id', requireAuth, ProjectController.updateProject);
router.patch('/:id', requireAuth, ProjectController.updateProject);
router.delete('/:id', requireAuth, ProjectController.deleteProject);

router.get('/:id/team', requireAuth, TeamController.getTeamById);
router.post('/:id/join-request', requireAuth, JoinRequestController.createProjectJoinRequest);

export default router;
