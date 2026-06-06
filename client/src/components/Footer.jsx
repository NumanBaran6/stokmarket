/**
 * Sayfa altbilgisi.
 */
const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <p>
          <strong>Numan Gıda</strong> — Manavlar için taze meyve & sebze toptan sipariş platformu
        </p>
        <p className="footer__muted">
          © {new Date().getFullYear()} · BLG330 Web Programlama Dönem Projesi
        </p>
      </div>
    </footer>
  );
};

export default Footer;
