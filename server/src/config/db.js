import mongoose from 'mongoose';

// In-memory sunucu referansı (yalnızca geliştirme ortamında kullanılır)
let memoryServer = null;

/**
 * MongoDB bağlantısını kurar.
 *
 * - .env içinde MONGODB_URI tanımlıysa (örn. MongoDB Atlas) doğrudan ona bağlanır.
 * - Tanımlı değilse ve ortam "production" değilse, geliştirici kolaylığı için
 *   mongodb-memory-server ile geçici (kalıcı olmayan) bir veritabanı başlatır.
 *   Böylece proje, Atlas hesabı olmadan da `npm run dev` ile ayağa kalkar.
 */
export const connectDB = async () => {
  let uri = process.env.MONGODB_URI;

  if (!uri) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Production ortamında MONGODB_URI tanımlanmalıdır.');
    }
    // Geliştirme ortamı: geçici bellek içi veritabanı
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri();
    console.log('⚠️  MONGODB_URI bulunamadı → geçici (in-memory) veritabanı kullanılıyor.');
  }

  const conn = await mongoose.connect(uri, {
    // Mongoose 8 varsayılanları yeterli; ek seçenekler gerekirse buraya eklenir
  });

  console.log(`✅ MongoDB bağlandı: ${conn.connection.host}`);
  return conn;
};

/**
 * Bağlantıyı (ve varsa bellek sunucusunu) düzgünce kapatır.
 */
export const disconnectDB = async () => {
  await mongoose.connection.close();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
};
