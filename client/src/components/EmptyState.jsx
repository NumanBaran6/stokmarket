/**
 * Liste boş olduğunda gösterilen bilgilendirici durum bileşeni.
 */
const EmptyState = ({ icon = '📭', title, message, action }) => {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">{icon}</div>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
};

export default EmptyState;
