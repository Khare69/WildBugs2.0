import { Request, Response } from 'express';
import { z } from 'zod';
import authService from '../services/authService';
import { asyncHandler } from '../middleware/errorHandler';
import prisma from '../database/prisma';
import { NotFoundError, UnauthorizedError } from '../utils/errors';

export const registerSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address'),
  password: z
    .string()
    .min(8, 'Password must contain at least 8 characters')
    .max(100, 'Password exceeds maximum length'),
  displayName: z
    .string()
    .trim()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name cannot exceed 50 characters'),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerHandler = asyncHandler(async (req: Request, res: Response) => {
  const validated = registerSchema.parse(req.body);
  const result = await authService.register(
    validated.email,
    validated.password,
    validated.displayName
  );

  res.status(201).json({
    status: 'success',
    message: 'User registered successfully',
    data: result,
  });
});

export const loginHandler = asyncHandler(async (req: Request, res: Response) => {
  const validated = loginSchema.parse(req.body);
  const result = await authService.login(validated.email, validated.password);

  res.status(200).json({
    status: 'success',
    message: 'Logged in successfully',
    data: result,
  });
});

export const meHandler = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    throw new UnauthorizedError('Authentication required: Session identity missing');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      userBadges: {
        include: { badge: true },
      },
      _count: {
        select: {
          sightings: true,
          identifications: true,
        },
      },
    },
  });

  if (!user) {
    throw new NotFoundError('User account not found');
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: authService.sanitizeUser(user),
      stats: {
        sightingsCount: user._count.sightings,
        identificationsCount: user._count.identifications,
        badgesCount: user.userBadges.length,
      },
    },
  });
});
