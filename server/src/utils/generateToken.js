import jwt from 'jsonwebtoken';

/**
 * Verilen kullanıcı ID'si için JWT üretir.
 * Token, .env'deki JWT_SECRET ile imzalanır ve JWT_EXPIRE süresi kadar geçerlidir.
 */
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};
