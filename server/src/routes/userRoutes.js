import express from 'express';
import { getUsers, updateUserTier } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Tüm üye yönetimi işlemleri yalnızca yöneticiye açıktır
router.use(protect, authorize('admin'));

router.get('/', getUsers);
router.put('/:id/tier', updateUserTier);

export default router;
