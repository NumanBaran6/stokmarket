import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

// @desc    Tüm kategorileri listele
// @route   GET /api/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort('name');
  res.json({ success: true, count: categories.length, data: categories });
});

// @desc    Yeni kategori oluştur
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const category = await Category.create({ name, description });
  res.status(201).json({ success: true, data: category });
});

// @desc    Kategori güncelle
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!category) {
    res.status(404);
    throw new Error('Kategori bulunamadı.');
  }
  res.json({ success: true, data: category });
});

// @desc    Kategori sil
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Kategori bulunamadı.');
  }

  // İçinde ürün olan kategori silinemez (veri bütünlüğü)
  const productCount = await Product.countDocuments({ category: category._id });
  if (productCount > 0) {
    res.status(400);
    throw new Error(`Bu kategoride ${productCount} ürün var. Önce ürünleri taşıyın/silin.`);
  }

  await category.deleteOne();
  res.json({ success: true, message: 'Kategori silindi.' });
});
