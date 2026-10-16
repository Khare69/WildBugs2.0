import { Router } from 'express';
import { registerHandler, loginHandler, meHandler } from '../controllers/authController';
import authenticate from '../middleware/authenticate';

const router = Router();

// Public auth endpoints
router.post('/register', registerHandler);
router.post('/login', loginHandler);

// Protected user session endpoint
router.get('/me', authenticate, meHandler);

export default router;
