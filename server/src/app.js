import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import userRoutes from './routes/userRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { uploadsDir } from './middleware/upload.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

// --- Genel middleware'ler ---

// CORS: CLIENT_URL tanımlıysa yalnızca ona, değilse tüm kaynaklara izin ver.
// Kimlik doğrulama JWT başlığı ile yapıldığından çereze (credentials) gerek yok;
// böylece '*' origin ile de sorunsuz çalışır.
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
  })
);

// İstek gövdesini JSON olarak ayrıştır
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP istek loglama (yalnızca geliştirme ortamında ayrıntılı)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Yüklenen ürün görsellerini statik olarak sun (/uploads/...)
app.use('/uploads', express.static(uploadsDir));

// --- Sağlık kontrolü (deploy platformları için) ---
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Numan Gıda API çalışıyor 🟢', time: new Date() });
});

// --- API rotaları ---
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);

// --- Hata yönetimi middleware'leri (en sonda olmalı) ---
app.use(notFound);
app.use(errorHandler);

export default app;
