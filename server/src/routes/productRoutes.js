import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// optionalAuth: giriş yapan VIP kullanıcılara özel fiyatı uygulayabilmek için
router
  .route('/')
  .get(optionalAuth, getProducts)
  .post(protect, authorize('admin'), createProduct);

router
  .route('/:id')
  .get(optionalAuth, getProductById)
  .put(protect, authorize('admin'), updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);

export default router;
