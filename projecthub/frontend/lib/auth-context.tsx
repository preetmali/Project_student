'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppUser, Profile } from '../types';
import { api } from './api';

export interface DevUserOption {
  id: string;
  name: string;
  role: string;
}

export const MOCK_USERS: DevUserOption[] = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'Rahul Sharma (Owner/Student A)', role: 'student' },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Aman Gupta (Student B)', role: 'student' },
  { id: '33333333-3333-3333-3333-333333333333', name: 'Priya Verma (Student C)', role: 'student' },
  { id: '44444444-4444-4444-4444-444444444444', name: 'Neha Patel (Student D)', role: 'student' },
  { id: '55555555-5555-5555-5555-555555555555', name: 'Rohan Mehta (Student E)', role: 'student' },
];

interface AuthContextType {
  user: AppUser | null;
  profile: Profile | null;
  loading: boolean;
  activeUserId: string;
  switchUser: (userId: string) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  activeUserId: '11111111-1111-1111-1111-111111111111',
  switchUser: () => {},
  refreshProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeUserId, setActiveUserId] = useState<string>('11111111-1111-1111-1111-111111111111');
  const [user, setUser] = useState<AppUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const saved = localStorage.getItem('ph_dev_user_id');
    if (saved) {
      setActiveUserId(saved);
    }
  }, []);

  const fetchProfileData = async (uid: string) => {
    setLoading(true);
    try {
      localStorage.setItem('ph_dev_user_id', uid);
      const res = await api.getProfile();
      setUser(res.user);
      setProfile(res.profile);
    } catch (err) {
      console.warn('Could not fetch user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData(activeUserId);
  }, [activeUserId]);

  const switchUser = (userId: string) => {
    setActiveUserId(userId);
  };

  const refreshProfile = async () => {
    await fetchProfileData(activeUserId);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        activeUserId,
        switchUser,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
