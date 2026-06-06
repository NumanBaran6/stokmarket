# Canlıya Alma (Deployment) Rehberi

Mimari: **MongoDB Atlas** (veritabanı) · **Render** (backend API) · **Vercel** (frontend).

---

## 1) MongoDB Atlas (veritabanı)

1. https://www.mongodb.com/cloud/atlas/register → ücretsiz kayıt ol.
2. **Create** → **M0 (Free)** cluster oluştur (bölge: Frankfurt/Ireland önerilir).
3. **Database Access** → **Add New Database User**: kullanıcı adı + şifre belirle (not al).
4. **Network Access** → **Add IP Address** → **Allow access from anywhere** (`0.0.0.0/0`).
5. **Database** → **Connect** → **Drivers** → bağlantı dizesini kopyala:
   `mongodb+srv://kullanici:<sifre>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   - `<sifre>` yerine gerçek şifreyi yaz, sonuna veritabanı adı ekle: `.../numangida?...`

## 2) Veritabanını örnek verilerle doldur (bir kez)

Yerel makinede, Atlas dizesiyle:
```bash
cd server
MONGODB_URI="<atlas-baglanti-dizesi>" npm run seed
```
Bu, kategorileri, 20 ürünü ve demo hesapları Atlas'a yükler.

## 3) Backend — Render

1. https://render.com → GitHub ile giriş.
2. **New +** → **Web Service** → `NumanBaran6/stokmarket` reposunu seç.
3. Ayarlar:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free
4. **Environment** sekmesinde değişkenler:
   - `MONGODB_URI` = Atlas dizesi
   - `JWT_SECRET` = uzun rastgele bir metin
   - `NODE_ENV` = `production`
   - `JWT_EXPIRE` = `7d`
5. Deploy et. Adres: `https://numangida-api.onrender.com` gibi olur. `/api/health` ile test et.

## 4) Frontend — Vercel

1. https://vercel.com → GitHub ile giriş.
2. **Add New** → **Project** → `stokmarket` reposunu içe aktar.
3. Ayarlar:
   - **Root Directory:** `client`
   - Framework: Vite (otomatik algılanır)
4. **Environment Variables:**
   - `VITE_API_URL` = `https://numangida-api.onrender.com/api`  (Render adresin + `/api`)
5. Deploy et. Adres: `https://stokmarket-xxx.vercel.app` gibi olur.

## 5) Son: CORS'u sıkılaştır (opsiyonel)

Render'da `CLIENT_URL` = Vercel adresin (örn. `https://stokmarket-xxx.vercel.app`) ekleyip
backend'i yeniden deploy et. Böylece API yalnızca kendi frontend'ine izin verir.

---

> **Not:** Render ücretsiz plan, 15 dk hareketsizlikte uykuya geçer; ilk istek ~50 sn sürebilir.
> **Not:** Admin'den yüklenen görseller Render diskine yazılır ve yeniden deploy'da silinebilir;
> kalıcı görsel için bulut depolama (ör. Cloudinary) gerekir. Katalog görselleri ise frontend ile
> birlikte (`client/public/images`) deploy edildiği için kalıcıdır.
