import { Router } from "express";

import controller from "../../controllers/user";
import { validateToken } from "../../middleware/validate";
import cartController from "../../controllers/cart";
const router = Router();

router.post("/signup", controller.signup);
router.post("/login", controller.login);
router.get("/getself", validateToken, controller.getSelfUser);
router.post("/refresh_token", controller.refreshToken);
router.patch("/update_self", validateToken, controller.updateSelfUser);
router.post("/logout", validateToken, controller.logout);

//Cart routes
router.post("/cart/add", validateToken, cartController.addToCart);
router.post("/cart/remove", validateToken, cartController.removeFromCart);
router.post(
  "/cart/updatequantity",
  validateToken,
  cartController.updateProductCartQuantity
);
router.post("/cart/clear", validateToken, cartController.clearCart);

export default router;
