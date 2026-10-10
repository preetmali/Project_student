import { z } from 'zod';
import { AppError } from './errors';

const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;

export const profileUpdateSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(1, 'Full name is required.')
    .max(100, 'Full name must be 100 characters or fewer.')
    .optional(),
  username: z
    .string()
    .trim()
    .regex(usernameRegex, 'Username must be 3-30 characters using letters, numbers, or underscores.')
    .optional(),
  bio: z.string().trim().max(500, 'Bio must be 500 characters or fewer.').nullable().optional(),
  profile_image_url: z
    .string()
    .trim()
    .url('Profile image must be a valid URL.')
    .max(500)
    .nullable()
    .optional(),
  college: z.string().trim().max(150).nullable().optional(),
  course: z.string().trim().max(150).nullable().optional(),
  year: z.string().trim().max(30).nullable().optional(),
  location: z.string().trim().max(150).nullable().optional(),
  github_url: z
    .string()
    .trim()
    .url('GitHub URL must be a valid URL.')
    .max(300)
    .nullable()
    .optional()
    .or(z.literal('')),
  linkedin_url: z
    .string()
    .trim()
    .url('LinkedIn URL must be a valid URL.')
    .max(300)
    .nullable()
    .optional()
    .or(z.literal('')),
  portfolio_url: z
    .string()
    .trim()
    .url('Portfolio URL must be a valid URL.')
    .max(300)
    .nullable()
    .optional()
    .or(z.literal('')),
});

export const addSkillSchema = z.object({
  skill_id: z.string().uuid('A valid skill is required.'),
  proficiency: z.enum(['Beginner', 'Intermediate', 'Advanced'], {
    errorMap: () => ({ message: 'Proficiency must be Beginner, Intermediate, or Advanced.' }),
  }),
});

export const createProjectSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Project title must be at least 3 characters.')
    .max(150, 'Project title must be 150 characters or fewer.'),
  description: z
    .string()
    .trim()
    .min(10, 'Description must be at least 10 characters.')
    .max(5000, 'Description must be 5000 characters or fewer.'),
  problem_statement: z
    .string()
    .trim()
    .max(5000, 'Problem statement must be 5000 characters or fewer.')
    .nullable()
    .optional(),
  category: z
    .string()
    .trim()
    .min(2, 'Category is required.')
    .max(100, 'Category must be 100 characters or fewer.'),
  status: z
    .enum(['idea', 'recruiting', 'in_progress', 'completed'], {
      errorMap: () => ({ message: 'Status must be idea, recruiting, in_progress, or completed.' }),
    })
    .default('recruiting'),
  visibility: z
    .enum(['public', 'private'], {
      errorMap: () => ({ message: 'Visibility must be public or private.' }),
    })
    .default('public'),
  max_team_size: z
    .number({ invalid_type_error: 'Maximum team size must be a positive integer.' })
    .int('Maximum team size must be an integer.')
    .min(1, 'Maximum team size must be at least 1 member.')
    .max(50, 'Maximum team size cannot exceed 50 members.'),
  github_url: z
    .string()
    .trim()
    .url('GitHub URL must be a valid URL.')
    .max(300)
    .nullable()
    .optional()
    .or(z.literal('')),
  demo_url: z
    .string()
    .trim()
    .url('Demo URL must be a valid URL.')
    .max(300)
    .nullable()
    .optional()
    .or(z.literal('')),
  image_url: z
    .string()
    .trim()
    .url('Image URL must be a valid URL.')
    .max(500)
    .nullable()
    .optional()
    .or(z.literal('')),
  skills: z
    .array(
      z.object({
        skill_id: z.string().uuid('Invalid skill identifier.'),
        importance: z.enum(['required', 'preferred'], {
          errorMap: () => ({ message: 'Skill importance must be required or preferred.' }),
        }),
      })
    )
    .optional()
    .default([]),
});

export const updateProjectSchema = createProjectSchema.partial();

export const createJoinRequestSchema = z.object({
  message: z
    .string()
    .trim()
    .max(1000, 'Message must be 1000 characters or fewer.')
    .nullable()
    .optional(),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(12),
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  status: z.enum(['idea', 'recruiting', 'in_progress', 'completed']).optional(),
  skill: z.string().trim().optional(),
  availability: z.enum(['open', 'full']).optional(),
});

export function parseBody<T>(schema: z.ZodSchema<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (!result.success) {
    const first = result.error.issues[0];
    throw new AppError(first?.message || 'Invalid request body.', 400, 'VALIDATION_ERROR');
  }
  return result.data;
}
