import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

/**
 * Üst gezinme çubuğu.
 * - Giriş durumuna ve role göre farklı linkler gösterir.
 * - Sepetteki ürün sayısını rozet olarak gösterir.
 * - Mobilde hamburger menü ile açılır/kapanır (responsive).
 */
const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.info('Çıkış yapıldı.');
    navigate('/');
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="navbar">
      <div className="navbar__inner container">
        <Link to="/" className="navbar__brand" onClick={closeMenu}>
          🛒 StokMarket
          <span className="navbar__slogan">Raflarını Doldur</span>
        </Link>

        <button
          className="navbar__toggle"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Menüyü aç/kapat"
        >
          ☰
        </button>

        <nav className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}>
          <NavLink to="/" end onClick={closeMenu}>
            Katalog
          </NavLink>

          {isAuthenticated && (
            <NavLink to="/siparislerim" onClick={closeMenu}>
              Siparişlerim
            </NavLink>
          )}

          {isAdmin && (
            <NavLink to="/admin" onClick={closeMenu}>
              Yönetim
            </NavLink>
          )}

          {!isAdmin && (
            <NavLink to="/sepet" className="navbar__cart" onClick={closeMenu}>
              Sepet
              {totalItems > 0 && <span className="navbar__badge">{totalItems}</span>}
            </NavLink>
          )}

          {isAuthenticated ? (
            <div className="navbar__user">
              <span className="navbar__username">
                {user.name}
                {user.tier === 'vip' && <span className="navbar__vip">VIP</span>}
              </span>
              <button className="btn btn--ghost btn--sm" onClick={handleLogout}>
                Çıkış
              </button>
            </div>
          ) : (
            <div className="navbar__auth">
              <NavLink to="/giris" className="btn btn--ghost btn--sm" onClick={closeMenu}>
                Giriş
              </NavLink>
              <NavLink to="/kayit" className="btn btn--primary btn--sm" onClick={closeMenu}>
                Kayıt Ol
              </NavLink>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
