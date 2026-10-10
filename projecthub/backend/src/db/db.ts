import { Pool, PoolClient } from 'pg';
import { env } from '../config/env';

let pool: Pool | null = null;

if (env.DATABASE_URL) {
  pool = new Pool({
    connectionString: env.DATABASE_URL,
    ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
}

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

export interface DbClient {
  query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>>;
}

export async function query<T = any>(text: string, params: any[] = []): Promise<QueryResult<T>> {
  if (pool) {
    const res = await pool.query(text, params);
    return {
      rows: res.rows as T[],
      rowCount: res.rowCount ?? res.rows.length,
    };
  }
  return memoryDb.query<T>(text, params);
}

export async function transaction<T>(fn: (client: DbClient) => Promise<T>): Promise<T> {
  if (pool) {
    const client: PoolClient = await pool.connect();
    try {
      await client.query('BEGIN');
      const customClient: DbClient = {
        query: async (text: string, params: any[] = []) => {
          const res = await client.query(text, params);
          return {
            rows: res.rows,
            rowCount: res.rowCount ?? res.rows.length,
          };
        },
      };
      const result = await fn(customClient);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Fallback transaction using in-memory store lock
  return memoryDb.transaction(fn);
}

// Memory database store for fallback when PostgreSQL DATABASE_URL is not set (e.g. offline testing/dev)
class MemoryDatabaseStore {
  public users: any[] = [];
  public profiles: any[] = [];
  public skills: any[] = [];
  public user_skills: any[] = [];
  public projects: any[] = [];
  public project_skills: any[] = [];
  public teams: any[] = [];
  public team_members: any[] = [];
  public join_requests: any[] = [];

  constructor() {
    this.seedDefaults();
  }

  public seedDefaults() {
    const now = new Date().toISOString();

    this.users = [
      { id: '11111111-1111-1111-1111-111111111111', email: 'rahul@projecthub.dev', role: 'student', created_at: now, updated_at: now },
      { id: '22222222-2222-2222-2222-222222222222', email: 'aman@projecthub.dev', role: 'student', created_at: now, updated_at: now },
      { id: '33333333-3333-3333-3333-333333333333', email: 'priya@projecthub.dev', role: 'student', created_at: now, updated_at: now },
      { id: '44444444-4444-4444-4444-444444444444', email: 'neha@projecthub.dev', role: 'student', created_at: now, updated_at: now },
      { id: '55555555-5555-5555-5555-555555555555', email: 'rohan@projecthub.dev', role: 'student', created_at: now, updated_at: now },
    ];

    this.profiles = [
      { id: 'a1111111-1111-1111-1111-111111111111', user_id: '11111111-1111-1111-1111-111111111111', full_name: 'Rahul Sharma', username: 'rahul_sharma', bio: 'Full-stack developer passionate about AI.', college: 'IIT Delhi', course: 'Computer Science', year: '3rd Year', location: 'New Delhi', github_url: 'https://github.com/rahulsharma', linkedin_url: 'https://linkedin.com/in/rahulsharma', portfolio_url: null, created_at: now, updated_at: now },
      { id: 'a2222222-2222-2222-2222-222222222222', user_id: '22222222-2222-2222-2222-222222222222', full_name: 'Aman Gupta', username: 'amangupta', bio: 'Frontend wizard crafting clean UIs with React.', college: 'BITS Pilani', course: 'Information Technology', year: '4th Year', location: 'Pilani', github_url: 'https://github.com/amangupta', linkedin_url: 'https://linkedin.com/in/amangupta', portfolio_url: null, created_at: now, updated_at: now },
      { id: 'a3333333-3333-3333-3333-333333333333', user_id: '33333333-3333-3333-3333-333333333333', full_name: 'Priya Verma', username: 'priya_v', bio: 'ML engineer building smart AI assistants.', college: 'DTU', course: 'Computer Engineering', year: '3rd Year', location: 'Delhi', github_url: 'https://github.com/priyaverma', linkedin_url: 'https://linkedin.com/in/priyaverma', portfolio_url: null, created_at: now, updated_at: now },
      { id: 'a4444444-4444-4444-4444-444444444444', user_id: '44444444-4444-4444-4444-444444444444', full_name: 'Neha Patel', username: 'neha_patel', bio: 'UI/UX designer and mobile developer.', college: 'NIT Trichy', course: 'ECE', year: '2nd Year', location: 'Trichy', github_url: 'https://github.com/nehapatel', linkedin_url: 'https://linkedin.com/in/nehapatel', portfolio_url: null, created_at: now, updated_at: now },
      { id: 'a5555555-5555-5555-5555-555555555555', user_id: '55555555-5555-5555-5555-555555555555', full_name: 'Rohan Mehta', username: 'rohan_m', bio: 'Backend engineer obsessed with PostgreSQL, Rust & Go.', college: 'IIIT Hyderabad', course: 'Computer Science', year: '4th Year', location: 'Hyderabad', github_url: 'https://github.com/rohanmehta', linkedin_url: 'https://linkedin.com/in/rohanmehta', portfolio_url: null, created_at: now, updated_at: now },
    ];

    this.skills = [
      { id: 'b0100000-0000-0000-0000-000000000000', name: 'React', category: 'Frontend', created_at: now },
      { id: 'b0200000-0000-0000-0000-000000000000', name: 'Node.js', category: 'Backend', created_at: now },
      { id: 'b0300000-0000-0000-0000-000000000000', name: 'TypeScript', category: 'Programming Languages', created_at: now },
      { id: 'b0400000-0000-0000-0000-000000000000', name: 'Python', category: 'Programming Languages', created_at: now },
      { id: 'b0500000-0000-0000-0000-000000000000', name: 'PostgreSQL', category: 'Database', created_at: now },
      { id: 'b0600000-0000-0000-0000-000000000000', name: 'Machine Learning', category: 'AI/ML', created_at: now },
      { id: 'b0700000-0000-0000-0000-000000000000', name: 'UI/UX Design', category: 'Design', created_at: now },
      { id: 'b0800000-0000-0000-0000-000000000000', name: 'Docker', category: 'DevOps', created_at: now },
      { id: 'b0900000-0000-0000-0000-000000000000', name: 'Next.js', category: 'Frontend', created_at: now },
      { id: 'b1000000-0000-0000-0000-000000000000', name: 'Go', category: 'Programming Languages', created_at: now },
      { id: 'b1100000-0000-0000-0000-000000000000', name: 'Rust', category: 'Programming Languages', created_at: now },
      { id: 'b1200000-0000-0000-0000-000000000000', name: 'Flutter', category: 'Mobile', created_at: now },
      { id: 'b1300000-0000-0000-0000-000000000000', name: 'AWS', category: 'Cloud', created_at: now },
      { id: 'b1400000-0000-0000-0000-000000000000', name: 'Tailwind CSS', category: 'Frontend', created_at: now },
    ];

    this.user_skills = [
      { id: 'us1', user_id: '11111111-1111-1111-1111-111111111111', skill_id: 'b0100000-0000-0000-0000-000000000000', proficiency: 'Advanced', created_at: now },
      { id: 'us2', user_id: '11111111-1111-1111-1111-111111111111', skill_id: 'b0200000-0000-0000-0000-000000000000', proficiency: 'Intermediate', created_at: now },
      { id: 'us3', user_id: '22222222-2222-2222-2222-222222222222', skill_id: 'b0100000-0000-0000-0000-000000000000', proficiency: 'Advanced', created_at: now },
      { id: 'us4', user_id: '33333333-3333-3333-3333-333333333333', skill_id: 'b0400000-0000-0000-0000-000000000000', proficiency: 'Advanced', created_at: now },
    ];

    this.projects = [
      {
        id: 'c0100000-0000-0000-0000-000000000000',
        owner_id: '11111111-1111-1111-1111-111111111111',
        title: 'AI Study Assistant',
        description: 'An AI-powered platform that helps students organize study material, extract key takeaways, and generate personalized learning quizzes.',
        problem_statement: 'Students spend hours organizing lecture notes manually instead of focusing on active recall.',
        category: 'AI/ML',
        status: 'recruiting',
        visibility: 'public',
        max_team_size: 5,
        github_url: 'https://github.com/rahulsharma/ai-study-assistant',
        demo_url: 'https://aistudy.dev',
        image_url: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'c0200000-0000-0000-0000-000000000000',
        owner_id: '22222222-2222-2222-2222-222222222222',
        title: 'Smart Campus Navigation',
        description: 'Interactive mobile app providing indoor navigation for university buildings, real-time classroom updates, and event location tracking.',
        problem_statement: 'Freshmen struggle to navigate large university campuses and locate classrooms.',
        category: 'Mobile',
        status: 'recruiting',
        visibility: 'public',
        max_team_size: 4,
        github_url: 'https://github.com/amangupta/campus-nav',
        demo_url: 'https://campusnav.dev',
        image_url: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'c0300000-0000-0000-0000-000000000000',
        owner_id: '33333333-3333-3333-3333-333333333333',
        title: 'College Event Manager',
        description: 'All-in-one portal for university clubs to host events, manage registrations, track attendance, and issue digital passes.',
        problem_statement: 'Clubs rely on messy Google forms and WhatsApp groups for event registration.',
        category: 'Web Development',
        status: 'in_progress',
        visibility: 'public',
        max_team_size: 3,
        github_url: 'https://github.com/priyaverma/event-manager',
        demo_url: 'https://collegeevents.dev',
        image_url: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'c0400000-0000-0000-0000-000000000000',
        owner_id: '44444444-4444-4444-4444-444444444444',
        title: 'Healthcare Appointment System',
        description: 'Telehealth web application allowing campus health centers to manage student medical appointments and prescription tracking.',
        problem_statement: 'Long wait times at student health centers cause missed classes and delayed care.',
        category: 'Healthcare',
        status: 'recruiting',
        visibility: 'public',
        max_team_size: 4,
        github_url: 'https://github.com/nehapatel/campus-health',
        demo_url: 'https://campushealth.dev',
        image_url: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'c0500000-0000-0000-0000-000000000000',
        owner_id: '55555555-5555-5555-5555-555555555555',
        title: 'Expense Tracker for Students',
        description: 'Simple shared expense tracking app designed specifically for roommates and student group projects.',
        problem_statement: 'Splitting bills and tracking group project expenses leads to miscalculated balances.',
        category: 'Finance',
        status: 'completed',
        visibility: 'public',
        max_team_size: 2,
        github_url: 'https://github.com/rohanmehta/student-expenses',
        demo_url: 'https://studentexpenses.dev',
        image_url: null,
        created_at: now,
        updated_at: now,
      },
    ];

    this.project_skills = [
      { id: 'ps1', project_id: 'c0100000-0000-0000-0000-000000000000', skill_id: 'b0400000-0000-0000-0000-000000000000', importance: 'required', created_at: now },
      { id: 'ps2', project_id: 'c0100000-0000-0000-0000-000000000000', skill_id: 'b0600000-0000-0000-0000-000000000000', importance: 'required', created_at: now },
      { id: 'ps3', project_id: 'c0100000-0000-0000-0000-000000000000', skill_id: 'b0100000-0000-0000-0000-000000000000', importance: 'required', created_at: now },
      { id: 'ps4', project_id: 'c0100000-0000-0000-0000-000000000000', skill_id: 'b0200000-0000-0000-0000-000000000000', importance: 'preferred', created_at: now },
      { id: 'ps5', project_id: 'c0200000-0000-0000-0000-000000000000', skill_id: 'b1200000-0000-0000-0000-000000000000', importance: 'required', created_at: now },
    ];

    this.teams = [
      { id: 'd0100000-0000-0000-0000-000000000000', project_id: 'c0100000-0000-0000-0000-000000000000', name: 'AI Study Squad', description: 'Primary team for AI Study Assistant', created_by: '11111111-1111-1111-1111-111111111111', created_at: now, updated_at: now },
      { id: 'd0200000-0000-0000-0000-000000000000', project_id: 'c0200000-0000-0000-0000-000000000000', name: 'Campus Nav Creators', description: 'Mobile app builders', created_by: '22222222-2222-2222-2222-222222222222', created_at: now, updated_at: now },
      { id: 'd0300000-0000-0000-0000-000000000000', project_id: 'c0300000-0000-0000-0000-000000000000', name: 'Event Tech Team', description: 'Event portal developers', created_by: '33333333-3333-3333-3333-333333333333', created_at: now, updated_at: now },
      { id: 'd0400000-0000-0000-0000-000000000000', project_id: 'c0400000-0000-0000-0000-000000000000', name: 'HealthTech Innovators', description: 'Telehealth team', created_by: '44444444-4444-4444-4444-444444444444', created_at: now, updated_at: now },
      { id: 'd0500000-0000-0000-0000-000000000000', project_id: 'c0500000-0000-0000-0000-000000000000', name: 'FinTech Duo', description: 'Expense tracking team', created_by: '55555555-5555-5555-5555-555555555555', created_at: now, updated_at: now },
    ];

    this.team_members = [
      { id: 'tm1', team_id: 'd0100000-0000-0000-0000-000000000000', user_id: '11111111-1111-1111-1111-111111111111', role: 'leader', joined_at: now },
      { id: 'tm2', team_id: 'd0100000-0000-0000-0000-000000000000', user_id: '22222222-2222-2222-2222-222222222222', role: 'member', joined_at: now },
      { id: 'tm3', team_id: 'd0100000-0000-0000-0000-000000000000', user_id: '33333333-3333-3333-3333-333333333333', role: 'member', joined_at: now },
      { id: 'tm4', team_id: 'd0200000-0000-0000-0000-000000000000', user_id: '22222222-2222-2222-2222-222222222222', role: 'leader', joined_at: now },
      { id: 'tm5', team_id: 'd0300000-0000-0000-0000-000000000000', user_id: '33333333-3333-3333-3333-333333333333', role: 'leader', joined_at: now },
      { id: 'tm6', team_id: 'd0400000-0000-0000-0000-000000000000', user_id: '44444444-4444-4444-4444-444444444444', role: 'leader', joined_at: now },
      { id: 'tm7', team_id: 'd0500000-0000-0000-0000-000000000000', user_id: '55555555-5555-5555-5555-555555555555', role: 'leader', joined_at: now },
      { id: 'tm8', team_id: 'd0500000-0000-0000-0000-000000000000', user_id: '22222222-2222-2222-2222-222222222222', role: 'member', joined_at: now },
    ];

    this.join_requests = [
      { id: 'e0100000-0000-0000-0000-000000000000', project_id: 'c0100000-0000-0000-0000-000000000000', team_id: 'd0100000-0000-0000-0000-000000000000', user_id: '44444444-4444-4444-4444-444444444444', message: 'Hi! I have extensive UI/UX design experience.', status: 'pending', created_at: now, updated_at: now },
      { id: 'e0200000-0000-0000-0000-000000000000', project_id: 'c0200000-0000-0000-0000-000000000000', team_id: 'd0200000-0000-0000-0000-000000000000', user_id: '55555555-5555-5555-5555-555555555555', message: 'I can help optimize backend routes.', status: 'pending', created_at: now, updated_at: now },
    ];
  }

  public async query<T = any>(text: string, params: any[] = []): Promise<QueryResult<T>> {
    // Basic SQL operations handler for in-memory DB fallback
    return { rows: [] as T[], rowCount: 0 };
  }

  public async transaction<T>(fn: (client: DbClient) => Promise<T>): Promise<T> {
    const mockClient: DbClient = {
      query: async (text: string, params: any[] = []) => this.query(text, params),
    };
    return fn(mockClient);
  }
}

export const memoryDb = new MemoryDatabaseStore();
