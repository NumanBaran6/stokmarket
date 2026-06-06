/**
 * Form girdisi sarmalayıcısı.
 * Etiket, input ve (varsa) doğrulama hata mesajını birlikte gösterir.
 */
const FormField = ({ label, name, error, children }) => {
  return (
    <div className={`form-field ${error ? 'form-field--error' : ''}`}>
      <label htmlFor={name}>{label}</label>
      {children}
      {error && <span className="form-field__error">{error}</span>}
    </div>
  );
};

export default FormField;
