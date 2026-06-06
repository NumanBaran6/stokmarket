import mongoose from 'mongoose';

/**
 * Ürün kategorisi modeli (örn. Gıda, İçecek, Temizlik).
 * Product modeli bu modele ref ile bağlanır (populate ile birlikte gelir).
 */
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Kategori adı zorunludur.'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

const Category = mongoose.model('Category', categorySchema);
export default Category;
