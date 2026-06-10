import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import FormField from '../components/FormField.jsx';

/**
 * Giriş sayfası. Form validasyonu ve hata yönetimi içerir.
 */
const LoginPage = () => {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  // İstemci tarafı doğrulama
  const validate = () => {
    const errs = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Geçerli bir e-posta giriniz.';
    if (form.password.length < 6) errs.password = 'Şifre en az 6 karakter olmalıdır.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Hoş geldin, ${user.name}!`);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container auth-page">
      <div className="card auth-card">
        <h2>Giriş Yap</h2>
        <p className="auth-card__sub">Bayi hesabınla giriş yaparak sipariş vermeye başla.</p>

        <form onSubmit={handleSubmit} noValidate>
          <FormField label="E-posta" name="email" error={errors.email}>
            <input
              id="email"
              name="email"
              type="email"
              className="input"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
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
              placeholder="••••••"
              autoComplete="current-password"
            />
          </FormField>

          <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
            {submitting ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <p className="auth-card__foot">
          Hesabın yok mu? <Link to="/kayit">Kayıt ol</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
