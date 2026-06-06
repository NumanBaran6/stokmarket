import { CrateIcon } from './Logo.jsx';

/**
 * Liste boş olduğunda gösterilen bilgilendirici durum bileşeni.
 * Süs amaçlı emoji yerine sade bir kasa simgesi kullanır.
 */
const EmptyState = ({ title, message, action }) => {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">
        <CrateIcon size={72} />
      </div>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
};

export default EmptyState;
