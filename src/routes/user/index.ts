import { Router } from 'express';

import { userController, cartController } from '../../controllers';
import { validateToken } from '../../middleware/validate';
const router = Router();

router.patch('/update_self', validateToken, userController.updateSelfUser);
router.get('/getself', validateToken, userController.getSelfUser);

//Cart routes
router.post('/cart/add', validateToken, cartController.addToCart);
router.post('/cart/remove', validateToken, cartController.removeFromCart);
router.post('/cart/updatequantity', validateToken, cartController.updateProductCartQuantity);
router.post('/cart/clear', validateToken, cartController.clearCart);

export default router;
