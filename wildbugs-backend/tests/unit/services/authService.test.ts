import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { authService } from '../../../src/services/authService';
import env from '../../../src/config/env';
import { AuthUserPayload } from '../../../src/types/express';

describe('AuthService Unit Tests', () => {
  it('should generate a valid signed JWT containing correct payload', () => {
    const mockUser = {
      id: 'test-user-uuid-1234',
      email: 'observer@wildbugs.org',
      role: Role.USER,
    };

    const token = authService.generateToken(mockUser);
    assert.ok(typeof token === 'string' && token.length > 20, 'Token must be a non-empty string');

    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthUserPayload;
    assert.equal(decoded.userId, mockUser.id);
    assert.equal(decoded.email, mockUser.email);
    assert.equal(decoded.role, mockUser.role);
  });

  it('should sanitize user object by removing passwordHash and sensitive fields', () => {
    const rawUser = {
      id: 'user-uuid-abc',
      email: 'botanist@wildbugs.org',
      passwordHash: '$2a$10$e8w.dummyhashsecretnotleaked',
      displayName: 'Field Botanist',
      avatarUrl: 'https://cdn.example.com/avatar.jpg',
      role: Role.EXPERT,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    };

    const sanitized = authService.sanitizeUser(rawUser);

    assert.equal(sanitized.id, rawUser.id);
    assert.equal(sanitized.email, rawUser.email);
    assert.equal(sanitized.displayName, rawUser.displayName);
    assert.equal(sanitized.avatarUrl, rawUser.avatarUrl);
    assert.equal(sanitized.role, rawUser.role);
    assert.equal(sanitized.createdAt, rawUser.createdAt);
    assert.equal('passwordHash' in sanitized, false, 'passwordHash must not exist on sanitized user');
  });

  it('should hash password and verify match with bcrypt', async () => {
    const rawPassword = 'StrongPassword!2026';
    const hash = await bcrypt.hash(rawPassword, 10);

    const isMatch = await bcrypt.compare(rawPassword, hash);
    assert.equal(isMatch, true, 'bcrypt compare should succeed with valid password');

    const isWrongMatch = await bcrypt.compare('WrongPassword123', hash);
    assert.equal(isWrongMatch, false, 'bcrypt compare should fail with incorrect password');
  });
});
