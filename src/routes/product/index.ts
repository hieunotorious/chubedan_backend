import { Router } from "express";

import controller from "../../controllers/product";
import { validateToken } from "../../middleware/validate";
const router = Router();

router.get("/all", controller.getAllProducts);
router.get("/get/:id", controller.getProduct);
router.post("/create", validateToken, controller.createProduct);
router.patch("/update/:id", validateToken, controller.updateProduct);
router.delete("/delete/:id", validateToken, controller.deleteProduct);

export default router;
