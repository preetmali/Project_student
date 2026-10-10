import { query, transaction, memoryDb, DbClient } from '../db/db';
import { env } from '../config/env';
import {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
  PaginationParams,
  PaginatedResponse,
  ProjectSkill,
  Team,
  TeamMember,
  JoinRequestStatus,
} from '../types';
import { NotFoundError, ForbiddenError, AppError } from '../utils/errors';

export class ProjectService {
  public static async createProject(ownerId: string, input: CreateProjectInput): Promise<Project> {
    if (!input.title || !input.description || !input.category || !input.max_team_size) {
      throw new AppError('Missing required project fields (title, description, category, max_team_size).', 400);
    }

    if (input.max_team_size <= 0) {
      throw new AppError('Maximum team size must be a positive integer.', 400);
    }

    if (env.DATABASE_URL) {
      return transaction(async (client: DbClient) => {
        // 1. Insert Project
        const projRes = await client.query<Project>(
          `INSERT INTO projects (
            owner_id, title, description, problem_statement, category, status, visibility, max_team_size, github_url, demo_url, image_url
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
          [
            ownerId,
            input.title,
            input.description,
            input.problem_statement || null,
            input.category,
            input.status || 'recruiting',
            input.visibility || 'public',
            input.max_team_size,
            input.github_url || null,
            input.demo_url || null,
            input.image_url || null,
          ]
        );
        const project = projRes.rows[0];

        // 2. Insert Project Skills
        if (input.skills && input.skills.length > 0) {
          for (const s of input.skills) {
            await client.query(
              `INSERT INTO project_skills (project_id, skill_id, importance) VALUES ($1, $2, $3)`,
              [project.id, s.skill_id, s.importance]
            );
          }
        }

        // 3. Create Primary Team
        const teamRes = await client.query<Team>(
          `INSERT INTO teams (project_id, name, description, created_by) VALUES ($1, $2, $3, $4) RETURNING *`,
          [project.id, `${project.title} Team`, `Primary team for ${project.title}`, ownerId]
        );
        const team = teamRes.rows[0];

        // 4. Add Project Owner as Team Leader
        await client.query(
          `INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, 'leader')`,
          [team.id, ownerId]
        );

        return this.getProjectById(project.id, ownerId);
      });
    }

    // Memory Store Creation
    const now = new Date().toISOString();
    const projectId = `c_${Date.now()}`;
    const newProj: Project = {
      id: projectId,
      owner_id: ownerId,
      title: input.title,
      description: input.description,
      problem_statement: input.problem_statement || null,
      category: input.category,
      status: input.status || 'recruiting',
      visibility: input.visibility || 'public',
      max_team_size: input.max_team_size,
      github_url: input.github_url || null,
      demo_url: input.demo_url || null,
      image_url: input.image_url || null,
      created_at: now,
      updated_at: now,
    };
    memoryDb.projects.push(newProj);

    if (input.skills) {
      input.skills.forEach((s, i) => {
        memoryDb.project_skills.push({
          id: `ps_${Date.now()}_${i}`,
          project_id: projectId,
          skill_id: s.skill_id,
          importance: s.importance,
          created_at: now,
        });
      });
    }

    const teamId = `d_${Date.now()}`;
    const newTeam: Team = {
      id: teamId,
      project_id: projectId,
      name: `${input.title} Team`,
      description: `Primary team for ${input.title}`,
      created_by: ownerId,
      created_at: now,
      updated_at: now,
    };
    memoryDb.teams.push(newTeam);

    memoryDb.team_members.push({
      id: `tm_${Date.now()}`,
      team_id: teamId,
      user_id: ownerId,
      role: 'leader',
      joined_at: now,
    });

    return this.getProjectById(projectId, ownerId);
  }

  public static async getProjects(
    params: PaginationParams,
    currentUserId?: string
  ): Promise<PaginatedResponse<Project>> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 12));
    const offset = (page - 1) * limit;

    if (env.DATABASE_URL) {
      const conditions: string[] = [];
      const values: any[] = [];
      let idx = 1;

      // Privacy Filter: Only public projects OR projects where user is owner / member
      if (currentUserId) {
        conditions.push(`(p.visibility = 'public' OR p.owner_id = $${idx} OR EXISTS (
          SELECT 1 FROM teams t JOIN team_members tm ON t.id = tm.team_id WHERE t.project_id = p.id AND tm.user_id = $${idx}
        ))`);
        values.push(currentUserId);
        idx++;
      } else {
        conditions.push(`p.visibility = 'public'`);
      }

      if (params.search) {
        conditions.push(`(p.title ILIKE $${idx} OR p.description ILIKE $${idx} OR p.problem_statement ILIKE $${idx} OR p.category ILIKE $${idx})`);
        values.push(`%${params.search}%`);
        idx++;
      }

      if (params.category) {
        conditions.push(`p.category = $${idx}`);
        values.push(params.category);
        idx++;
      }

      if (params.status) {
        conditions.push(`p.status = $${idx}`);
        values.push(params.status);
        idx++;
      }

      if (params.skill) {
        conditions.push(`EXISTS (
          SELECT 1 FROM project_skills ps 
          JOIN skills s ON ps.skill_id = s.id 
          WHERE ps.project_id = p.id AND (s.name ILIKE $${idx} OR s.id::text = $${idx})
        )`);
        values.push(params.skill.includes('-') ? params.skill : `%${params.skill}%`);
        idx++;
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const countSql = `SELECT COUNT(*) FROM projects p ${whereClause}`;
      const countRes = await query<{ count: string }>(countSql, values);
      const total = parseInt(countRes.rows[0]?.count || '0', 10);

      const dataSql = `
        SELECT p.*, 
          COALESCE((
            SELECT COUNT(*) FROM team_members tm 
            JOIN teams t ON tm.team_id = t.id 
            WHERE t.project_id = p.id
          ), 0)::int as current_members_count
        FROM projects p
        ${whereClause}
        ORDER BY p.created_at DESC
        LIMIT $${idx} OFFSET $${idx + 1}
      `;
      const dataValues = [...values, limit, offset];
      const dataRes = await query<any>(dataSql, dataValues);

      const projects: Project[] = [];
      for (const row of dataRes.rows) {
        const fullProj = await this.enrichProjectData(row, currentUserId);
        if (params.availability === 'open' && (fullProj.open_positions_count || 0) <= 0) {
          continue;
        }
        if (params.availability === 'full' && (fullProj.open_positions_count || 0) > 0) {
          continue;
        }
        projects.push(fullProj);
      }

      const totalPages = Math.ceil(total / limit) || 1;
      return {
        data: projects,
        total,
        page,
        limit,
        totalPages,
      };
    }

    // Fallback Memory Store Filtering
    let list = [...memoryDb.projects];

    if (currentUserId) {
      list = list.filter(p => p.visibility === 'public' || p.owner_id === currentUserId);
    } else {
      list = list.filter(p => p.visibility === 'public');
    }

    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        p =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.problem_statement && p.problem_statement.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (params.category) {
      list = list.filter(p => p.category.toLowerCase() === params.category?.toLowerCase());
    }

    if (params.status) {
      list = list.filter(p => p.status === params.status);
    }

    if (params.skill) {
      const q = params.skill.toLowerCase();
      list = list.filter(p => {
        const ps = memoryDb.project_skills.filter(s => s.project_id === p.id);
        return ps.some(s => {
          const sk = memoryDb.skills.find(sk => sk.id === s.skill_id);
          return sk && (sk.name.toLowerCase().includes(q) || sk.id === params.skill);
        });
      });
    }

    const total = list.length;
    const paginated = list.slice(offset, offset + limit);

    const enriched: Project[] = [];
    for (const p of paginated) {
      const full = await this.enrichProjectData(p, currentUserId);
      if (params.availability === 'open' && (full.open_positions_count || 0) <= 0) continue;
      if (params.availability === 'full' && (full.open_positions_count || 0) > 0) continue;
      enriched.push(full);
    }

    return {
      data: enriched,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  public static async getProjectById(projectId: string, currentUserId?: string): Promise<Project> {
    if (env.DATABASE_URL) {
      const res = await query<any>('SELECT * FROM projects WHERE id = $1', [projectId]);
      if (res.rows.length === 0) {
        throw new NotFoundError('Project not found.');
      }
      const project = res.rows[0];

      if (project.visibility === 'private' && currentUserId) {
        const isOwner = project.owner_id === currentUserId;
        const memberCheck = await query(
          `SELECT 1 FROM teams t JOIN team_members tm ON t.id = tm.team_id WHERE t.project_id = $1 AND tm.user_id = $2`,
          [projectId, currentUserId]
        );
        if (!isOwner && memberCheck.rows.length === 0) {
          throw new ForbiddenError('This project is private.');
        }
      } else if (project.visibility === 'private' && !currentUserId) {
        throw new ForbiddenError('This project is private.');
      }

      return this.enrichProjectData(project, currentUserId);
    }

    // Memory Store lookup
    const p = memoryDb.projects.find(proj => proj.id === projectId);
    if (!p) {
      throw new NotFoundError('Project not found.');
    }

    if (p.visibility === 'private') {
      const isOwner = p.owner_id === currentUserId;
      const team = memoryDb.teams.find(t => t.project_id === projectId);
      const isMember = team && memoryDb.team_members.some(tm => tm.team_id === team.id && tm.user_id === currentUserId);
      if (!isOwner && !isMember) {
        throw new ForbiddenError('This project is private.');
      }
    }

    return this.enrichProjectData(p, currentUserId);
  }

  public static async updateProject(
    projectId: string,
    ownerId: string,
    input: UpdateProjectInput
  ): Promise<Project> {
    const existing = await this.getProjectById(projectId, ownerId);

    if (existing.owner_id !== ownerId) {
      throw new ForbiddenError('You are not authorized to edit this project.');
    }

    if (env.DATABASE_URL) {
      const fields: string[] = [];
      const params: any[] = [projectId];
      let paramIdx = 2;

      const keys: Array<keyof UpdateProjectInput> = [
        'title',
        'description',
        'problem_statement',
        'category',
        'status',
        'visibility',
        'max_team_size',
        'github_url',
        'demo_url',
        'image_url',
      ];

      for (const k of keys) {
        if (input[k] !== undefined) {
          fields.push(`${k} = $${paramIdx}`);
          params.push(input[k]);
          paramIdx++;
        }
      }

      if (fields.length > 0) {
        fields.push(`updated_at = NOW()`);
        await query(`UPDATE projects SET ${fields.join(', ')} WHERE id = $1`, params);
      }

      if (input.skills !== undefined) {
        await query('DELETE FROM project_skills WHERE project_id = $1', [projectId]);
        for (const s of input.skills) {
          await query(
            `INSERT INTO project_skills (project_id, skill_id, importance) VALUES ($1, $2, $3)`,
            [projectId, s.skill_id, s.importance]
          );
        }
      }

      return this.getProjectById(projectId, ownerId);
    }

    // Memory Store update
    const p = memoryDb.projects.find(proj => proj.id === projectId);
    if (!p) throw new NotFoundError('Project not found.');
    if (p.owner_id !== ownerId) throw new ForbiddenError('You are not authorized to edit this project.');

    Object.assign(p, {
      title: input.title ?? p.title,
      description: input.description ?? p.description,
      problem_statement: input.problem_statement ?? p.problem_statement,
      category: input.category ?? p.category,
      status: input.status ?? p.status,
      visibility: input.visibility ?? p.visibility,
      max_team_size: input.max_team_size ?? p.max_team_size,
      github_url: input.github_url ?? p.github_url,
      demo_url: input.demo_url ?? p.demo_url,
      image_url: input.image_url ?? p.image_url,
      updated_at: new Date().toISOString(),
    });

    if (input.skills !== undefined) {
      memoryDb.project_skills = memoryDb.project_skills.filter(ps => ps.project_id !== projectId);
      input.skills.forEach((s, i) => {
        memoryDb.project_skills.push({
          id: `ps_${Date.now()}_${i}`,
          project_id: projectId,
          skill_id: s.skill_id,
          importance: s.importance,
          created_at: new Date().toISOString(),
        });
      });
    }

    return this.getProjectById(projectId, ownerId);
  }

  public static async deleteProject(projectId: string, ownerId: string): Promise<void> {
    const existing = await this.getProjectById(projectId, ownerId);

    if (existing.owner_id !== ownerId) {
      throw new ForbiddenError('You are not authorized to delete this project.');
    }

    if (env.DATABASE_URL) {
      await query('DELETE FROM projects WHERE id = $1', [projectId]);
      return;
    }

    // Memory Store deletion
    memoryDb.projects = memoryDb.projects.filter(p => p.id !== projectId);
    memoryDb.project_skills = memoryDb.project_skills.filter(ps => ps.project_id !== projectId);
    const team = memoryDb.teams.find(t => t.project_id === projectId);
    if (team) {
      memoryDb.teams = memoryDb.teams.filter(t => t.id !== team.id);
      memoryDb.team_members = memoryDb.team_members.filter(tm => tm.team_id !== team.id);
      memoryDb.join_requests = memoryDb.join_requests.filter(jr => jr.team_id !== team.id);
    }
  }

  public static async getMyProjects(userId: string): Promise<{ created: Project[]; joined: Project[] }> {
    if (env.DATABASE_URL) {
      const createdRes = await query('SELECT * FROM projects WHERE owner_id = $1 ORDER BY created_at DESC', [userId]);
      const created: Project[] = [];
      for (const p of createdRes.rows) {
        created.push(await this.enrichProjectData(p, userId));
      }

      const joinedRes = await query(
        `SELECT DISTINCT p.* FROM projects p
         JOIN teams t ON t.project_id = p.id
         JOIN team_members tm ON tm.team_id = t.id
         WHERE tm.user_id = $1 AND p.owner_id != $1
         ORDER BY p.created_at DESC`,
        [userId]
      );
      const joined: Project[] = [];
      for (const p of joinedRes.rows) {
        joined.push(await this.enrichProjectData(p, userId));
      }

      return { created, joined };
    }

    // Memory Store getMyProjects
    const createdProjs = memoryDb.projects.filter(p => p.owner_id === userId);
    const created: Project[] = [];
    for (const p of createdProjs) {
      created.push(await this.enrichProjectData(p, userId));
    }

    const myTeamIds = memoryDb.team_members.filter(tm => tm.user_id === userId).map(tm => tm.team_id);
    const joinedTeamProjIds = memoryDb.teams.filter(t => myTeamIds.includes(t.id)).map(t => t.project_id);
    const joinedProjs = memoryDb.projects.filter(p => joinedTeamProjIds.includes(p.id) && p.owner_id !== userId);

    const joined: Project[] = [];
    for (const p of joinedProjs) {
      joined.push(await this.enrichProjectData(p, userId));
    }

    return { created, joined };
  }

  private static async enrichProjectData(raw: any, currentUserId?: string): Promise<Project> {
    const projectId = raw.id;

    if (env.DATABASE_URL) {
      // Owner Profile
      const ownerRes = await query('SELECT * FROM profiles WHERE user_id = $1', [raw.owner_id]);
      const ownerProfile = ownerRes.rows[0] || null;

      // Project Skills
      const skillsRes = await query(
        `SELECT ps.*, s.name as skill_name, s.category as skill_category 
         FROM project_skills ps 
         JOIN skills s ON ps.skill_id = s.id 
         WHERE ps.project_id = $1`,
        [projectId]
      );

      const skills: ProjectSkill[] = skillsRes.rows.map((r: any) => ({
        id: r.id,
        project_id: r.project_id,
        skill_id: r.skill_id,
        importance: r.importance,
        created_at: r.created_at,
        skill: {
          id: r.skill_id,
          name: r.skill_name,
          category: r.skill_category,
          created_at: r.created_at,
        },
      }));

      // Primary Team
      const teamRes = await query('SELECT * FROM teams WHERE project_id = $1', [projectId]);
      const team = teamRes.rows[0] || null;

      let memberCount = 0;
      let userIsMember = false;

      if (team) {
        const countRes = await query<{ count: string }>('SELECT COUNT(*) FROM team_members WHERE team_id = $1', [
          team.id,
        ]);
        memberCount = parseInt(countRes.rows[0]?.count || '0', 10);

        if (currentUserId) {
          const mCheck = await query('SELECT 1 FROM team_members WHERE team_id = $1 AND user_id = $2', [
            team.id,
            currentUserId,
          ]);
          userIsMember = mCheck.rows.length > 0;
        }
      }

      let userRequestStatus: JoinRequestStatus | null = null;
      if (currentUserId && team) {
        const reqRes = await query(
          `SELECT status FROM join_requests WHERE team_id = $1 AND user_id = $2 AND status = 'pending' ORDER BY created_at DESC LIMIT 1`,
          [team.id, currentUserId]
        );
        if (reqRes.rows.length > 0) {
          userRequestStatus = reqRes.rows[0].status as JoinRequestStatus;
        }
      }

      const openPositions = Math.max(0, raw.max_team_size - memberCount);

      return {
        ...raw,
        owner_profile: ownerProfile,
        skills,
        team,
        current_members_count: memberCount,
        open_positions_count: openPositions,
        user_request_status: userRequestStatus,
        user_is_member: userIsMember,
      };
    }

    // Memory Store Enrichment
    const ownerProfile = memoryDb.profiles.find(p => p.user_id === raw.owner_id) || null;
    const pSkills = memoryDb.project_skills
      .filter(ps => ps.project_id === projectId)
      .map(ps => ({
        ...ps,
        skill: memoryDb.skills.find(s => s.id === ps.skill_id),
      }));

    const team = memoryDb.teams.find(t => t.project_id === projectId) || null;
    const memberCount = team ? memoryDb.team_members.filter(tm => tm.team_id === team.id).length : 0;
    const userIsMember = team && currentUserId ? memoryDb.team_members.some(tm => tm.team_id === team.id && tm.user_id === currentUserId) : false;

    let userRequestStatus: JoinRequestStatus | null = null;
    if (team && currentUserId) {
      const pendingReq = memoryDb.join_requests.find(jr => jr.team_id === team.id && jr.user_id === currentUserId && jr.status === 'pending');
      if (pendingReq) {
        userRequestStatus = pendingReq.status as JoinRequestStatus;
      }
    }

    return {
      ...raw,
      owner_profile: ownerProfile,
      skills: pSkills,
      team,
      current_members_count: memberCount,
      open_positions_count: Math.max(0, raw.max_team_size - memberCount),
      user_request_status: userRequestStatus,
      user_is_member: userIsMember,
    };
  }
}
