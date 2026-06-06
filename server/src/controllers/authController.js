import User from '../models/User.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { generateToken } from '../utils/generateToken.js';

/**
 * Kullanıcı verisini (şifre hariç) ve token'ı standart formatta döndürür.
 */
const buildAuthResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  shopName: user.shopName,
  phone: user.phone,
  role: user.role,
  tier: user.tier,
  token: generateToken(user._id),
});

// @desc    Yeni kullanıcı kaydı
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, shopName, phone } = req.body;

  if (!name || !email || !password || !shopName) {
    res.status(400);
    throw new Error('Ad, e-posta, şifre ve dükkan adı zorunludur.');
  }

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error('Bu e-posta adresi zaten kayıtlı.');
  }

  // Not: Güvenlik için register üzerinden rol/tier atanmaz; herkes "customer" başlar.
  const user = await User.create({ name, email, password, shopName, phone });

  res.status(201).json({ success: true, data: buildAuthResponse(user) });
});

// @desc    Kullanıcı girişi
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('E-posta ve şifre zorunludur.');
  }

  // Şifre select:false olduğu için açıkça istiyoruz
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('E-posta veya şifre hatalı.');
  }

  res.json({ success: true, data: buildAuthResponse(user) });
});

// @desc    Giriş yapmış kullanıcının bilgilerini getir
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = req.user;
  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      shopName: user.shopName,
      phone: user.phone,
      role: user.role,
      tier: user.tier,
    },
  });
});
