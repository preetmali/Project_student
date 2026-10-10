import { query, transaction, memoryDb, DbClient } from '../db/db';
import { env } from '../config/env';
import { JoinRequest, JoinRequestStatus } from '../types';
import { NotFoundError, ForbiddenError, AppError, ConflictError } from '../utils/errors';
import { ProjectService } from './projectService';
import { TeamService } from './teamService';

export class JoinRequestService {
  public static async createJoinRequest(
    projectId: string,
    requesterUserId: string,
    message?: string | null
  ): Promise<JoinRequest> {
    const project = await ProjectService.getProjectById(projectId, requesterUserId);

    if (project.owner_id === requesterUserId) {
      throw new AppError('Project owners cannot request to join their own project.', 400);
    }

    if (!project.team) {
      throw new NotFoundError('Team for this project was not found.');
    }

    const teamId = project.team.id;

    if (project.user_is_member) {
      throw new AppError('You are already a member of this team.', 400);
    }

    if ((project.open_positions_count || 0) <= 0) {
      throw new AppError('This team is already full.', 400);
    }

    if (env.DATABASE_URL) {
      // Check existing pending request
      const existingReq = await query(
        `SELECT id FROM join_requests WHERE team_id = $1 AND user_id = $2 AND status = 'pending'`,
        [teamId, requesterUserId]
      );
      if (existingReq.rows.length > 0) {
        throw new ConflictError('You already have a pending join request for this team.');
      }

      const res = await query<JoinRequest>(
        `INSERT INTO join_requests (project_id, team_id, user_id, message, status)
         VALUES ($1, $2, $3, $4, 'pending') RETURNING *`,
        [projectId, teamId, requesterUserId, message || null]
      );
      return res.rows[0];
    }

    // Memory Store
    const existingReq = memoryDb.join_requests.find(
      jr => jr.team_id === teamId && jr.user_id === requesterUserId && jr.status === 'pending'
    );
    if (existingReq) {
      throw new ConflictError('You already have a pending join request for this team.');
    }

    const newReq: JoinRequest = {
      id: `e_${Date.now()}`,
      project_id: projectId,
      team_id: teamId,
      user_id: requesterUserId,
      message: message || null,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    memoryDb.join_requests.push(newReq);
    return newReq;
  }

  public static async getMyJoinRequests(userId: string): Promise<JoinRequest[]> {
    if (env.DATABASE_URL) {
      const res = await query(
        `SELECT jr.*, p.title as project_title, p.category as project_category, t.name as team_name
         FROM join_requests jr
         JOIN projects p ON jr.project_id = p.id
         JOIN teams t ON jr.team_id = t.id
         WHERE jr.user_id = $1
         ORDER BY jr.created_at DESC`,
        [userId]
      );

      const requests: JoinRequest[] = [];
      for (const row of res.rows) {
        const project = await ProjectService.getProjectById(row.project_id, userId).catch(() => undefined);
        requests.push({
          ...row,
          project,
        });
      }
      return requests;
    }

    // Memory Store lookup
    const rawReqs = memoryDb.join_requests.filter(jr => jr.user_id === userId);
    const result: JoinRequest[] = [];

    for (const r of rawReqs) {
      const project = memoryDb.projects.find(p => p.id === r.project_id);
      const team = memoryDb.teams.find(t => t.id === r.team_id);
      result.push({
        ...r,
        project,
        team,
      });
    }

    return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public static async getTeamJoinRequests(teamId: string, leaderUserId: string): Promise<JoinRequest[]> {
    const team = await TeamService.getTeamById(teamId, leaderUserId);
    const isLeader = team.members?.some(
      m => m.user_id === leaderUserId && m.role === 'leader'
    ) || team.created_by === leaderUserId || team.project?.owner_id === leaderUserId;

    if (!isLeader) {
      throw new ForbiddenError('Only the team leader can view join requests.');
    }

    if (env.DATABASE_URL) {
      const res = await query(
        `SELECT jr.*, p.full_name, p.username, p.bio, p.profile_image_url, u.email
         FROM join_requests jr
         JOIN users u ON jr.user_id = u.id
         LEFT JOIN profiles p ON p.user_id = u.id
         WHERE jr.team_id = $1 AND jr.status = 'pending'
         ORDER BY jr.created_at ASC`,
        [teamId]
      );

      return res.rows.map((r: any) => ({
        id: r.id,
        project_id: r.project_id,
        team_id: r.team_id,
        user_id: r.user_id,
        message: r.message,
        status: r.status,
        created_at: r.created_at,
        updated_at: r.updated_at,
        requester_profile: {
          id: r.id,
          user_id: r.user_id,
          full_name: r.full_name || r.email.split('@')[0],
          username: r.username || r.email.split('@')[0],
          bio: r.bio || null,
          profile_image_url: r.profile_image_url || null,
          college: null,
          course: null,
          year: null,
          location: null,
          github_url: null,
          linkedin_url: null,
          portfolio_url: null,
          created_at: r.created_at,
          updated_at: r.updated_at,
        },
      }));
    }

    // Memory Store lookup
    const rawReqs = memoryDb.join_requests.filter(jr => jr.team_id === teamId && jr.status === 'pending');
    return rawReqs.map(r => {
      const requester_profile = memoryDb.profiles.find(p => p.user_id === r.user_id);
      return {
        ...r,
        requester_profile,
      };
    });
  }

  public static async acceptJoinRequest(requestId: string, leaderUserId: string): Promise<JoinRequest> {
    if (env.DATABASE_URL) {
      return transaction(async (client: DbClient) => {
        // 1. Fetch request
        const reqRes = await client.query<any>('SELECT * FROM join_requests WHERE id = $1', [requestId]);
        if (reqRes.rows.length === 0) throw new NotFoundError('Join request not found.');
        const joinReq = reqRes.rows[0];

        if (joinReq.status !== 'pending') {
          throw new AppError(`Cannot accept request with status '${joinReq.status}'.`, 400);
        }

        // 2. Lock & Verify Team Capacity
        const projRes = await client.query<any>('SELECT max_team_size, owner_id FROM projects WHERE id = $1', [
          joinReq.project_id,
        ]);
        const project = projRes.rows[0];

        const teamRes = await client.query<any>('SELECT * FROM teams WHERE id = $1', [joinReq.team_id]);
        const team = teamRes.rows[0];

        const leaderCheck = await client.query<any>(
          `SELECT 1 FROM team_members WHERE team_id = $1 AND user_id = $2 AND role = 'leader'`,
          [joinReq.team_id, leaderUserId]
        );
        const isLeader = leaderCheck.rows.length > 0 || team.created_by === leaderUserId || project.owner_id === leaderUserId;

        if (!isLeader) {
          throw new ForbiddenError('Only the team leader can accept join requests.');
        }

        const countRes = await client.query<{ count: string }>(
          'SELECT COUNT(*) FROM team_members WHERE team_id = $1',
          [joinReq.team_id]
        );
        const currentCount = parseInt(countRes.rows[0]?.count || '0', 10);

        if (currentCount >= project.max_team_size) {
          throw new AppError('This team is already full.', 400);
        }

        // 3. Add to Team Members
        await client.query(
          `INSERT INTO team_members (team_id, user_id, role) 
           VALUES ($1, $2, 'member') 
           ON CONFLICT (team_id, user_id) DO NOTHING`,
          [joinReq.team_id, joinReq.user_id]
        );

        // 4. Update Request Status to Accepted
        const updateRes = await client.query<JoinRequest>(
          `UPDATE join_requests SET status = 'accepted', updated_at = NOW() WHERE id = $1 RETURNING *`,
          [requestId]
        );

        return updateRes.rows[0];
      });
    }

    // Memory Store Accept
    const req = memoryDb.join_requests.find(jr => jr.id === requestId);
    if (!req) throw new NotFoundError('Join request not found.');
    if (req.status !== 'pending') throw new AppError(`Cannot accept request with status '${req.status}'.`, 400);

    const team = memoryDb.teams.find(t => t.id === req.team_id);
    if (!team) throw new NotFoundError('Team not found.');
    const project = memoryDb.projects.find(p => p.id === req.project_id);
    if (!project) throw new NotFoundError('Project not found.');

    const isLeader = memoryDb.team_members.some(
      tm => tm.team_id === team.id && tm.user_id === leaderUserId && tm.role === 'leader'
    ) || team.created_by === leaderUserId || project.owner_id === leaderUserId;

    if (!isLeader) throw new ForbiddenError('Only the team leader can accept join requests.');

    const currentCount = memoryDb.team_members.filter(tm => tm.team_id === team.id).length;
    if (currentCount >= project.max_team_size) {
      throw new AppError('This team is already full.', 400);
    }

    const isAlreadyMember = memoryDb.team_members.some(tm => tm.team_id === team.id && tm.user_id === req.user_id);
    if (!isAlreadyMember) {
      memoryDb.team_members.push({
        id: `tm_${Date.now()}`,
        team_id: team.id,
        user_id: req.user_id,
        role: 'member',
        joined_at: new Date().toISOString(),
      });
    }

    req.status = 'accepted';
    req.updated_at = new Date().toISOString();
    return req;
  }

  public static async rejectJoinRequest(requestId: string, leaderUserId: string): Promise<JoinRequest> {
    if (env.DATABASE_URL) {
      const reqRes = await query('SELECT * FROM join_requests WHERE id = $1', [requestId]);
      if (reqRes.rows.length === 0) throw new NotFoundError('Join request not found.');
      const joinReq = reqRes.rows[0];

      if (joinReq.status !== 'pending') {
        throw new AppError(`Cannot reject request with status '${joinReq.status}'.`, 400);
      }

      const team = await TeamService.getTeamById(joinReq.team_id, leaderUserId);
      const isLeader = team.members?.some(
        m => m.user_id === leaderUserId && m.role === 'leader'
      ) || team.created_by === leaderUserId || team.project?.owner_id === leaderUserId;

      if (!isLeader) throw new ForbiddenError('Only the team leader can reject join requests.');

      const updateRes = await query<JoinRequest>(
        `UPDATE join_requests SET status = 'rejected', updated_at = NOW() WHERE id = $1 RETURNING *`,
        [requestId]
      );
      return updateRes.rows[0];
    }

    // Memory Store Reject
    const req = memoryDb.join_requests.find(jr => jr.id === requestId);
    if (!req) throw new NotFoundError('Join request not found.');
    if (req.status !== 'pending') throw new AppError(`Cannot reject request with status '${req.status}'.`, 400);

    const team = memoryDb.teams.find(t => t.id === req.team_id);
    const project = memoryDb.projects.find(p => p.id === req.project_id);
    const isLeader = team && (
      memoryDb.team_members.some(tm => tm.team_id === team.id && tm.user_id === leaderUserId && tm.role === 'leader') ||
      team.created_by === leaderUserId ||
      project?.owner_id === leaderUserId
    );

    if (!isLeader) throw new ForbiddenError('Only the team leader can reject join requests.');

    req.status = 'rejected';
    req.updated_at = new Date().toISOString();
    return req;
  }

  public static async cancelJoinRequest(requestId: string, requesterUserId: string): Promise<JoinRequest> {
    if (env.DATABASE_URL) {
      const reqRes = await query('SELECT * FROM join_requests WHERE id = $1', [requestId]);
      if (reqRes.rows.length === 0) throw new NotFoundError('Join request not found.');
      const joinReq = reqRes.rows[0];

      if (joinReq.user_id !== requesterUserId) {
        throw new ForbiddenError('You can only cancel your own pending request.');
      }

      if (joinReq.status !== 'pending') {
        throw new AppError('Only pending requests can be cancelled.', 400);
      }

      const updateRes = await query<JoinRequest>(
        `UPDATE join_requests SET status = 'cancelled', updated_at = NOW() WHERE id = $1 RETURNING *`,
        [requestId]
      );
      return updateRes.rows[0];
    }

    // Memory Store Cancel
    const req = memoryDb.join_requests.find(jr => jr.id === requestId);
    if (!req) throw new NotFoundError('Join request not found.');
    if (req.user_id !== requesterUserId) throw new ForbiddenError('You can only cancel your own pending request.');
    if (req.status !== 'pending') throw new AppError('Only pending requests can be cancelled.', 400);

    req.status = 'cancelled';
    req.updated_at = new Date().toISOString();
    return req;
  }
}
