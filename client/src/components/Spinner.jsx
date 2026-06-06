/**
 * Yükleniyor göstergesi (loading spinner).
 * fullPage true ise sayfayı ortalayan bir konteyner içinde gösterir.
 */
const Spinner = ({ fullPage = false, label = 'Yükleniyor...' }) => {
  const content = (
    <div className="spinner" role="status" aria-live="polite">
      <div className="spinner__circle" />
      {label && <span className="spinner__label">{label}</span>}
    </div>
  );

  if (fullPage) {
    return <div className="spinner__fullpage">{content}</div>;
  }
  return content;
};

export default Spinner;
