import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';
import { seedDatabase } from './utils/seed.js';

// Ortam değişkenlerini yükle
dotenv.config();

const PORT = process.env.PORT || 5000;

// Önce veritabanına bağlan, sonra sunucuyu başlat
const startServer = async () => {
  try {
    await connectDB();

    // Geçici (in-memory) veritabanı modunda örnek veriyle otomatik doldur,
    // böylece proje Atlas olmadan da dolu bir katalogla ayağa kalkar.
    if (!process.env.MONGODB_URI && process.env.NODE_ENV !== 'production') {
      await seedDatabase();
      console.log('🌱 Geçici veritabanı örnek verilerle dolduruldu.');
      console.log('   👑 admin@numangida.com | ⭐ vip@numangida.com | 🛒 bayi@numangida.com  (şifre: 123456)');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Numan Gıda API ${PORT} portunda çalışıyor (${process.env.NODE_ENV || 'development'})`);
    });
  } catch (error) {
    console.error('❌ Sunucu başlatılamadı:', error.message);
    process.exit(1);
  }
};

startServer();

// Yakalanmayan promise reddi durumunda düzgün kapanış
process.on('unhandledRejection', (err) => {
  console.error('❌ İşlenmeyen hata:', err.message);
  process.exit(1);
});
