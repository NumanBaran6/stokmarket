import express from 'express';
import { upload } from '../middleware/upload.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @desc    Ürün görseli yükle
// @route   POST /api/upload
// @access  Private/Admin
// Form-data alanı: "image"
router.post('/', protect, authorize('admin'), upload.single('image'), (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Dosya bulunamadı.');
  }
  // Her ortamda çalışsın diye mutlak URL döndürüyoruz
  const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.status(201).json({ success: true, url });
});

export default router;
