/**
 * Veritabanını örnek verilerle doldurur (kategoriler, ürünler, kullanıcılar, siparişler).
 *
 * İki şekilde kullanılır:
 *  1) CLI:   `npm run seed`  → bağlanır, doldurur, kapanır (mevcut veriyi SİLER).
 *  2) Otomatik: geçici (in-memory) veritabanı modunda sunucu açılışında çağrılır.
 */
import dotenv from 'dotenv';
import { connectDB, disconnectDB } from '../config/db.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

dotenv.config();

export const seedDatabase = async () => {
  await Promise.all([
    User.deleteMany(),
    Category.deleteMany(),
    Product.deleteMany(),
    Order.deleteMany(),
  ]);

  // --- Yönetici ---
  await User.create({
    name: 'Numan Baran',
    email: 'admin@numangida.com',
    password: '123456',
    shopName: 'Numan Gıda Toptan',
    phone: '0212 000 00 00',
    role: 'admin',
    tier: 'standard',
  });

  // --- Kayıtlı bayiler (gerçek isim-soyad) ---
  await User.create([
    { name: 'Ahmet Yılmaz', email: 'vip@numangida.com', password: '123456', shopName: 'Yılmaz Market', phone: '0532 111 11 11', role: 'customer', tier: 'vip' },
    { name: 'Mehmet Demir', email: 'bayi@numangida.com', password: '123456', shopName: 'Demir Gıda', phone: '0533 222 22 22', role: 'customer', tier: 'standard' },
    { name: 'Zeynep Kaya', email: 'vipplus@numangida.com', password: '123456', shopName: 'Kaya Toptan Gıda', phone: '0534 333 33 33', role: 'customer', tier: 'vip+' },
    { name: 'Elif Şahin', email: 'elif@numangida.com', password: '123456', shopName: 'Şahin Market', phone: '0535 444 44 44', role: 'customer', tier: 'standard', moqPrivilege: 'half' },
    { name: 'Mustafa Çelik', email: 'mustafa@numangida.com', password: '123456', shopName: 'Çelik Market', phone: '0536 555 55 55', role: 'customer', tier: 'vip' },
    { name: 'Ayşe Doğan', email: 'ayse@numangida.com', password: '123456', shopName: 'Doğan Bakkal', phone: '0537 666 66 66', role: 'customer', tier: 'standard' },
    { name: 'Can Aydın', email: 'can@numangida.com', password: '123456', shopName: 'Aydın Gıda', phone: '0538 777 77 77', role: 'customer', tier: 'vip+', moqPrivilege: 'none' },
    { name: 'Fatma Yıldız', email: 'fatma@numangida.com', password: '123456', shopName: 'Yıldız Market', phone: '0539 888 88 88', role: 'customer', tier: 'standard' },
    { name: 'Burak Arslan', email: 'burak@numangida.com', password: '123456', shopName: 'Arslan Ticaret', phone: '0531 999 99 99', role: 'customer', tier: 'vip' },
  ]);

  // --- Kategoriler (yalnızca meyve ve sebze) ---
  const [meyve, sebze] = await Category.create([
    { name: 'Meyve', description: 'Mevsim meyveleri, kasa ve kg bazında' },
    { name: 'Sebze', description: 'Taze sebze ve yeşillikler, kasa/çuval bazında' },
  ]);
  const CAT = { M: meyve._id, S: sebze._id };

  // Kompakt ürün listesi:
  // [slug, ad, kategori, fiyat, vipFiyat, birim, moq, stok, üretimYeri, açıklama]
  const raw = [
    // ===== MEYVE =====
    ['elma', 'Kırmızı Elma', 'M', 320, 290, 'kasa', 20, 840, 'Isparta', 'Sulu ve tatlı kırmızı elma; kahvaltılık ve şıralık kullanıma uygun.'],
    ['yesilelma', 'Yeşil Elma', 'M', 340, 305, 'kasa', 20, 560, 'Karaman', 'Ekşimsi ve çıtır yeşil elma; salata ve tatlılar için ideal.'],
    ['muz', 'Muz', 'M', 540, 499, 'kasa', 18, 470, 'Anamur', 'Olgun ve tatlı yerli muz; kabuğu ince, eti yumuşak.'],
    ['portakal2', 'Portakal', 'M', 260, null, 'kasa', 20, 920, 'Antalya', 'Sulu sıkmalık portakal; yüksek verimli ve taze.'],
    ['mandalina', 'Mandalina', 'M', 240, 220, 'kasa', 20, 610, 'Bodrum', 'Kolay soyulan tatlı mandalina; çekirdeksiz.'],
    ['limon', 'Limon', 'M', 210, 195, 'kasa', 18, 730, 'Mersin', 'Bol sulu, kabuğu parlak limon; mutfak ve limonata için.'],
    ['greyfurt', 'Greyfurt', 'M', 230, null, 'kasa', 18, 180, 'Adana', 'Mayhoş ve iri greyfurt; kahvaltı ve diyet için.'],
    ['cilek', 'Çilek', 'M', 75, 68, 'kg', 20, 0, 'Aydın', 'Günlük taze çilek; kokulu ve tatlı.'],
    ['uzum', 'Sultani Üzüm', 'M', 95, 86, 'kg', 20, 470, 'Manisa', 'Çekirdeksiz sultani üzüm; sofralık ve kurutmalık.'],
    ['siyahuzum', 'Siyah Üzüm', 'M', 110, 99, 'kg', 18, 260, 'Tekirdağ', 'İri taneli siyah sofralık üzüm; tatlı ve sulu.'],
    ['armut', 'Armut', 'M', 290, 270, 'kasa', 18, 390, 'Bursa', 'Deveci armut; sert etli, tatlı ve dayanıklı.'],
    ['nar', 'Nar', 'M', 240, null, 'kasa', 15, 280, 'Antalya', 'Ekşi-tatlı nar; bol sulu ve iri taneli.'],
    ['kavun', 'Kavun', 'M', 180, 165, 'kasa', 15, 950, 'Kırkağaç', 'Kırkağaç kavunu; kokulu ve bal gibi tatlı.'],
    ['karpuz2', 'Karpuz', 'M', 160, null, 'kasa', 15, 700, 'Adana', 'İçi kırmızı ve sulu karpuz; yazlık serinletici.'],
    ['seftali', 'Şeftali', 'M', 130, 118, 'kasa', 18, 320, 'Bursa', 'Tüylü sarı şeftali; sulu ve aromalı.'],
    ['kayisi', 'Kayısı', 'M', 145, 130, 'kasa', 18, 240, 'Malatya', 'Malatya kayısısı; etli, tatlı ve aromatik.'],
    ['erik', 'Erik', 'M', 120, 108, 'kasa', 16, 360, 'Bursa', 'Can eriği; mayhoş ve çıtır, mevsimlik lezzet.'],
    ['kiraz', 'Kiraz', 'M', 160, 145, 'kg', 18, 18, 'Afyon', 'Napolyon kiraz; iri, sert ve tatlı.'],
    ['visne3', 'Vişne', 'M', 130, null, 'kg', 18, 0, 'Afyon', 'Ekşi vişne; reçel, şıra ve tatlı için.'],
    ['avokado', 'Avokado', 'M', 380, 350, 'kasa', 15, 175, 'Antalya', 'Kremamsı Hass avokado; kahvaltı ve salata için.'],
    ['ananas', 'Ananas', 'M', 90, null, 'kasa', 16, 140, 'İthal', 'İthal ananas; tatlı, sulu ve aromatik.'],
    ['mango', 'Mango', 'M', 110, 99, 'kasa', 15, 12, 'İthal', 'İthal mango; tatlı ve lifli, tropik aroma.'],
    ['kivi', 'Kivi', 'M', 85, 78, 'kasa', 16, 30, 'Ordu', 'Yeşil kivi; C vitamini deposu, mayhoş.'],
    ['hurma', 'Trabzon Hurması', 'M', 95, null, 'kasa', 16, 210, 'Trabzon', 'Trabzon hurması; yumuşak, ballı ve tatlı.'],
    ['ayva', 'Ayva', 'M', 100, 90, 'kasa', 16, 290, 'Bursa', 'Tüylü sarı ayva; reçel ve tatlı için ideal.'],
    ['nektarin', 'Nektarin', 'M', 135, 122, 'kasa', 18, 25, 'Bursa', 'Tüysüz nektarin; sulu, tatlı ve çıtır.'],
    ['bogurtlen', 'Böğürtlen', 'M', 140, null, 'kg', 15, 22, 'Rize', 'Taze böğürtlen; antioksidan bakımından zengin.'],
    ['ahududu', 'Ahududu', 'M', 180, null, 'kg', 15, 0, 'Rize', 'Kokulu ahududu; tatlı-mayhoş ve narin.'],
    ['yabanmersini', 'Yaban Mersini', 'M', 220, 199, 'kg', 15, 15, 'Rize', 'Taze yaban mersini; küçük taneli ve sağlıklı.'],

    // ===== SEBZE =====
    ['domates', 'Domates', 'S', 180, 160, 'kasa', 20, 880, 'Antalya', 'Sofralık olgun domates; etli ve sulu.'],
    ['salatalik', 'Salatalık', 'S', 150, null, 'kasa', 18, 540, 'Antalya', 'Çıtır salatalık; ince kabuklu ve sulu.'],
    ['patates', 'Patates', 'S', 240, 220, 'çuval', 20, 760, 'Niğde', 'Yıkanmış patates; haşlama ve kızartmalık.'],
    ['sogan', 'Kuru Soğan', 'S', 200, 185, 'çuval', 20, 690, 'Amasya', 'Kuru sarı soğan; dayanıklı ve aromalı.'],
    ['kirmizisogan', 'Kırmızı Soğan', 'S', 220, null, 'çuval', 20, 240, 'İzmir', 'Kırmızı soğan; salata ve közleme için tatlı.'],
    ['sarimsak', 'Sarımsak', 'S', 320, 290, 'kasa', 15, 160, 'Kastamonu', 'Kastamonu sarımsağı; kokulu ve aromalı.'],
    ['havuc', 'Havuç', 'S', 150, 135, 'çuval', 18, 580, 'Konya', 'Yıkanmış havuç; tatlı ve gevrek.'],
    ['biber', 'Sivri Biber', 'S', 160, 145, 'kasa', 16, 360, 'Çanakkale', 'Çıtır sivri biber; hafif acı, kızartmalık.'],
    ['kirmizibiber', 'Kırmızı Biber', 'S', 180, null, 'kasa', 16, 200, 'Antalya', 'Dolmalık kırmızı biber; etli ve tatlı.'],
    ['patlican', 'Patlıcan', 'S', 170, 155, 'kasa', 16, 295, 'Antalya', 'Kemer patlıcan; közleme ve kızartma için ideal.'],
    ['kabak', 'Kabak', 'S', 140, null, 'kasa', 16, 330, 'Antalya', 'Sakız kabağı; ince kabuklu ve yemeklik.'],
    ['marul', 'Kıvırcık Marul', 'S', 110, 99, 'kasa', 15, 240, 'İzmir', 'Taze kıvırcık marul; gevrek ve salatalık.'],
    ['maydanoz', 'Maydanoz', 'S', 90, null, 'kasa', 15, 410, 'Bursa', 'Taze maydanoz; kokulu, demet demet.'],
    ['dereotu', 'Dereotu', 'S', 95, null, 'kasa', 15, 20, 'Bursa', 'Taze dereotu; salata ve yemeklere aroma.'],
    ['nane', 'Nane', 'S', 95, null, 'kasa', 15, 24, 'Hatay', 'Taze nane; çay ve yemeklere ferah aroma.'],
    ['roka', 'Roka', 'S', 100, null, 'kasa', 15, 28, 'İzmir', 'Acımsı roka; salata ve pizza için.'],
    ['ispanak', 'Ispanak', 'S', 120, 108, 'kasa', 18, 320, 'Konya', 'Taze ıspanak; demir bakımından zengin, yemeklik.'],
    ['brokoli', 'Brokoli', 'S', 160, 145, 'kasa', 16, 180, 'Manisa', 'Yeşil brokoli; sıkı taçlı ve taze.'],
    ['karnabahar', 'Karnabahar', 'S', 150, null, 'kasa', 16, 160, 'Manisa', 'Beyaz karnabahar; sıkı ve lekesiz.'],
    ['lahana', 'Beyaz Lahana', 'S', 110, null, 'kasa', 18, 290, 'Bolu', 'Beyaz baş lahana; sarma ve salata için.'],
    ['kirmizilahana', 'Kırmızı Lahana', 'S', 130, null, 'kasa', 16, 150, 'Bolu', 'Kırmızı lahana; salata ve turşuluk, renkli.'],
    ['prasa', 'Pırasa', 'S', 120, 108, 'kasa', 16, 260, 'Çanakkale', 'Taze pırasa; zeytinyağlı ve yemeklik.'],
    ['kereviz', 'Kereviz', 'S', 140, null, 'kasa', 15, 35, 'Antalya', 'Kök kereviz; zeytinyağlı yemekler için.'],
    ['turp', 'Turp', 'S', 110, null, 'kasa', 15, 190, 'Ankara', 'Beyaz turp; salata ve mezelik, gevrek.'],
    ['pancar', 'Pancar', 'S', 120, null, 'kasa', 15, 140, 'Bolu', 'Kırmızı pancar; haşlama ve salatalık.'],
    ['tazefasulye', 'Taze Fasulye', 'S', 170, 155, 'kasa', 18, 230, 'İzmir', 'Taze çalı fasulyesi; etli ve körpe.'],
    ['bezelye', 'Bezelye', 'S', 160, null, 'kasa', 18, 0, 'İzmir', 'Taze bezelye; körpe taneli ve tatlı.'],
    ['misir', 'Mısır', 'S', 130, null, 'kasa', 16, 410, 'Şanlıurfa', 'Tatlı mısır; haşlamalık ve ızgaralık.'],
    ['enginar', 'Enginar', 'S', 180, 165, 'kasa', 15, 0, 'İzmir', 'Temizlenmiş enginar; zeytinyağlı için hazır.'],
    ['bamya', 'Bamya', 'S', 240, null, 'kasa', 15, 16, 'Antalya', 'Minik taze bamya; etli yemekler için.'],
  ];

  const productsData = raw.map(([slug, name, cat, price, vip, unit, moq, stock, origin, desc]) => ({
    name,
    description: desc,
    origin,
    grade: '1. Sınıf',
    category: CAT[cat],
    price,
    vipPrice: vip,
    // VIP+ fiyatı: VIP fiyatının (yoksa normal fiyatın) ~%6 altı
    vipPlusPrice: Math.round((vip ?? price) * 0.94),
    unit,
    moq,
    stock,
    imageUrl: `/images/${slug}.jpg`,
  }));

  const products = await Product.create(productsData);

  // --- Örnek siparişler (ciro ve bekleyen siparişleri göstermek için) ---
  const customers = await User.find({ role: 'customer' });
  const userByEmail = Object.fromEntries(customers.map((u) => [u.email, u]));
  const productByPrefix = (prefix) => products.find((p) => p.name.startsWith(prefix));

  // [müşteri e-postası, durum, teslimata kaç gün, [[ürün, miktar], ...]]
  const orderPlan = [
    ['vip@numangida.com', 'beklemede', 3, [['Kırmızı Elma', 30], ['Domates', 25]]],
    ['bayi@numangida.com', 'beklemede', 5, [['Muz', 20], ['Portakal', 20]]],
    ['vipplus@numangida.com', 'onaylandı', 2, [['Sultani Üzüm', 25], ['Limon', 18]]],
    ['elif@numangida.com', 'beklemede', 7, [['Patates', 25], ['Kuru Soğan', 25]]],
    ['mustafa@numangida.com', 'hazırlanıyor', 1, [['Salatalık', 22], ['Patlıcan', 18]]],
    ['ayse@numangida.com', 'teslim edildi', -3, [['Mandalina', 20], ['Armut', 16]]],
    ['can@numangida.com', 'beklemede', 4, [['Kavun', 18], ['Havuç', 20]]],
    ['burak@numangida.com', 'teslim edildi', -6, [['Nar', 16], ['Kabak', 18]]],
    ['fatma@numangida.com', 'iptal', 6, [['Maydanoz', 15]]],
  ];

  const orderDocs = orderPlan.map(([email, status, days, specs]) => {
    const customer = userByEmail[email];
    const items = specs.map(([prefix, quantity]) => {
      const p = productByPrefix(prefix);
      const priceAtOrder = p.priceForTier(customer.tier);
      return { product: p._id, name: p.name, unit: p.unit, quantity, priceAtOrder };
    });
    const totalAmount = items.reduce((s, it) => s + it.priceAtOrder * it.quantity, 0);
    const shippingFee = totalAmount >= 5000 ? 0 : 350;
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + days);
    return { customer: customer._id, items, totalAmount, shippingFee, deliveryDate, status };
  });

  for (const doc of orderDocs) {
    await Order.create(doc);
  }
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

const invokedDirectly = process.argv[1] && process.argv[1].endsWith('seed.js');
if (invokedDirectly) {
  runAsCli().catch((err) => {
    console.error('❌ Seed hatası:', err);
    process.exit(1);
  });
}
