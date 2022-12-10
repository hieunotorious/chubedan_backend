import { Router } from "express";

import controller from "../../controllers/User";
import { validateToken } from "../../middleware/validate";
const router = Router();

router.post("/signup", controller.signup);
router.post("/login", controller.login);
router.get("/getself", validateToken, controller.getSelfUser);
router.post("/refresh_token", controller.refreshToken);
router.patch("/update_self", validateToken, controller.updateSelfUser);

export default router;
