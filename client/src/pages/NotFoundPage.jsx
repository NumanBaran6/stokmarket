import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState.jsx';

/**
 * 404 - Sayfa bulunamadı.
 */
const NotFoundPage = () => (
  <div className="container">
    <EmptyState
      icon="🧭"
      title="404 — Sayfa bulunamadı"
      message="Aradığın sayfa taşınmış veya hiç var olmamış olabilir."
      action={
        <Link to="/" className="btn btn--primary">
          Anasayfaya dön
        </Link>
      }
    />
  </div>
);

export default NotFoundPage;
