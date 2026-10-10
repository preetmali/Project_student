import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { memoryDb } from '../db/db';

describe('Join Requests API', () => {
  const leaderHeader = { 'x-user-id': '11111111-1111-1111-1111-111111111111' };
  const studentHeader = { 'x-user-id': '55555555-5555-5555-5555-555555555555' };
  const memberHeader = { 'x-user-id': '22222222-2222-2222-2222-222222222222' };

  beforeEach(() => {
    memoryDb.seedDefaults();
  });

  it('should allow student to submit join request with a custom message', async () => {
    const res = await request(app)
      .post('/api/projects/c0100000-0000-0000-0000-000000000000/join-request')
      .set(studentHeader)
      .send({ message: 'I have experience in Node.js and PostgreSQL and would love to join!' });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('pending');
  });

  it('should block duplicate pending join request for same team', async () => {
    // User 4 already has pending request in seed data for team d01 (project c01)
    const user4Header = { 'x-user-id': '44444444-4444-4444-4444-444444444444' };

    const res = await request(app)
      .post('/api/projects/c0100000-0000-0000-0000-000000000000/join-request')
      .set(user4Header)
      .send({ message: 'Duplicate request attempt' });

    expect(res.status).toBe(409);
    expect(res.body.error).toContain('already have a pending');
  });

  it('should prevent existing team member from requesting to join again', async () => {
    const res = await request(app)
      .post('/api/projects/c0100000-0000-0000-0000-000000000000/join-request')
      .set(memberHeader) // User 2 is already a member
      .send({ message: 'Can I join again?' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('already a member');
  });

  it('should allow team leader to accept a pending join request', async () => {
    const res = await request(app)
      .post('/api/join-requests/e0100000-0000-0000-0000-000000000000/accept')
      .set(leaderHeader);

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('accepted');
    expect(res.body.request.status).toBe('accepted');
  });

  it('should prevent accepting join request when team is full', async () => {
    // Team 5 (project c05) max_team_size is 2, current members = 2 (FULL)
    // Add a pending request for team 5 to test full team rejection
    memoryDb.join_requests.push({
      id: 'e_full_test',
      project_id: 'c0500000-0000-0000-0000-000000000000',
      team_id: 'd0500000-0000-0000-0000-000000000000',
      user_id: '44444444-4444-4444-4444-444444444444',
      message: 'Want to join full team',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const team5LeaderHeader = { 'x-user-id': '55555555-5555-5555-5555-555555555555' };

    const res = await request(app)
      .post('/api/join-requests/e_full_test/accept')
      .set(team5LeaderHeader);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('This team is already full.');
  });

  it('should allow requester to cancel their own pending request', async () => {
    const user4Header = { 'x-user-id': '44444444-4444-4444-4444-444444444444' };

    const res = await request(app)
      .post('/api/join-requests/e0100000-0000-0000-0000-000000000000/cancel')
      .set(user4Header);

    expect(res.status).toBe(200);
    expect(res.body.request.status).toBe('cancelled');
  });
});
