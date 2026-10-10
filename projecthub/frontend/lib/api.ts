import {
  Project,
  PaginatedResponse,
  DashboardStats,
  JoinRequest,
  Team,
  TeamMember,
  Skill,
  ProfileWithSkills,
  CreateProjectPayload,
} from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('ph_token') : null;
  const devUserId = typeof window !== 'undefined' ? localStorage.getItem('ph_dev_user_id') || '11111111-1111-1111-1111-111111111111' : '11111111-1111-1111-1111-111111111111';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-user-id': devUserId,
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Skills
  getSkills: () => fetchAPI<Skill[]>('/skills'),

  // Profile
  getProfile: () => fetchAPI<ProfileWithSkills>('/profile'),
  updateProfile: (data: any) => fetchAPI<any>('/profile', { method: 'PUT', body: JSON.stringify(data) }),
  addSkill: (skill_id: string, proficiency: string) =>
    fetchAPI<any>('/profile/skills', { method: 'POST', body: JSON.stringify({ skill_id, proficiency }) }),
  deleteSkill: (id: string) => fetchAPI<any>(`/profile/skills/${id}`, { method: 'DELETE' }),

  // Dashboard
  getDashboardStats: () => fetchAPI<DashboardStats>('/dashboard/stats'),

  // Projects
  getProjects: (params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: string;
    skill?: string;
    availability?: string;
  } = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.search) query.append('search', params.search);
    if (params.category) query.append('category', params.category);
    if (params.status) query.append('status', params.status);
    if (params.skill) query.append('skill', params.skill);
    if (params.availability) query.append('availability', params.availability);

    return fetchAPI<PaginatedResponse<Project>>(`/projects?${query.toString()}`);
  },

  getProjectById: (id: string) => fetchAPI<Project>(`/projects/${id}`),
  createProject: (payload: CreateProjectPayload) =>
    fetchAPI<Project>('/projects', { method: 'POST', body: JSON.stringify(payload) }),
  updateProject: (id: string, payload: Partial<CreateProjectPayload>) =>
    fetchAPI<Project>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteProject: (id: string) => fetchAPI<{ message: string }>(`/projects/${id}`, { method: 'DELETE' }),
  getMyProjects: () => fetchAPI<{ created: Project[]; joined: Project[] }>('/projects/my'),

  // Teams
  getTeamById: (id: string) => fetchAPI<Team>(`/teams/${id}`),
  getTeamMembers: (id: string) => fetchAPI<TeamMember[]>(`/teams/${id}/members`),
  removeTeamMember: (teamId: string, userId: string) =>
    fetchAPI<{ message: string }>(`/teams/${teamId}/members/${userId}`, { method: 'DELETE' }),
  getTeamJoinRequests: (teamId: string) => fetchAPI<JoinRequest[]>(`/teams/${teamId}/join-requests`),

  // Join Requests
  requestToJoinProject: (projectId: string, message?: string) =>
    fetchAPI<JoinRequest>(`/projects/${projectId}/join-request`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
  getMyJoinRequests: () => fetchAPI<JoinRequest[]>('/join-requests/my'),
  acceptJoinRequest: (id: string) =>
    fetchAPI<{ message: string; request: JoinRequest }>(`/join-requests/${id}/accept`, { method: 'POST' }),
  rejectJoinRequest: (id: string) =>
    fetchAPI<{ message: string; request: JoinRequest }>(`/join-requests/${id}/reject`, { method: 'POST' }),
  cancelJoinRequest: (id: string) =>
    fetchAPI<{ message: string; request: JoinRequest }>(`/join-requests/${id}/cancel`, { method: 'POST' }),
};
