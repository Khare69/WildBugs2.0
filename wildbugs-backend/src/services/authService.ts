import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role, User } from '@prisma/client';
import prisma from '../database/prisma';
import env from '../config/env';
import { ConflictError, UnauthorizedError } from '../utils/errors';
import { AuthUserPayload } from '../types/express';

export interface UserResponse {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  role: Role;
  createdAt: Date;
}

export interface AuthResult {
  user: UserResponse;
  token: string;
}

export class AuthService {
  /**
   * Generates a signed JWT token for an authenticated user.
   */
  public generateToken(user: { id: string; email: string; role: Role }): string {
    const payload: AuthUserPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });
  }

  /**
   * Strips sensitive properties such as passwordHash before returning user objects.
   */
  public sanitizeUser(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  /**
   * Registers a new user account, encrypts their password, and creates a JWT session.
   */
  public async register(email: string, password: string, displayName: string): Promise<AuthResult> {
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check for email uniqueness
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      throw new ConflictError('An account with this email address already exists');
    }

    // 2. Hash password with bcrypt (10 rounds)
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 3. Persist new user in database
    const newUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        displayName: displayName.trim(),
        role: Role.USER,
      },
    });

    // 4. Generate authentication token
    const token = this.generateToken(newUser);

    return {
      user: this.sanitizeUser(newUser),
      token,
    };
  }

  /**
   * Authenticates user credentials and returns user details with a new JWT.
   */
  public async login(email: string, password: string): Promise<AuthResult> {
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Find user by email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // 2. Verify password match
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // 3. Generate token
    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }
}

export const authService = new AuthService();
export default authService;
