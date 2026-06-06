/**
 * Async controller fonksiyonlarını saran yardımcı.
 * Her controller'a tek tek try-catch yazmak yerine, oluşan hataları
 * otomatik olarak next()'e (error handler middleware'ine) iletir.
 */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
