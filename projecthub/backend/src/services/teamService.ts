import { query, memoryDb } from '../db/db';
import { env } from '../config/env';
import { Team, TeamMember, Profile } from '../types';
import { NotFoundError, ForbiddenError, AppError } from '../utils/errors';
import { ProjectService } from './projectService';

export class TeamService {
  public static async getTeamById(teamId: string, currentUserId?: string): Promise<Team> {
    if (env.DATABASE_URL) {
      const teamRes = await query('SELECT * FROM teams WHERE id = $1', [teamId]);
      if (teamRes.rows.length === 0) {
        throw new NotFoundError('Team not found.');
      }
      const team = teamRes.rows[0];
      const project = await ProjectService.getProjectById(team.project_id, currentUserId);
      const members = await this.getTeamMembers(teamId);

      const currentCount = members.length;
      const maxCapacity = project.max_team_size;

      return {
        ...team,
        project,
        members,
        current_members_count: currentCount,
        max_team_size: maxCapacity,
        open_positions_count: Math.max(0, maxCapacity - currentCount),
      };
    }

    // Memory Store lookup
    const team = memoryDb.teams.find(t => t.id === teamId);
    if (!team) {
      throw new NotFoundError('Team not found.');
    }
    const project = await ProjectService.getProjectById(team.project_id, currentUserId);
    const members = await this.getTeamMembers(teamId);

    const currentCount = members.length;
    const maxCapacity = project.max_team_size;

    return {
      ...team,
      project,
      members,
      current_members_count: currentCount,
      max_team_size: maxCapacity,
      open_positions_count: Math.max(0, maxCapacity - currentCount),
    };
  }

  public static async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    if (env.DATABASE_URL) {
      const res = await query(
        `SELECT tm.*, p.full_name, p.username, p.bio, p.profile_image_url, p.college, p.course, p.year, u.email 
         FROM team_members tm
         JOIN users u ON tm.user_id = u.id
         LEFT JOIN profiles p ON p.user_id = u.id
         WHERE tm.team_id = $1
         ORDER BY (CASE WHEN tm.role = 'leader' THEN 1 ELSE 2 END), tm.joined_at ASC`,
        [teamId]
      );

      return res.rows.map((r: any) => ({
        id: r.id,
        team_id: r.team_id,
        user_id: r.user_id,
        role: r.role,
        joined_at: r.joined_at,
        profile: {
          id: r.id,
          user_id: r.user_id,
          full_name: r.full_name || r.email.split('@')[0],
          username: r.username || r.email.split('@')[0],
          bio: r.bio || null,
          profile_image_url: r.profile_image_url || null,
          college: r.college || null,
          course: r.course || null,
          year: r.year || null,
          location: null,
          github_url: null,
          linkedin_url: null,
          portfolio_url: null,
          created_at: r.joined_at,
          updated_at: r.joined_at,
        },
        user: {
          id: r.user_id,
          email: r.email,
          role: 'student',
          created_at: r.joined_at,
          updated_at: r.joined_at,
        },
      }));
    }

    // Memory Store lookup
    const rawMembers = memoryDb.team_members.filter(tm => tm.team_id === teamId);
    return rawMembers
      .map(tm => {
        const prof = memoryDb.profiles.find(p => p.user_id === tm.user_id);
        const user = memoryDb.users.find(u => u.id === tm.user_id);
        return {
          ...tm,
          profile: prof,
          user,
        };
      })
      .sort((a, b) => (a.role === 'leader' ? -1 : 1));
  }

  public static async removeTeamMember(
    teamId: string,
    userIdToRemove: string,
    requesterUserId: string
  ): Promise<void> {
    const team = await this.getTeamById(teamId, requesterUserId);
    const isLeader = team.members?.some(
      m => m.user_id === requesterUserId && m.role === 'leader'
    ) || team.created_by === requesterUserId || team.project?.owner_id === requesterUserId;

    if (!isLeader) {
      throw new ForbiddenError('Only the team leader can remove team members.');
    }

    if (userIdToRemove === requesterUserId) {
      throw new AppError('The team leader cannot remove themselves from the team.', 400);
    }

    const memberExists = team.members?.some(m => m.user_id === userIdToRemove);
    if (!memberExists) {
      throw new NotFoundError('User is not a member of this team.');
    }

    if (env.DATABASE_URL) {
      await query('DELETE FROM team_members WHERE team_id = $1 AND user_id = $2', [teamId, userIdToRemove]);
      return;
    }

    // Memory Store deletion
    memoryDb.team_members = memoryDb.team_members.filter(
      tm => !(tm.team_id === teamId && tm.user_id === userIdToRemove)
    );
  }
}
