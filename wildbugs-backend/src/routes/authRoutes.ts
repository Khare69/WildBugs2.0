import { Router } from 'express';
import { registerHandler, loginHandler, meHandler } from '../controllers/authController';
import authenticate from '../middleware/authenticate';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public auth endpoints protected with tiered rate limiting (5 attempts/15min)
router.post('/register', authLimiter, registerHandler);
router.post('/login', authLimiter, loginHandler);

// Protected user session endpoint
router.get('/me', authenticate, meHandler);

export default router;
