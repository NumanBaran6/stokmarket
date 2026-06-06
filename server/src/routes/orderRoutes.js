import express from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Tüm sipariş rotaları giriş gerektirir
router.use(protect);

router
  .route('/')
  .get(getOrders)
  .post(authorize('customer'), createOrder);

router.route('/:id').get(getOrderById).delete(deleteOrder);

// Sipariş durumunu yalnızca admin günceller
router.put('/:id/status', authorize('admin'), updateOrderStatus);

export default router;
