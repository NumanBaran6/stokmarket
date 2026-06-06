import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import FormField from '../components/FormField.jsx';

/**
 * Kayıt sayfası. Bayi kaydı oluşturur (rol: customer).
 * Kapsamlı istemci tarafı form validasyonu içerir.
 */
const RegisterPage = () => {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    shopName: '',
    email: '',
    phone: '',
    password: '',
    passwordConfirm: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const errs = {};
    if (form.name.trim().length < 2) errs.name = 'Ad Soyad en az 2 karakter olmalıdır.';
    if (form.shopName.trim().length < 2) errs.shopName = 'Dükkan adı zorunludur.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Geçerli bir e-posta giriniz.';
    if (form.password.length < 6) errs.password = 'Şifre en az 6 karakter olmalıdır.';
    if (form.password !== form.passwordConfirm) errs.passwordConfirm = 'Şifreler eşleşmiyor.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const { passwordConfirm, ...payload } = form;
      const user = await register(payload);
      toast.success(`Kaydın tamamlandı, hoş geldin ${user.name}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container auth-page">
      <div className="card auth-card">
        <h2>Bayi Kaydı Oluştur</h2>
        <p className="auth-card__sub">Dükkanın için hesap aç, toptan siparişe başla.</p>

        <form onSubmit={handleSubmit} noValidate>
          <FormField label="Ad Soyad" name="name" error={errors.name}>
            <input id="name" name="name" className="input" value={form.name} onChange={handleChange} />
          </FormField>

          <FormField label="Dükkan / İşletme Adı" name="shopName" error={errors.shopName}>
            <input
              id="shopName"
              name="shopName"
              className="input"
              value={form.shopName}
              onChange={handleChange}
            />
          </FormField>

          <FormField label="E-posta" name="email" error={errors.email}>
            <input
              id="email"
              name="email"
              type="email"
              className="input"
              value={form.email}
              onChange={handleChange}
            />
          </FormField>

          <FormField label="Telefon (opsiyonel)" name="phone" error={errors.phone}>
            <input
              id="phone"
              name="phone"
              className="input"
              value={form.phone}
              onChange={handleChange}
              placeholder="05XX XXX XX XX"
            />
          </FormField>

          <FormField label="Şifre" name="password" error={errors.password}>
            <input
              id="password"
              name="password"
              type="password"
              className="input"
              value={form.password}
              onChange={handleChange}
            />
          </FormField>

          <FormField label="Şifre (Tekrar)" name="passwordConfirm" error={errors.passwordConfirm}>
            <input
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
              className="input"
              value={form.passwordConfirm}
              onChange={handleChange}
            />
          </FormField>

          <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
            {submitting ? 'Kaydediliyor...' : 'Kayıt Ol'}
          </button>
        </form>

        <p className="auth-card__foot">
          Zaten hesabın var mı? <Link to="/giris">Giriş yap</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
