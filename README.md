# 🛒 StokMarket — "Raflarını Doldur"

Perakendecilerin (bayilerin) toptancıdan **haftalık sipariş** verebildiği, minimum
sipariş miktarı (MOQ) ve **VIP bayi fiyatları** içeren **B2B** sipariş & stok takip platformu.

> **BLG330 — Web Programlama** dönem projesi · MERN Stack (MongoDB, Express, React, Node.js)

---

## ✨ Öne Çıkan Özellikler

- 🔢 **Minimum Sipariş Miktarı (MOQ):** Her ürün için "en az X koli" kuralı; hem arayüzde hem backend'de zorunlu kılınır.
- ⭐ **VIP Bayi Fiyatları:** VIP seviyesindeki bayilere ürün bazında özel indirimli fiyat. Fiyat sunucu tarafında belirlenir.
- 📅 **Teslimat Günü Seçimi:** Sipariş verirken haftanın teslimat günü seçilir.
- 🧾 **Otomatik Fatura:** Sipariş onaylanınca benzersiz fatura numarası üretilir, fatura detayı görüntülenir.
- 🔔 **Haftalık Sipariş Hatırlatması:** Hafta başında bayilere sipariş hatırlatma afişi.
- 📦 **Stok Takibi:** Sipariş verilince stok düşer, iptal edilince geri eklenir.
- 👑 **Rol Tabanlı Erişim:** `admin` (toptancı) ve `customer` (bayi) rolleri; korumalı rotalar.

---

## 🧱 Kullanılan Teknolojiler

| Katman | Teknolojiler |
|--------|--------------|
| **Frontend** | React 18, React Router 6, Vite, Axios, Context API, özgün CSS (responsive) |
| **Backend** | Node.js, Express 4, MVC mimarisi |
| **Veritabanı** | MongoDB + Mongoose (Atlas veya geçici in-memory) |
| **Kimlik Doğrulama** | JWT, bcryptjs |
| **Diğer** | CORS, morgan (loglama), dotenv |

---

## 📂 Proje Yapısı

```
.
├── server/                  # Backend (Node + Express)
│   ├── src/
│   │   ├── config/          # Veritabanı bağlantısı
│   │   ├── controllers/     # İş mantığı (auth, product, category, order)
│   │   ├── middleware/      # auth, hata yönetimi, async sarmalayıcı
│   │   ├── models/          # Mongoose şemaları (User, Category, Product, Order)
│   │   ├── routes/          # API router'ları
│   │   ├── utils/           # JWT üretimi, seed
│   │   ├── app.js           # Express uygulaması
│   │   └── index.js         # Sunucu giriş noktası
│   └── package.json
│
├── client/                  # Frontend (React + Vite)
│   ├── src/
│   │   ├── api/             # axios örneği (JWT interceptor)
│   │   ├── components/      # Tekrar kullanılabilir bileşenler (11 adet)
│   │   ├── context/         # AuthContext, CartContext, ToastContext
│   │   ├── pages/           # 9 sayfa (Katalog, Sepet, Admin, ...)
│   │   ├── styles/          # Özgün responsive CSS
│   │   └── utils/           # Biçimlendirme yardımcıları
│   └── package.json
│
├── docs/                    # UML diyagramları (Mermaid)
│   ├── use-case-diagram.md
│   ├── activity-diagram.md
│   ├── er-diagram.md
│   └── component-diagram.md
└── README.md
```

---

## 🚀 Kurulum ve Çalıştırma

Gereksinim: **Node.js 18+** ve npm.

### 1. Backend

```bash
cd server
npm install
cp .env.example .env      # gerekirse değerleri düzenleyin
npm run dev               # http://localhost:5001
```

> 💡 `.env` içinde `MONGODB_URI` **boş** bırakılırsa, geliştirme ortamında otomatik olarak
> geçici (in-memory) bir veritabanı başlatılır ve örnek verilerle doldurulur. Böylece
> proje **Atlas hesabı olmadan** da çalışır. Kalıcı veri için Atlas bağlantısı girin (aşağıda).

### 2. Frontend

```bash
cd client
npm install
npm run dev               # http://localhost:5173
```

Vite, `/api` isteklerini otomatik olarak `http://localhost:5001` adresindeki backend'e yönlendirir.

### 3. (Opsiyonel) Örnek veriyi elle yükle

```bash
cd server
npm run seed
```

---

## 👤 Demo Hesaplar

| Rol | E-posta | Şifre |
|-----|---------|-------|
| 👑 Yönetici (Admin) | `admin@stokmarket.com` | `123456` |
| ⭐ VIP Bayi | `vip@stokmarket.com` | `123456` |
| 🛒 Standart Bayi | `bayi@stokmarket.com` | `123456` |

---

## 🔌 API Endpoint'leri

| Metot | Yol | Erişim | Açıklama |
|-------|-----|--------|----------|
| `POST` | `/api/auth/register` | Public | Bayi kaydı |
| `POST` | `/api/auth/login` | Public | Giriş (JWT döner) |
| `GET` | `/api/auth/me` | Private | Profil bilgisi |
| `GET` | `/api/products` | Public | Ürünleri listele (arama + filtre, VIP fiyat) |
| `GET` | `/api/products/:id` | Public | Ürün detayı |
| `POST` | `/api/products` | Admin | Ürün ekle |
| `PUT` | `/api/products/:id` | Admin | Ürün güncelle |
| `DELETE` | `/api/products/:id` | Admin | Ürün sil |
| `GET` | `/api/categories` | Public | Kategorileri listele |
| `POST` / `PUT` / `DELETE` | `/api/categories/:id?` | Admin | Kategori CRUD |
| `GET` | `/api/orders` | Private | Siparişleri listele (bayi: kendi, admin: tümü) |
| `POST` | `/api/orders` | Customer | Sipariş oluştur (MOQ/stok kontrolü) |
| `GET` | `/api/orders/:id` | Private | Sipariş/fatura detayı |
| `PUT` | `/api/orders/:id/status` | Admin | Sipariş durumu güncelle |
| `DELETE` | `/api/orders/:id` | Private | Sipariş iptal/sil |

---

## 📊 UML & Tasarım Dokümantasyonu

- [Use-Case Diyagramı](docs/use-case-diagram.md)
- [Activity Diyagramı](docs/activity-diagram.md)
- [ER Diyagramı (Veritabanı)](docs/er-diagram.md)
- [Component Diyagramı](docs/component-diagram.md)

---

## 🖼️ Ekran Görüntüleri

> Ekran görüntülerini `docs/screenshots/` klasörüne ekleyip aşağıya yerleştirin.

| Katalog | Sepet / Sipariş | Yönetim Paneli |
|---------|-----------------|----------------|
| _(eklenecek)_ | _(eklenecek)_ | _(eklenecek)_ |

---

## ☁️ Canlıya Alma (Deployment)

**Mimari:** Frontend → Vercel/Netlify · Backend → Render/Railway · Veritabanı → MongoDB Atlas

1. **MongoDB Atlas:** Ücretsiz cluster oluştur, bağlantı dizesini al.
2. **Backend (Render):** `server/` klasörünü deploy et. Ortam değişkenleri:
   `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`, `CLIENT_URL`.
3. **Frontend (Vercel):** `client/` klasörünü deploy et. Ortam değişkeni:
   `VITE_API_URL=https://<backend-adresi>/api`.

> Ayrıntılı deploy adımları için proje raporuna bakın.

---

## 📝 Lisans

Bu proje BLG330 dönem projesi kapsamında eğitim amaçlı geliştirilmiştir.
