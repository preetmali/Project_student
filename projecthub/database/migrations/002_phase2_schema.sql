-- Phase 2 Schema: Projects, Project Skills, Teams, Team Members, Join Requests

-- 1. Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  problem_statement TEXT,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'recruiting' CHECK (status IN ('idea', 'recruiting', 'in_progress', 'completed')),
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  max_team_size INTEGER NOT NULL CHECK (max_team_size > 0),
  github_url TEXT,
  demo_url TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects Indexes
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_visibility ON projects(visibility);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

-- 2. Project Skills Table
CREATE TABLE IF NOT EXISTS project_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  importance TEXT NOT NULL DEFAULT 'required' CHECK (importance IN ('required', 'preferred')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_project_skill UNIQUE (project_id, skill_id)
);

-- Project Skills Indexes
CREATE INDEX IF NOT EXISTS idx_project_skills_project_id ON project_skills(project_id);
CREATE INDEX IF NOT EXISTS idx_project_skills_skill_id ON project_skills(skill_id);

-- 3. Teams Table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams Indexes
CREATE INDEX IF NOT EXISTS idx_teams_project_id ON teams(project_id);
CREATE INDEX IF NOT EXISTS idx_teams_created_by ON teams(created_by);

-- 4. Team Members Table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('leader', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_team_member UNIQUE (team_id, user_id)
);

-- Team Members Indexes
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);

-- 5. Join Requests Table
CREATE TABLE IF NOT EXISTS join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Join Requests Indexes
CREATE INDEX IF NOT EXISTS idx_join_requests_project_id ON join_requests(project_id);
CREATE INDEX IF NOT EXISTS idx_join_requests_team_id ON join_requests(team_id);
CREATE INDEX IF NOT EXISTS idx_join_requests_user_id ON join_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_join_requests_status ON join_requests(status);

-- Prevent multiple pending join requests from the same user for the same team
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_pending_join_request 
ON join_requests(team_id, user_id) 
WHERE status = 'pending';
