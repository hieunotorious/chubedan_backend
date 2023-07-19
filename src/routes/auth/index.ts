import { Router } from 'express';

import { authController } from '../../controllers';
import { validateToken } from '../../middleware/validate';
const router = Router();

router.post('/auth/signup', authController.signup);
router.post('/auth/login', authController.login);
router.post('/auth/refresh_token', authController.refreshToken);
router.post('/auth/logout', validateToken, authController.logout);

export default router;
