import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { memoryDb } from '../db/db';

describe('Projects API', () => {
  const user1Header = { 'x-user-id': '11111111-1111-1111-1111-111111111111' };
  const user2Header = { 'x-user-id': '22222222-2222-2222-2222-222222222222' };

  beforeEach(() => {
    memoryDb.seedDefaults();
  });

  it('should allow authenticated user to create a project with team and leader role', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set(user1Header)
      .send({
        title: 'New Innovation Platform',
        description: 'Building an innovation portal for university researchers.',
        problem_statement: 'Research papers are hard to find.',
        category: 'Web Development',
        max_team_size: 4,
        status: 'recruiting',
        visibility: 'public',
        skills: [{ skill_id: 'b0100000-0000-0000-0000-000000000000', importance: 'required' }],
      });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('New Innovation Platform');
    expect(res.body.team).toBeDefined();
    expect(res.body.current_members_count).toBe(1);
    expect(res.body.user_is_member).toBe(true);
  });

  it('should return project discovery list with pagination metadata', async () => {
    const res = await request(app)
      .get('/api/projects?page=1&limit=2')
      .set(user1Header);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(2);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(2);
    expect(res.body.total).toBeGreaterThan(0);
  });

  it('should filter projects by search query', async () => {
    const res = await request(app)
      .get('/api/projects?search=AI')
      .set(user1Header);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].title).toContain('AI');
  });

  it('should reject unauthorized project edit by non-owner', async () => {
    const res = await request(app)
      .put('/api/projects/c0100000-0000-0000-0000-000000000000') // Owner is User 1
      .set(user2Header) // User 2 attempts edit
      .send({ title: 'Hacked Title' });

    expect(res.status).toBe(403);
    expect(res.body.error).toContain('not authorized');
  });

  it('should reject project creation with invalid team size', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set(user1Header)
      .send({
        title: 'Bad Size Project',
        description: 'Test description text here.',
        category: 'Mobile',
        max_team_size: -1,
      });

    expect(res.status).toBe(400);
  });
});
