import Product from '../models/Product.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

/**
 * Ürünü, istekteki kullanıcının seviyesine (tier) göre uygun fiyatla
 * istemciye uygun bir nesneye dönüştürür.
 */
const serializeProduct = (product, tier) => {
  const obj = product.toObject();
  obj.effectivePrice = product.priceForTier(tier);
  obj.isVipPrice = tier === 'vip' && product.vipPrice != null;
  return obj;
};

// @desc    Ürünleri listele (arama + kategori filtresi destekli)
// @route   GET /api/products
// @access  Public (giriş yapılmışsa VIP fiyatı uygulanır)
export const getProducts = asyncHandler(async (req, res) => {
  const { search, category } = req.query;
  const filter = { isActive: true };

  if (category) filter.category = category;
  if (search) filter.name = { $regex: search, $options: 'i' };

  const tier = req.user?.tier || 'standard';
  const products = await Product.find(filter).populate('category', 'name').sort('-createdAt');

  res.json({
    success: true,
    count: products.length,
    data: products.map((p) => serializeProduct(p, tier)),
  });
});

// @desc    Tek ürün detayı
// @route   GET /api/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category', 'name');
  if (!product) {
    res.status(404);
    throw new Error('Ürün bulunamadı.');
  }
  const tier = req.user?.tier || 'standard';
  res.json({ success: true, data: serializeProduct(product, tier) });
});

// @desc    Yeni ürün oluştur
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  await product.populate('category', 'name');
  res.status(201).json({ success: true, data: product });
});

// @desc    Ürün güncelle
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('category', 'name');
  if (!product) {
    res.status(404);
    throw new Error('Ürün bulunamadı.');
  }
  res.json({ success: true, data: product });
});

// @desc    Ürün sil
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Ürün bulunamadı.');
  }
  await product.deleteOne();
  res.json({ success: true, message: 'Ürün silindi.' });
});
