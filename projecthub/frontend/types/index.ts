export type UserRole = 'student' | 'mentor' | 'organizer' | 'admin';
export type Proficiency = 'Beginner' | 'Intermediate' | 'Advanced';

export type ProjectStatus = 'idea' | 'recruiting' | 'in_progress' | 'completed';
export type ProjectVisibility = 'public' | 'private';
export type SkillImportance = 'required' | 'preferred';
export type TeamRole = 'leader' | 'member';
export type JoinRequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export interface AppUser {
  id: string;
  email: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  username: string;
  bio: string | null;
  profile_image_url: string | null;
  college: string | null;
  course: string | null;
  year: string | null;
  location: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  created_at?: string;
}

export interface UserSkill {
  id: string;
  user_id: string;
  skill_id: string;
  proficiency: Proficiency;
  created_at?: string;
  skill?: Skill;
}

export interface ProfileWithSkills {
  profile: Profile;
  skills: UserSkill[];
  user: AppUser;
}

export interface Project {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  problem_statement: string | null;
  category: string;
  status: ProjectStatus;
  visibility: ProjectVisibility;
  max_team_size: number;
  github_url: string | null;
  demo_url: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  owner_profile?: Profile;
  skills?: ProjectSkill[];
  team?: Team;
  current_members_count?: number;
  open_positions_count?: number;
  user_request_status?: JoinRequestStatus | null;
  user_is_member?: boolean;
}

export interface ProjectSkill {
  id: string;
  project_id: string;
  skill_id: string;
  importance: SkillImportance;
  created_at?: string;
  skill?: Skill;
}

export interface Team {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at?: string;
  updated_at?: string;
  project?: Project;
  members?: TeamMember[];
  current_members_count?: number;
  max_team_size?: number;
  open_positions_count?: number;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: TeamRole;
  joined_at: string;
  profile?: Profile;
  user?: AppUser;
}

export interface JoinRequest {
  id: string;
  project_id: string;
  team_id: string;
  user_id: string;
  message: string | null;
  status: JoinRequestStatus;
  created_at: string;
  updated_at: string;
  requester_profile?: Profile;
  project?: Project;
  team?: Team;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardStats {
  totalProjectsCreated: number;
  projectsInProgress: number;
  teamMemberships: number;
  pendingJoinRequests: number;
  openTeamPositions: number;
}

export interface CreateProjectPayload {
  title: string;
  description: string;
  problem_statement?: string;
  category: string;
  status: ProjectStatus;
  visibility: ProjectVisibility;
  max_team_size: number;
  github_url?: string;
  demo_url?: string;
  skills: Array<{ skill_id: string; importance: SkillImportance }>;
}
