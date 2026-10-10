-- Phase 1 Schema: Users, Profiles, Skills, User Skills

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (mirrors auth.users or application app_users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'mentor', 'organizer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  bio TEXT,
  profile_image_url TEXT,
  college TEXT,
  course TEXT,
  year TEXT,
  location TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Skills junction table
CREATE TABLE IF NOT EXISTS user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  proficiency TEXT NOT NULL CHECK (proficiency IN ('Beginner', 'Intermediate', 'Advanced')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_skill UNIQUE (user_id, skill_id)
);

-- Indexes for Phase 1
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_skill_id ON user_skills(skill_id);
