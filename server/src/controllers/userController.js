import User from '../models/User.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const VALID_TIERS = ['standard', 'vip', 'vip+'];

// @desc    Kayıtlı bayileri (müşterileri) listele
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req, res) => {
  // Yalnızca müşteri (bayi) rolündeki üyeler yönetilir
  const users = await User.find({ role: 'customer' }).select('-password').sort('-createdAt');
  res.json({ success: true, count: users.length, data: users });
});

// @desc    Bir üyenin seviyesini (tier) güncelle — VIP / VIP+ ver
// @route   PUT /api/users/:id/tier
// @access  Private/Admin
export const updateUserTier = asyncHandler(async (req, res) => {
  const { tier } = req.body;

  if (!VALID_TIERS.includes(tier)) {
    res.status(400);
    throw new Error('Geçersiz üyelik seviyesi.');
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('Üye bulunamadı.');
  }

  if (user.role === 'admin') {
    res.status(400);
    throw new Error('Yönetici hesabının seviyesi değiştirilemez.');
  }

  user.tier = tier;
  await user.save();

  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      shopName: user.shopName,
      tier: user.tier,
    },
  });
});
