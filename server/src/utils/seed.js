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
    name: 'Numan Toptancı',
    email: 'admin@numangida.com',
    password: '123456',
    shopName: 'Numan Gıda Toptan Hal',
    phone: '0212 000 00 00',
    role: 'admin',
    tier: 'standard',
  });

  await User.create({
    name: 'Ahmet Yılmaz',
    email: 'vip@numangida.com',
    password: '123456',
    shopName: 'Yılmaz Manav - VIP Bayi',
    phone: '0532 111 11 11',
    role: 'customer',
    tier: 'vip',
  });

  await User.create({
    name: 'Mehmet Demir',
    email: 'bayi@numangida.com',
    password: '123456',
    shopName: 'Demir Manav',
    phone: '0533 222 22 22',
    role: 'customer',
    tier: 'standard',
  });

  // --- Kategoriler ---
  const [meyve, sebze, yesillik] = await Category.create([
    { name: 'Meyve', description: 'Mevsim meyveleri, kasa ve kg bazında' },
    { name: 'Sebze', description: 'Taze sebzeler, kasa ve çuval bazında' },
    { name: 'Yeşillik', description: 'Marul, maydanoz, roka gibi taze yeşillikler' },
  ]);

  // --- Ürünler (taze meyve & sebze, toptan birimlerle) ---
  await Product.create([
    {
      name: 'Kırmızı Elma',
      description: 'Birinci sınıf kırmızı elma. Yaklaşık 13 kg kasa.',
      category: meyve._id,
      price: 320,
      vipPrice: 290,
      unit: 'kasa',
      moq: 2,
      stock: 80,
    },
    {
      name: 'Muz (İthal)',
      description: 'Olgun ithal muz. 18 kg koli.',
      category: meyve._id,
      price: 540,
      vipPrice: 499,
      unit: 'koli',
      moq: 1,
      stock: 60,
    },
    {
      name: 'Portakal (Sıkmalık)',
      description: 'Sulu, sıkmalık portakal. 15 kg kasa.',
      category: meyve._id,
      price: 260,
      vipPrice: null,
      unit: 'kasa',
      moq: 3,
      stock: 100,
    },
    {
      name: 'Çilek',
      description: 'Günlük taze çilek. Kg bazında satış.',
      category: meyve._id,
      price: 75,
      vipPrice: 68,
      unit: 'kg',
      moq: 10,
      stock: 200,
    },
    {
      name: 'Domates (Sofralık)',
      description: 'Sofralık olgun domates. Yaklaşık 10 kg kasa.',
      category: sebze._id,
      price: 180,
      vipPrice: 160,
      unit: 'kasa',
      moq: 2,
      stock: 120,
    },
    {
      name: 'Salatalık',
      description: 'Çıtır salatalık. 10 kg kasa.',
      category: sebze._id,
      price: 150,
      vipPrice: null,
      unit: 'kasa',
      moq: 2,
      stock: 90,
    },
    {
      name: 'Patates',
      description: 'Yıkanmış patates. 25 kg çuval.',
      category: sebze._id,
      price: 240,
      vipPrice: 220,
      unit: 'çuval',
      moq: 1,
      stock: 150,
    },
    {
      name: 'Kuru Soğan',
      description: 'Kuru soğan. 25 kg çuval.',
      category: sebze._id,
      price: 200,
      vipPrice: 185,
      unit: 'çuval',
      moq: 1,
      stock: 130,
    },
    {
      name: 'Kıvırcık Marul',
      description: 'Taze kıvırcık marul. 12 adetlik kasa.',
      category: yesillik._id,
      price: 110,
      vipPrice: 99,
      unit: 'kasa',
      moq: 2,
      stock: 70,
    },
    {
      name: 'Maydanoz',
      description: 'Taze maydanoz. 30 demetlik kasa.',
      category: yesillik._id,
      price: 90,
      vipPrice: null,
      unit: 'kasa',
      moq: 1,
      stock: 110,
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
  console.log('   👑 Admin : admin@numangida.com / 123456');
  console.log('   ⭐ VIP   : vip@numangida.com   / 123456');
  console.log('   🛒 Bayi  : bayi@numangida.com  / 123456');
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
