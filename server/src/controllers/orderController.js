import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

// @desc    Yeni sipariş oluştur (haftalık sipariş listesi)
// @route   POST /api/orders
// @access  Private/Customer
export const createOrder = asyncHandler(async (req, res) => {
  const { items, deliveryDate, note } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error('Sipariş en az bir ürün içermelidir.');
  }

  // Teslimat tarihi: geçerli, bugünden itibaren en fazla 1 ay içinde olmalı
  const date = new Date(deliveryDate);
  if (Number.isNaN(date.getTime())) {
    res.status(400);
    throw new Error('Geçerli bir teslimat tarihi seçiniz.');
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 31);
  if (date < today || date > maxDate) {
    res.status(400);
    throw new Error('Teslimat tarihi bugünden itibaren en fazla 1 ay içinde olmalıdır.');
  }

  const orderItems = [];
  let totalAmount = 0;

  // Her kalem için ürünü doğrula: var mı, aktif mi, MOQ ve stok uygun mu?
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product || !product.isActive) {
      res.status(404);
      throw new Error(`Ürün bulunamadı veya satışta değil: ${item.product}`);
    }

    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) {
      res.status(400);
      throw new Error(`${product.name} için geçersiz miktar.`);
    }

    // Minimum sipariş miktarı (MOQ) kontrolü — üyenin ayrıcalığı dikkate alınır
    const effectiveMoq = product.moqForPrivilege(req.user.moqPrivilege);
    if (quantity < effectiveMoq) {
      res.status(400);
      throw new Error(
        `${product.name} için minimum sipariş ${effectiveMoq} ${product.unit}'dir.`
      );
    }

    // Stok kontrolü
    if (quantity > product.stock) {
      res.status(400);
      throw new Error(
        `${product.name} için yeterli stok yok (stok: ${product.stock} ${product.unit}).`
      );
    }

    // Fiyat, siparişi veren kullanıcının seviyesine göre belirlenir (VIP indirimi)
    const unitPrice = product.priceForTier(req.user.tier);
    totalAmount += unitPrice * quantity;

    orderItems.push({
      product: product._id,
      name: product.name,
      unit: product.unit,
      quantity,
      priceAtOrder: unitPrice,
    });
  }

  // Kargo ücreti: 5.000 ₺ ve üzeri siparişlerde ücretsiz, altında sabit ücret
  const FREE_SHIPPING_THRESHOLD = 5000;
  const SHIPPING_FEE = 350;
  const subtotal = Math.round(totalAmount * 100) / 100;
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

  const order = await Order.create({
    customer: req.user._id,
    items: orderItems,
    totalAmount: subtotal,
    shippingFee,
    deliveryDate: date,
    note,
  });

  // Sipariş başarılıysa stokları düş
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
  }

  res.status(201).json({ success: true, data: order });
});

// @desc    Ciro ve sipariş istatistikleri (yönetici özeti)
// @route   GET /api/orders/stats
// @access  Private/Admin
export const getOrderStats = asyncHandler(async (req, res) => {
  const orders = await Order.find();

  // İptal edilenler ciroya dahil edilmez
  const aktif = orders.filter((o) => o.status !== 'iptal');
  const revenue = aktif.reduce((sum, o) => sum + o.totalAmount + (o.shippingFee || 0), 0);

  // Duruma göre dağılım
  const byStatus = {};
  for (const o of orders) byStatus[o.status] = (byStatus[o.status] || 0) + 1;

  // En çok ciro yapan ürünler
  const prodMap = {};
  for (const o of aktif) {
    for (const it of o.items) {
      prodMap[it.name] = (prodMap[it.name] || 0) + it.quantity * it.priceAtOrder;
    }
  }
  const topProducts = Object.entries(prodMap)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  res.json({
    success: true,
    data: {
      revenue,
      orderCount: orders.length,
      activeCount: aktif.length,
      avgOrder: aktif.length ? revenue / aktif.length : 0,
      byStatus,
      topProducts,
    },
  });
});

// @desc    Siparişleri listele (müşteri: kendi siparişleri, admin: tüm siparişler)
// @route   GET /api/orders
// @access  Private
export const getOrders = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { customer: req.user._id };
  const orders = await Order.find(filter)
    .populate('customer', 'name shopName email')
    .sort('-createdAt');
  res.json({ success: true, count: orders.length, data: orders });
});

// @desc    Tek sipariş detayı
// @route   GET /api/orders/:id
// @access  Private (sahibi veya admin)
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('customer', 'name shopName email phone');
  if (!order) {
    res.status(404);
    throw new Error('Sipariş bulunamadı.');
  }

  // Müşteri yalnızca kendi siparişini görebilir
  const isOwner = order.customer._id.toString() === req.user._id.toString();
  if (req.user.role !== 'admin' && !isOwner) {
    res.status(403);
    throw new Error('Bu siparişi görüntüleme yetkiniz yok.');
  }

  res.json({ success: true, data: order });
});

// @desc    Sipariş durumunu güncelle
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Sipariş bulunamadı.');
  }
  order.status = status;
  await order.save();
  res.json({ success: true, data: order });
});

// @desc    Sipariş sil/iptal et
// @route   DELETE /api/orders/:id
// @access  Private (sahibi veya admin)
export const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Sipariş bulunamadı.');
  }

  const isOwner = order.customer.toString() === req.user._id.toString();
  if (req.user.role !== 'admin' && !isOwner) {
    res.status(403);
    throw new Error('Bu siparişi silme yetkiniz yok.');
  }

  // İptal edilen sipariş için stokları geri ekle
  if (order.status !== 'iptal' && order.status !== 'teslim edildi') {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }
  }

  await order.deleteOne();
  res.json({ success: true, message: 'Sipariş silindi/iptal edildi.' });
});
