import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * Kullanıcı modeli.
 * - role: "admin" (toptancı/yönetici) | "customer" (perakendeci/bayi)
 * - tier: "standard" | "vip" → VIP bayilere özel fiyat listesi için kullanılır
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Ad Soyad zorunludur.'],
      trim: true,
      minlength: [2, 'Ad Soyad en az 2 karakter olmalıdır.'],
    },
    email: {
      type: String,
      required: [true, 'E-posta zorunludur.'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Geçerli bir e-posta adresi giriniz.'],
    },
    password: {
      type: String,
      required: [true, 'Şifre zorunludur.'],
      minlength: [6, 'Şifre en az 6 karakter olmalıdır.'],
      select: false, // Sorgularda varsayılan olarak dönmesin
    },
    shopName: {
      type: String,
      required: [true, 'Dükkan/işletme adı zorunludur.'],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['admin', 'customer'],
      default: 'customer',
    },
    tier: {
      type: String,
      enum: ['standard', 'vip'],
      default: 'standard',
    },
  },
  { timestamps: true }
);

// Kayıt/şifre güncelleme öncesi şifreyi bcrypt ile hashle
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Girilen düz şifreyi hash'lenmiş şifre ile karşılaştırır
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
