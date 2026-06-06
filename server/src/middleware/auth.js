import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler } from './asyncHandler.js';

/**
 * Korumalı rotalar için kimlik doğrulama middleware'i.
 * Authorization: "Bearer <token>" başlığını okur, JWT'yi doğrular ve
 * ilgili kullanıcıyı req.user'a yerleştirir.
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Yetkisiz erişim: oturum anahtarı bulunamadı.');
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);

  if (!user) {
    res.status(401);
    throw new Error('Yetkisiz erişim: kullanıcı bulunamadı.');
  }

  req.user = user;
  next();
});

/**
 * İsteğe bağlı kimlik doğrulama.
 * Token varsa req.user'ı doldurur, yoksa hata vermeden devam eder.
 * Katalog gibi herkese açık ama girişe göre (VIP fiyat) farklılaşan rotalarda kullanılır.
 */
export const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    } catch {
      // Token geçersizse sessizce yoksay (herkese açık erişime izin ver)
      req.user = null;
    }
  }
  next();
});

/**
 * Rol tabanlı yetkilendirme middleware'i (fabrika fonksiyonu).
 * Örn: authorize('admin') → yalnızca admin rolündeki kullanıcılar geçebilir.
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      throw new Error('Bu işlem için yetkiniz bulunmamaktadır.');
    }
    next();
  };
};
