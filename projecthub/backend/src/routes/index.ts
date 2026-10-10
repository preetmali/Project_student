import { Router } from 'express';
import skillRoutes from './skillRoutes';
import profileRoutes from './profileRoutes';
import projectRoutes from './projectRoutes';
import teamRoutes from './teamRoutes';
import joinRequestRoutes from './joinRequestRoutes';
import dashboardRoutes from './dashboardRoutes';

const router = Router();

router.use('/skills', skillRoutes);
router.use('/profile', profileRoutes);
router.use('/projects', projectRoutes);
router.use('/teams', teamRoutes);
router.use('/join-requests', joinRequestRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
