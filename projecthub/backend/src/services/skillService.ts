import { query, memoryDb } from '../db/db';
import { env } from '../config/env';
import { Skill } from '../types';

export class SkillService {
  public static async getAllSkills(): Promise<Skill[]> {
    if (env.DATABASE_URL) {
      const res = await query<Skill>('SELECT * FROM skills ORDER BY category ASC, name ASC');
      return res.rows;
    }
    return [...memoryDb.skills].sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  }

  public static async getSkillById(id: string): Promise<Skill | null> {
    if (env.DATABASE_URL) {
      const res = await query<Skill>('SELECT * FROM skills WHERE id = $1', [id]);
      return res.rows[0] || null;
    }
    return memoryDb.skills.find(s => s.id === id) || null;
  }
}
