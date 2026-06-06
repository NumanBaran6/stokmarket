/**
 * 404 - Bulunamayan rotalar için middleware.
 * Tanımlı hiçbir rota eşleşmezse çalışır ve hatayı error handler'a aktarır.
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Bulunamadı - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Merkezi hata yönetimi middleware'i.
 * Tüm controller'lardan gelen hataları yakalar ve kullanıcıya
 * anlamlı, tutarlı bir JSON hata cevabı döndürür.
 */
export const errorHandler = (err, req, res, next) => {
  // Bazı durumlarda status 200 kalmış olabilir; o zaman 500'e çek
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Mongoose: geçersiz ObjectId (CastError)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Geçersiz ID formatı veya kayıt bulunamadı.';
  }

  // Mongoose: şema validasyon hataları
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  // Mongoose: benzersizlik (unique) ihlali, örn. aynı e-posta
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'alan';
    message = `Bu ${field} değeri zaten kullanımda.`;
  }

  // JWT hataları
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Geçersiz oturum anahtarı.';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Oturum süresi doldu, lütfen tekrar giriş yapın.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Stack trace yalnızca geliştirme ortamında gösterilir
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};
