import { Router } from 'express';

import { authController } from '../../controllers';
import { validateToken } from '../../middleware/validate';
const router = Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/refresh_token', authController.refreshToken);
router.post('/logout', validateToken, authController.logout);
router.post('/forgot_password', authController.forgotPassword);
router.post('/reset_password', authController.resetPassword);
router.post('/change_password', authController.changePassword);

export default router;
