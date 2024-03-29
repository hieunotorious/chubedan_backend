import { Router } from 'express';

import { productController } from 'src/controllers';
import { validateToken } from 'src/middleware/validate';
const router = Router();

router.get('/all', productController.getAllProducts);
router.get('/get/:id', productController.getProduct);
router.post('/create', validateToken, productController.createProduct);
router.patch('/update/:id', validateToken, productController.updateProduct);
router.delete('/delete/:id', validateToken, productController.deleteProduct);

export default router;
