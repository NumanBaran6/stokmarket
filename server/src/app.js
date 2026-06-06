import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

// --- Genel middleware'ler ---

// CORS: yalnızca tanımlı frontend adresine izin ver (gerekirse genişletilebilir)
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  })
);

// İstek gövdesini JSON olarak ayrıştır
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP istek loglama (yalnızca geliştirme ortamında ayrıntılı)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// --- Sağlık kontrolü (deploy platformları için) ---
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Numan Gıda API çalışıyor 🟢', time: new Date() });
});

// --- API rotaları ---
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// --- Hata yönetimi middleware'leri (en sonda olmalı) ---
app.use(notFound);
app.use(errorHandler);

export default app;
