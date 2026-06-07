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

  await User.create({
    name: 'Zeynep Kaya',
    email: 'vipplus@numangida.com',
    password: '123456',
    shopName: 'Kaya Manav - VIP+ Bayi',
    phone: '0534 333 33 33',
    role: 'customer',
    tier: 'vip+',
  });

  // --- Kategoriler (yalnızca meyve ve sebze) ---
  const [meyve, sebze] = await Category.create([
    { name: 'Meyve', description: 'Mevsim meyveleri, kasa ve kg bazında' },
    { name: 'Sebze', description: 'Taze sebze ve yeşillikler, kasa/çuval bazında' },
  ]);

  // --- Ürünler (taze meyve & sebze, toptan birimler, yüksek MOQ) ---
  const productsData = [
    // ----- MEYVE -----
    {
      name: 'Kırmızı Elma',
      description: 'Birinci sınıf kırmızı elma. Yaklaşık 13 kg kasa.',
      category: meyve._id,
      price: 320,
      vipPrice: 290,
      unit: 'kasa',
      moq: 15,
      stock: 184,
      imageUrl: '/images/elma.jpg',
    },
    {
      name: 'Muz (İthal)',
      description: 'Olgun ithal muz. 18 kg koli.',
      category: meyve._id,
      price: 540,
      vipPrice: 499,
      unit: 'koli',
      moq: 12,
      stock: 96,
      imageUrl: '/images/muz.jpg',
    },
    {
      name: 'Portakal (Sıkmalık)',
      description: 'Sulu, sıkmalık portakal. 15 kg kasa.',
      category: meyve._id,
      price: 260,
      vipPrice: null,
      unit: 'kasa',
      moq: 20,
      stock: 233,
      imageUrl: '/images/portakal.jpg',
    },
    {
      name: 'Çilek',
      description: 'Günlük taze çilek. Kg bazında satış.',
      category: meyve._id,
      price: 75,
      vipPrice: 68,
      unit: 'kg',
      moq: 50,
      stock: 412,
      imageUrl: '/images/cilek.jpg',
    },
    {
      name: 'Sultani Üzüm',
      description: 'Çekirdeksiz sultani üzüm. Yaklaşık 5 kg kasa.',
      category: meyve._id,
      price: 95,
      vipPrice: 86,
      unit: 'kasa',
      moq: 18,
      stock: 147,
      imageUrl: '/images/uzum.jpg',
    },
    {
      name: 'Limon',
      description: 'Kabuğu ince, sulu limon. 15 kg kasa.',
      category: meyve._id,
      price: 210,
      vipPrice: 195,
      unit: 'kasa',
      moq: 12,
      stock: 168,
      imageUrl: '/images/limon.jpg',
    },
    {
      name: 'Mandalina',
      description: 'Tatlı kış mandalinası. Yaklaşık 10 kg kasa.',
      category: meyve._id,
      price: 180,
      vipPrice: 165,
      unit: 'kasa',
      moq: 15,
      stock: 256,
      imageUrl: '/images/mandalina.jpg',
    },
    {
      name: 'Armut (Deveci)',
      description: 'Deveci armut. Yaklaşık 13 kg kasa.',
      category: meyve._id,
      price: 290,
      vipPrice: 270,
      unit: 'kasa',
      moq: 12,
      stock: 134,
      imageUrl: '/images/armut.jpg',
    },
    {
      name: 'Kavun',
      description: 'Kırkağaç kavunu. Kg bazında satış.',
      category: meyve._id,
      price: 28,
      vipPrice: 25,
      unit: 'kg',
      moq: 80,
      stock: 690,
      imageUrl: '/images/kavun.jpg',
    },
    {
      name: 'Nar',
      description: 'Ekşi-tatlı nar. Yaklaşık 12 kg kasa.',
      category: meyve._id,
      price: 240,
      vipPrice: null,
      unit: 'kasa',
      moq: 10,
      stock: 118,
      imageUrl: '/images/nar.jpg',
    },
    {
      name: 'Avokado',
      description: 'Yağlı, kremamsı avokado. Yaklaşık 4 kg kasa.',
      category: meyve._id,
      price: 380,
      vipPrice: 350,
      unit: 'kasa',
      moq: 8,
      stock: 73,
      imageUrl: '/images/avokado.jpg',
    },
    {
      name: 'Erik',
      description: 'Sulu, tatlı erik. Yaklaşık 10 kg kasa.',
      category: meyve._id,
      price: 300,
      vipPrice: 275,
      unit: 'kasa',
      moq: 10,
      stock: 91,
      imageUrl: '/images/erik.jpg',
    },

    // ----- SEBZE -----
    {
      name: 'Domates (Sofralık)',
      description: 'Sofralık olgun domates. Yaklaşık 10 kg kasa.',
      category: sebze._id,
      price: 180,
      vipPrice: 160,
      unit: 'kasa',
      moq: 20,
      stock: 312,
      imageUrl: '/images/domates.jpg',
    },
    {
      name: 'Salatalık',
      description: 'Çıtır salatalık. 10 kg kasa.',
      category: sebze._id,
      price: 150,
      vipPrice: null,
      unit: 'kasa',
      moq: 15,
      stock: 198,
      imageUrl: '/images/salatalik.jpg',
    },
    {
      name: 'Patates',
      description: 'Yıkanmış patates. 25 kg çuval.',
      category: sebze._id,
      price: 240,
      vipPrice: 220,
      unit: 'çuval',
      moq: 20,
      stock: 276,
      imageUrl: '/images/patates.jpg',
    },
    {
      name: 'Kuru Soğan',
      description: 'Kuru soğan. 25 kg çuval.',
      category: sebze._id,
      price: 200,
      vipPrice: 185,
      unit: 'çuval',
      moq: 25,
      stock: 241,
      imageUrl: '/images/sogan.jpg',
    },
    {
      name: 'Kıvırcık Marul',
      description: 'Taze kıvırcık marul. 12 adetlik kasa.',
      category: sebze._id,
      price: 110,
      vipPrice: 99,
      unit: 'kasa',
      moq: 10,
      stock: 87,
      imageUrl: '/images/marul.jpg',
    },
    {
      name: 'Maydanoz',
      description: 'Taze maydanoz. 30 demetlik kasa.',
      category: sebze._id,
      price: 90,
      vipPrice: null,
      unit: 'kasa',
      moq: 10,
      stock: 123,
      imageUrl: '/images/maydanoz.jpg',
    },
    {
      name: 'Sivri Biber',
      description: 'Taze sivri biber. Yaklaşık 8 kg kasa.',
      category: sebze._id,
      price: 160,
      vipPrice: 145,
      unit: 'kasa',
      moq: 12,
      stock: 142,
      imageUrl: '/images/biber.jpg',
    },
    {
      name: 'Patlıcan',
      description: 'Kemer patlıcan. Yaklaşık 10 kg kasa.',
      category: sebze._id,
      price: 170,
      vipPrice: 155,
      unit: 'kasa',
      moq: 12,
      stock: 109,
      imageUrl: '/images/patlican.jpg',
    },
    {
      name: 'Havuç',
      description: 'Yıkanmış havuç. 20 kg çuval.',
      category: sebze._id,
      price: 150,
      vipPrice: 135,
      unit: 'çuval',
      moq: 15,
      stock: 203,
      imageUrl: '/images/havuc.jpg',
    },
    {
      name: 'Kabak',
      description: 'Taze sakız kabağı. Yaklaşık 10 kg kasa.',
      category: sebze._id,
      price: 140,
      vipPrice: null,
      unit: 'kasa',
      moq: 12,
      stock: 96,
      imageUrl: '/images/kabak.jpg',
    },
  ];

  // Ürünlerin üretim yerleri (Türkiye'nin öne çıkan üretim bölgeleri)
  const origins = {
    'Kırmızı Elma': 'Isparta',
    'Muz (İthal)': 'Anamur',
    'Portakal (Sıkmalık)': 'Antalya',
    'Çilek': 'Aydın',
    'Sultani Üzüm': 'Manisa',
    'Limon': 'Mersin',
    'Mandalina': 'Antalya',
    'Armut': 'Bursa',
    'Kavun': 'Kırkağaç',
    'Nar': 'Antalya',
    'Avokado': 'Antalya',
    'Erik': 'Bursa',
    'Domates (Sofralık)': 'Antalya',
    'Salatalık': 'Antalya',
    'Patates': 'Niğde',
    'Kuru Soğan': 'Amasya',
    'Kıvırcık Marul': 'İzmir',
    'Maydanoz': 'Bursa',
    'Sivri Biber': 'Çanakkale',
    'Patlıcan': 'Antalya',
    'Havuç': 'Konya',
    'Kabak': 'Antalya',
  };

  for (const p of productsData) {
    // VIP+ fiyatı: VIP fiyatının ~%6 altı (VIP yoksa normal fiyatın ~%12 altı)
    const base = p.vipPrice ?? p.price;
    p.vipPlusPrice = Math.round(base * 0.94);
    // Üretim yeri ve sınıf bilgisi
    p.origin = origins[p.name] || 'Türkiye';
    p.grade = '1. Sınıf';
  }

  await Product.create(productsData);
};

/**
 * CLI girişi: `npm run seed` ile çağrıldığında bağlantıyı kendisi yönetir.
 */
const runAsCli = async () => {
  console.log('🌱 Seed başlıyor...');
  await connectDB();
  await seedDatabase();
  console.log('\n✅ Seed tamamlandı! Örnek hesaplar:');
  console.log('   👑 Admin : admin@numangida.com     / 123456');
  console.log('   ⭐ VIP   : vip@numangida.com       / 123456');
  console.log('   💎 VIP+  : vipplus@numangida.com   / 123456');
  console.log('   🛒 Bayi  : bayi@numangida.com      / 123456');
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
