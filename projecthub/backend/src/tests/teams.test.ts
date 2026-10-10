import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { memoryDb } from '../db/db';

describe('Teams API', () => {
  const leaderHeader = { 'x-user-id': '11111111-1111-1111-1111-111111111111' };
  const memberHeader = { 'x-user-id': '22222222-2222-2222-2222-222222222222' };
  const outsiderHeader = { 'x-user-id': '55555555-5555-5555-5555-555555555555' };

  beforeEach(() => {
    memoryDb.seedDefaults();
  });

  it('should fetch team details with members and capacity', async () => {
    const res = await request(app)
      .get('/api/teams/d0100000-0000-0000-0000-000000000000')
      .set(leaderHeader);

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('AI Study Squad');
    expect(res.body.members.length).toBe(3);
    expect(res.body.open_positions_count).toBe(2);
  });

  it('should allow team leader to remove a team member', async () => {
    const res = await request(app)
      .delete('/api/teams/d0100000-0000-0000-0000-000000000000/members/22222222-2222-2222-2222-222222222222')
      .set(leaderHeader);

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('removed successfully');
  });

  it('should prevent leader from removing self', async () => {
    const res = await request(app)
      .delete('/api/teams/d0100000-0000-0000-0000-000000000000/members/11111111-1111-1111-1111-111111111111')
      .set(leaderHeader);

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('cannot remove themselves');
  });

  it('should reject unauthorized member removal by non-leader', async () => {
    const res = await request(app)
      .delete('/api/teams/d0100000-0000-0000-0000-000000000000/members/33333333-3333-3333-3333-333333333333')
      .set(outsiderHeader);

    expect(res.status).toBe(403);
    expect(res.body.error).toContain('Only the team leader');
  });
});
