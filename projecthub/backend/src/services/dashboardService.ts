import { query, memoryDb } from '../db/db';
import { env } from '../config/env';
import { DashboardStats } from '../types';

export class DashboardService {
  public static async getUserStats(userId: string): Promise<DashboardStats> {
    if (env.DATABASE_URL) {
      // 1. Projects Created
      const createdRes = await query<{ count: string }>(
        'SELECT COUNT(*) FROM projects WHERE owner_id = $1',
        [userId]
      );
      const totalProjectsCreated = parseInt(createdRes.rows[0]?.count || '0', 10);

      // 2. Projects In Progress
      const progressRes = await query<{ count: string }>(
        `SELECT COUNT(*) FROM projects p 
         JOIN teams t ON t.project_id = p.id
         JOIN team_members tm ON tm.team_id = t.id
         WHERE tm.user_id = $1 AND p.status = 'in_progress'`,
        [userId]
      );
      const projectsInProgress = parseInt(progressRes.rows[0]?.count || '0', 10);

      // 3. Team Memberships
      const teamsRes = await query<{ count: string }>(
        'SELECT COUNT(*) FROM team_members WHERE user_id = $1',
        [userId]
      );
      const teamMemberships = parseInt(teamsRes.rows[0]?.count || '0', 10);

      // 4. Pending Join Requests
      const pendingRes = await query<{ count: string }>(
        `SELECT COUNT(*) FROM join_requests WHERE user_id = $1 AND status = 'pending'`,
        [userId]
      );
      const pendingJoinRequests = parseInt(pendingRes.rows[0]?.count || '0', 10);

      // 5. Open Positions in user's owned projects
      const ownedProjsRes = await query<{ id: string; max_team_size: number }>(
        'SELECT id, max_team_size FROM projects WHERE owner_id = $1',
        [userId]
      );
      let openTeamPositions = 0;
      for (const p of ownedProjsRes.rows) {
        const mCountRes = await query<{ count: string }>(
          `SELECT COUNT(*) FROM team_members tm JOIN teams t ON tm.team_id = t.id WHERE t.project_id = $1`,
          [p.id]
        );
        const mCount = parseInt(mCountRes.rows[0]?.count || '0', 10);
        openTeamPositions += Math.max(0, p.max_team_size - mCount);
      }

      return {
        totalProjectsCreated,
        projectsInProgress,
        teamMemberships,
        pendingJoinRequests,
        openTeamPositions,
      };
    }

    // Memory Store Calculation
    const totalProjectsCreated = memoryDb.projects.filter(p => p.owner_id === userId).length;

    const myTeamIds = memoryDb.team_members.filter(tm => tm.user_id === userId).map(tm => tm.team_id);
    const myProjIds = memoryDb.teams.filter(t => myTeamIds.includes(t.id)).map(t => t.project_id);
    const projectsInProgress = memoryDb.projects.filter(
      p => myProjIds.includes(p.id) && p.status === 'in_progress'
    ).length;

    const teamMemberships = myTeamIds.length;
    const pendingJoinRequests = memoryDb.join_requests.filter(
      jr => jr.user_id === userId && jr.status === 'pending'
    ).length;

    const ownedProjects = memoryDb.projects.filter(p => p.owner_id === userId);
    let openTeamPositions = 0;
    for (const p of ownedProjects) {
      const team = memoryDb.teams.find(t => t.project_id === p.id);
      const mCount = team ? memoryDb.team_members.filter(tm => tm.team_id === team.id).length : 0;
      openTeamPositions += Math.max(0, p.max_team_size - mCount);
    }

    return {
      totalProjectsCreated,
      projectsInProgress,
      teamMemberships,
      pendingJoinRequests,
      openTeamPositions,
    };
  }
}
