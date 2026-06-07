import mongoose from 'mongoose';

/**
 * Sipariş kalemi alt-şeması.
 * Sipariş anındaki birim fiyat (priceAtOrder) saklanır; böylece ürün fiyatı
 * sonradan değişse bile geçmiş sipariş tutarı bozulmaz.
 */
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: { type: String, required: true }, // anlık ürün adı (kayıt için)
    unit: { type: String, required: true },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Miktar en az 1 olmalıdır.'],
    },
    priceAtOrder: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

/**
 * Sipariş modeli.
 * - customer: siparişi veren bayi (User'a referans)
 * - items: sipariş kalemleri
 * - deliveryDay: bayinin seçtiği teslimat günü
 * - invoiceNumber: otomatik üretilen fatura numarası
 * - status: sipariş durumu
 */
const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (items) => items.length > 0,
        message: 'Sipariş en az bir ürün içermelidir.',
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryDate: {
      type: Date,
      required: [true, 'Teslimat tarihi seçilmelidir.'],
    },
    invoiceNumber: {
      type: String,
      unique: true,
    },
    note: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['beklemede', 'onaylandı', 'hazırlanıyor', 'teslim edildi', 'iptal'],
      default: 'beklemede',
    },
  },
  { timestamps: true }
);

// Kayıt öncesi otomatik fatura numarası üret (örn. INV-20260606-4F8A2)
orderSchema.pre('save', function (next) {
  if (!this.invoiceNumber) {
    const date = new Date();
    const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(
      date.getDate()
    ).padStart(2, '0')}`;
    const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.invoiceNumber = `INV-${ymd}-${rand}`;
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
