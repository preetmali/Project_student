# ProjectHub — Student Project & Teammate Discovery Platform

ProjectHub is a platform that helps students with tech skills or project ideas find suitable teammates for hackathons, capstone projects, and campus competitions.

---

## Architecture Overview

ProjectHub is built as a full-stack web application:

- **Frontend**: Next.js (App Router), React, TypeScript, Tailwind CSS, Glassmorphic UI design system.
- **Backend**: Node.js, Express.js, TypeScript REST API, Centralized Error Handling, Zod validation.
- **Database**: PostgreSQL with Supabase Auth & direct SQL migration support.
- **Authentication**: Supabase Auth with fallback Dev User Switcher for development & testing.

---

## Phase 2 Implementation Summary

Phase 2 completes the core collaboration workflow:
1. **Projects**: Full CRUD capabilities, categories, status badges (`idea`, `recruiting`, `in_progress`, `completed`), visibility controls (`public`, `private`), team size limits, and repository links.
2. **Project Skills**: Association of required and preferred skills per project with importance tagging.
3. **Teams**: Automatic primary team creation when a project is created, with the project owner automatically assigned as team leader.
4. **Team Members**: Membership tracking, capacity enforcement on backend, role management (`leader`, `member`), and member removal logic.
5. **Join Requests**: Application submission with custom messages, duplicate pending request prevention, transactional acceptance with locking, rejection, and requester cancellation.
6. **Project Discovery**: Multi-criteria search (title, description, problem statement, category), filtering (category, status, skill, open team availability), and PostgreSQL-level pagination (`page`, `limit`, returning total metadata).
7. **Team Management**: Leader controls to review pending join requests, accept candidates into the team (with strict capacity enforcement), reject candidates, and manage current members.
8. **Dashboard Statistics**: Real PostgreSQL aggregation of user statistics (My Projects, Team Memberships, Pending Requests, Open Positions).

> [!NOTE]
> **Important Boundary Note**: Phase 3 AI features (`pgvector`, embeddings, AI teammate recommendations, semantic vector matching, mentor system, chat/Socket.IO, events, certificates, admin dashboard) are explicitly reserved for Phase 3 and beyond.

---

## Database Migrations & Seed Data

### Migrations
Migration SQL files are stored in `database/migrations/`:
- `001_phase1_schema.sql`: Users, Profiles, Skills, User Skills schema.
- `002_phase2_schema.sql`: Projects, Project Skills, Teams, Team Members, Join Requests schema, foreign keys, unique constraints, and indexes.

To execute migrations against your Supabase or local PostgreSQL instance:
```bash
psql $DATABASE_URL -f database/migrations/001_phase1_schema.sql
psql $DATABASE_URL -f database/migrations/002_phase2_schema.sql
```

### Seed Data
Realistic development seed data is provided in `database/seed/seed.sql`:
- **20+ Skills** across Frontend, Backend, AI/ML, DevOps, Database, Mobile, and Security.
- **10+ Realistic Projects** covering diverse categories (AI Study Assistant, Smart Campus Navigation, College Event Manager, Healthcare System, Expense Tracker, Campus Marketplace, AI Resume Builder, etc.).
- **Deterministic Users & Profiles**: Rahul Sharma, Aman Gupta, Priya Verma, Neha Patel, Rohan Mehta.
- **Teams, Team Memberships & Join Requests** with various statuses.

To seed the database:
```bash
psql $DATABASE_URL -f database/seed/seed.sql
```

---

## Backend API Endpoints

### Projects
- `POST /api/projects` — Create project (transactional: project -> skills -> team -> leader member).
- `GET /api/projects` — Discover projects (supports `page`, `limit`, `search`, `category`, `status`, `skill`, `availability`).
- `GET /api/projects/my` / `/me` — List projects owned by current user & joined teams.
- `GET /api/projects/:id` — Get project details with skills, team, members & user request status.
- `PUT /api/projects/:id` — Update project (Owner only).
- `DELETE /api/projects/:id` — Delete project (Owner only).

### Teams
- `GET /api/teams/:id` — Get team details & member capacity.
- `GET /api/teams/:id/members` — Get team member list.
- `DELETE /api/teams/:teamId/members/:userId` — Remove team member (Leader only, cannot remove self).
- `GET /api/teams/:id/join-requests` — Get pending join requests for team (Leader only).

### Join Requests
- `POST /api/projects/:id/join-request` / `POST /api/teams/:id/join-requests` — Submit join request.
- `GET /api/join-requests/my` — List requests submitted by current user.
- `POST /api/join-requests/:id/accept` — Accept candidate into team (Leader only, transactional capacity check).
- `POST /api/join-requests/:id/reject` — Reject join request (Leader only).
- `POST /api/join-requests/:id/cancel` — Cancel pending join request (Requester only).

### Dashboard & Profile
- `GET /api/dashboard/stats` — Real database user statistics.
- `GET /api/profile` — Get profile & user skills.
- `PUT /api/profile` — Update profile.
- `POST /api/profile/skills` — Add user skill.
- `DELETE /api/profile/skills/:id` — Delete user skill.
- `GET /api/skills` — List available skills.

---

## Testing & Verification

### Running Backend Tests
Backend unit and integration test suites are written with Vitest:
```bash
cd backend
npm test
```
Test suites cover:
- Project creation, discovery, search, filtering, pagination, and authorization.
- Team details, capacity calculation, leader authorization, member removal, and self-removal protection.
- Join request creation, duplicate request blocking, leader transactional acceptance, full team rejection, and requester cancellation.

### Running Typecheck
```bash
cd backend && npm run typecheck
cd frontend && npm run typecheck
```

### Running Frontend Build
```bash
cd frontend
npm run build
```
