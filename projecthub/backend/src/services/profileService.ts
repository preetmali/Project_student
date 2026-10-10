import { query, memoryDb } from '../db/db';
import { env } from '../config/env';
import { Profile, ProfileWithSkills, UserSkill, UpdateProfileInput, AddSkillInput, AppUser } from '../types';
import { NotFoundError, ConflictError } from '../utils/errors';

export class ProfileService {
  public static async getProfileByUserId(userId: string): Promise<ProfileWithSkills> {
    if (env.DATABASE_URL) {
      let profileRes = await query<Profile>('SELECT * FROM profiles WHERE user_id = $1', [userId]);
      let profile = profileRes.rows[0];

      if (!profile) {
        // Auto-create initial profile for authenticated user if not exists
        const userRes = await query<AppUser>('SELECT * FROM users WHERE id = $1', [userId]);
        const email = userRes.rows[0]?.email || `user_${userId.slice(0, 8)}@projecthub.dev`;
        const defaultUsername = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') + '_' + userId.slice(0, 4);

        const newProf = await query<Profile>(
          `INSERT INTO profiles (user_id, full_name, username) 
           VALUES ($1, $2, $3) RETURNING *`,
          [userId, email.split('@')[0], defaultUsername]
        );
        profile = newProf.rows[0];
      }

      const skillsRes = await query<UserSkill>(
        `SELECT us.*, s.name as skill_name, s.category as skill_category 
         FROM user_skills us 
         JOIN skills s ON us.skill_id = s.id 
         WHERE us.user_id = $1`,
        [userId]
      );

      const userRes = await query<AppUser>('SELECT * FROM users WHERE id = $1', [userId]);
      const appUser = userRes.rows[0] || {
        id: userId,
        email: `${userId.slice(0, 8)}@projecthub.dev`,
        role: 'student',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const formattedSkills: UserSkill[] = skillsRes.rows.map((r: any) => ({
        id: r.id,
        user_id: r.user_id,
        skill_id: r.skill_id,
        proficiency: r.proficiency,
        created_at: r.created_at,
        skill: {
          id: r.skill_id,
          name: r.skill_name,
          category: r.skill_category,
          created_at: r.created_at,
        },
      }));

      return {
        profile,
        skills: formattedSkills,
        user: appUser,
      };
    }

    // Fallback Memory Store
    let profile = memoryDb.profiles.find(p => p.user_id === userId);
    if (!profile) {
      profile = {
        id: `prof_${userId.slice(0, 8)}`,
        user_id: userId,
        full_name: 'Student User',
        username: `student_${userId.slice(0, 6)}`,
        bio: 'Student at ProjectHub.',
        profile_image_url: null,
        college: 'University Campus',
        course: 'Computer Science',
        year: '3rd Year',
        location: 'Delhi',
        github_url: null,
        linkedin_url: null,
        portfolio_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      memoryDb.profiles.push(profile);
    }

    const userSkills = memoryDb.user_skills
      .filter(us => us.user_id === userId)
      .map(us => ({
        ...us,
        skill: memoryDb.skills.find(s => s.id === us.skill_id),
      }));

    const appUser = memoryDb.users.find(u => u.id === userId) || {
      id: userId,
      email: `${userId.slice(0, 8)}@projecthub.dev`,
      role: 'student',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return { profile, skills: userSkills, user: appUser };
  }

  public static async updateProfile(userId: string, input: UpdateProfileInput): Promise<Profile> {
    if (env.DATABASE_URL) {
      const existing = await this.getProfileByUserId(userId);
      const fields: string[] = [];
      const params: any[] = [userId];
      let paramIdx = 2;

      for (const [key, value] of Object.entries(input)) {
        if (value !== undefined) {
          fields.push(`${key} = $${paramIdx}`);
          params.push(value);
          paramIdx++;
        }
      }

      if (fields.length === 0) return existing.profile;

      fields.push(`updated_at = NOW()`);
      const res = await query<Profile>(
        `UPDATE profiles SET ${fields.join(', ')} WHERE user_id = $1 RETURNING *`,
        params
      );
      return res.rows[0];
    }

    const existing = await this.getProfileByUserId(userId);
    Object.assign(existing.profile, input, { updated_at: new Date().toISOString() });
    return existing.profile;
  }

  public static async addUserSkill(userId: string, input: AddSkillInput): Promise<UserSkill> {
    if (env.DATABASE_URL) {
      const check = await query('SELECT id FROM user_skills WHERE user_id = $1 AND skill_id = $2', [
        userId,
        input.skill_id,
      ]);
      if (check.rows.length > 0) {
        throw new ConflictError('Skill is already added to your profile.');
      }

      const res = await query<UserSkill>(
        `INSERT INTO user_skills (user_id, skill_id, proficiency) 
         VALUES ($1, $2, $3) RETURNING *`,
        [userId, input.skill_id, input.proficiency]
      );
      const skillRes = await query('SELECT * FROM skills WHERE id = $1', [input.skill_id]);
      return { ...res.rows[0], skill: skillRes.rows[0] };
    }

    const existing = memoryDb.user_skills.find(us => us.user_id === userId && us.skill_id === input.skill_id);
    if (existing) {
      throw new ConflictError('Skill is already added to your profile.');
    }

    const newSkill: UserSkill = {
      id: `us_${Date.now()}`,
      user_id: userId,
      skill_id: input.skill_id,
      proficiency: input.proficiency,
      created_at: new Date().toISOString(),
      skill: memoryDb.skills.find(s => s.id === input.skill_id),
    };
    memoryDb.user_skills.push(newSkill);
    return newSkill;
  }

  public static async deleteUserSkill(userId: string, userSkillId: string): Promise<void> {
    if (env.DATABASE_URL) {
      const res = await query('DELETE FROM user_skills WHERE id = $1 AND user_id = $2', [userSkillId, userId]);
      if (res.rowCount === 0) {
        throw new NotFoundError('User skill not found.');
      }
      return;
    }

    const idx = memoryDb.user_skills.findIndex(us => us.id === userSkillId && us.user_id === userId);
    if (idx === -1) {
      throw new NotFoundError('User skill not found.');
    }
    memoryDb.user_skills.splice(idx, 1);
  }
}
