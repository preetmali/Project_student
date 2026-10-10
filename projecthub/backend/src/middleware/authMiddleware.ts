import { Request, Response, NextFunction } from 'express';
import { getSupabaseAdmin } from '../db/supabase';
import { env } from '../config/env';
import { UnauthorizedError } from '../utils/errors';
import { AppUser, AuthUser } from '../types';
import { memoryDb, query } from '../db/db';

export interface AuthenticatedRequest extends Request {
  user?: AppUser;
  authUser?: AuthUser;
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    let token: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // Dev / Test Mock User Header Override
    const devUserId = (req.headers['x-user-id'] as string) || (req.headers['x-test-user-id'] as string);

    if (devUserId && env.ENABLE_MOCK_AUTH) {
      const mockUser: AppUser = {
        id: devUserId,
        email: (req.headers['x-user-email'] as string) || `user_${devUserId.slice(0, 8)}@projecthub.dev`,
        role: 'student',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      req.user = mockUser;
      req.authUser = { id: devUserId, email: mockUser.email };
      return next();
    }

    if (!token) {
      // If mock auth is enabled and no token provided, use default mock user (Rahul)
      if (env.ENABLE_MOCK_AUTH) {
        const defaultUserId = '11111111-1111-1111-1111-111111111111';
        req.user = {
          id: defaultUserId,
          email: 'rahul@projecthub.dev',
          role: 'student',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        req.authUser = { id: defaultUserId, email: 'rahul@projecthub.dev' };
        return next();
      }
      throw new UnauthorizedError('Authentication token is required.');
    }

    try {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase.auth.getUser(token);

      if (error || !data.user) {
        throw new UnauthorizedError('Invalid or expired authentication token.');
      }

      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email,
      };

      const appUser: AppUser = {
        id: data.user.id,
        email: data.user.email || '',
        role: (data.user.user_metadata?.role as any) || 'student',
        created_at: data.user.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      req.authUser = authUser;
      req.user = appUser;
      return next();
    } catch (err: any) {
      if (err instanceof UnauthorizedError) throw err;
      if (env.ENABLE_MOCK_AUTH) {
        const defaultUserId = '11111111-1111-1111-1111-111111111111';
        req.user = {
          id: defaultUserId,
          email: 'rahul@projecthub.dev',
          role: 'student',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        req.authUser = { id: defaultUserId, email: 'rahul@projecthub.dev' };
        return next();
      }
      throw new UnauthorizedError('Failed to authenticate token.');
    }
  } catch (error) {
    next(error);
  }
}
