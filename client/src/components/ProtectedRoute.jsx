import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from './Spinner.jsx';

/**
 * Korumalı rota sarmalayıcısı (frontend tarafı koruma).
 * - Giriş yoksa /giris'e yönlendirir.
 * - adminOnly true ve kullanıcı admin değilse anasayfaya yönlendirir.
 */
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner fullPage />;

  if (!isAuthenticated) {
    // Giriş sonrası geri dönebilmek için gelinen sayfayı sakla
    return <Navigate to="/giris" state={{ from: location.pathname }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
