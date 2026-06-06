/**
 * Veritabanını örnek verilerle doldurur (kategoriler, ürünler, kullanıcılar).
 *
 * İki şekilde kullanılır:
 *  1) CLI:   `npm run seed`  → bağlanır, doldurur, kapanır (mevcut veriyi SİLER).
 *  2) Otomatik: geçici (in-memory) veritabanı modunda sunucu açılışında
 *     index.js tarafından çağrılır (seedDatabase).
 */
import dotenv from 'dotenv';
import { connectDB, disconnectDB } from '../config/db.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

dotenv.config();

/**
 * Veritabanını sıfırlayıp örnek verilerle doldurur.
 * Aktif bir Mongoose bağlantısı olduğunu varsayar.
 */
export const seedDatabase = async () => {
  await Promise.all([
    User.deleteMany(),
    Category.deleteMany(),
    Product.deleteMany(),
    Order.deleteMany(),
  ]);

  // --- Kullanıcılar (create → pre('save') hook'u şifreleri hashler) ---
  await User.create({
    name: 'Toptancı Yönetici',
    email: 'admin@stokmarket.com',
    password: '123456',
    shopName: 'StokMarket Toptan Depo',
    phone: '0212 000 00 00',
    role: 'admin',
    tier: 'standard',
  });

  await User.create({
    name: 'Ahmet Yılmaz',
    email: 'vip@stokmarket.com',
    password: '123456',
    shopName: 'Yılmaz Market (VIP Bayi)',
    phone: '0532 111 11 11',
    role: 'customer',
    tier: 'vip',
  });

  await User.create({
    name: 'Mehmet Demir',
    email: 'bayi@stokmarket.com',
    password: '123456',
    shopName: 'Demir Bakkal',
    phone: '0533 222 22 22',
    role: 'customer',
    tier: 'standard',
  });

  // --- Kategoriler ---
  const [gida, icecek, temizlik] = await Category.create([
    { name: 'Gıda', description: 'Kuru gıda ve temel besin ürünleri' },
    { name: 'İçecek', description: 'Su, gazlı ve gazsız içecekler' },
    { name: 'Temizlik', description: 'Deterjan ve hijyen ürünleri' },
  ]);

  // --- Ürünler ---
  await Product.create([
    {
      name: 'Ayçiçek Yağı 5L (Koli/4 adet)',
      description: 'Restoran tipi ayçiçek yağı. Koli içi 4 adet.',
      category: gida._id,
      price: 850,
      vipPrice: 790,
      unit: 'koli',
      moq: 2,
      stock: 120,
    },
    {
      name: 'Toz Şeker 50kg Çuval',
      description: 'Kristal toz şeker, 50 kg çuval.',
      category: gida._id,
      price: 1450,
      vipPrice: 1380,
      unit: 'çuval',
      moq: 1,
      stock: 60,
    },
    {
      name: 'Makarna 500g (Koli/20 adet)',
      description: 'Burgu makarna, koli içi 20 paket.',
      category: gida._id,
      price: 320,
      vipPrice: null,
      unit: 'koli',
      moq: 3,
      stock: 200,
    },
    {
      name: 'Doğal Kaynak Suyu 1.5L (Koli/6)',
      description: 'Doğal kaynak suyu, koli içi 6 şişe.',
      category: icecek._id,
      price: 90,
      vipPrice: 82,
      unit: 'koli',
      moq: 5,
      stock: 500,
    },
    {
      name: 'Kola 330ml (Koli/24)',
      description: 'Gazlı içecek, koli içi 24 kutu.',
      category: icecek._id,
      price: 420,
      vipPrice: 399,
      unit: 'koli',
      moq: 2,
      stock: 150,
    },
    {
      name: 'Bulaşık Deterjanı 4L (Koli/4)',
      description: 'Konsantre bulaşık deterjanı, koli içi 4 bidon.',
      category: temizlik._id,
      price: 560,
      vipPrice: 520,
      unit: 'koli',
      moq: 1,
      stock: 80,
    },
    {
      name: 'Çamaşır Suyu 5L (Koli/4)',
      description: 'Klasik çamaşır suyu, koli içi 4 adet.',
      category: temizlik._id,
      price: 300,
      vipPrice: null,
      unit: 'koli',
      moq: 2,
      stock: 90,
    },
  ]);
};

/**
 * CLI girişi: `npm run seed` ile çağrıldığında bağlantıyı kendisi yönetir.
 */
const runAsCli = async () => {
  console.log('🌱 Seed başlıyor...');
  await connectDB();
  await seedDatabase();
  console.log('\n✅ Seed tamamlandı! Örnek hesaplar:');
  console.log('   👑 Admin : admin@stokmarket.com / 123456');
  console.log('   ⭐ VIP   : vip@stokmarket.com   / 123456');
  console.log('   🛒 Bayi  : bayi@stokmarket.com  / 123456');
  await disconnectDB();
  process.exit(0);
};

// Bu dosya doğrudan çalıştırıldıysa CLI modunu başlat
const invokedDirectly = process.argv[1] && process.argv[1].endsWith('seed.js');
if (invokedDirectly) {
  runAsCli().catch((err) => {
    console.error('❌ Seed hatası:', err);
    process.exit(1);
  });
}
