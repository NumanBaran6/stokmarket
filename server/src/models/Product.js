import mongoose from 'mongoose';

/**
 * Ürün modeli (toptan satışa uygun).
 * - price: standart birim fiyat
 * - vipPrice: VIP bayilere özel indirimli fiyat (boşsa standart fiyat geçerli)
 * - moq (Minimum Order Quantity): en az sipariş edilebilecek miktar (örn. 1 koli)
 * - unit: satış birimi (koli, paket, adet...)
 * - category: Category modeline referans (populate edilebilir)
 */
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Ürün adı zorunludur.'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    origin: {
      type: String,
      trim: true,
      default: '',
    },
    grade: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Ürün kategorisi zorunludur.'],
    },
    price: {
      type: Number,
      required: [true, 'Birim fiyat zorunludur.'],
      min: [0, 'Fiyat negatif olamaz.'],
    },
    vipPrice: {
      type: Number,
      min: [0, 'VIP fiyat negatif olamaz.'],
      default: null,
    },
    vipPlusPrice: {
      type: Number,
      min: [0, 'VIP+ fiyat negatif olamaz.'],
      default: null,
    },
    unit: {
      type: String,
      required: [true, 'Satış birimi zorunludur (örn. koli, paket, adet).'],
      trim: true,
      default: 'koli',
    },
    moq: {
      type: Number,
      required: [true, 'Minimum sipariş miktarı (MOQ) zorunludur.'],
      min: [1, 'Minimum sipariş miktarı en az 1 olmalıdır.'],
      default: 1,
    },
    stock: {
      type: Number,
      required: [true, 'Stok miktarı zorunludur.'],
      min: [0, 'Stok negatif olamaz.'],
      default: 0,
    },
    imageUrl: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

/**
 * Verilen kullanıcı seviyesine göre geçerli birim fiyatı döndürür.
 * - vip+  : en düşük fiyat; vipPlusPrice yoksa vipPrice'a, o da yoksa normal fiyata düşer.
 * - vip   : vipPrice; yoksa normal fiyat.
 * - diğer : normal fiyat.
 */
productSchema.methods.priceForTier = function (tier) {
  if (tier === 'vip+' && this.vipPlusPrice != null) return this.vipPlusPrice;
  if ((tier === 'vip' || tier === 'vip+') && this.vipPrice != null) return this.vipPrice;
  return this.price;
};

const Product = mongoose.model('Product', productSchema);
export default Product;
