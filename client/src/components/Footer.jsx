/**
 * Sayfa altbilgisi.
 */
const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <p>
          <strong>StokMarket</strong> — Perakendeciler için B2B toptan sipariş platformu
        </p>
        <p className="footer__muted">
          © {new Date().getFullYear()} · BLG330 Web Programlama Dönem Projesi
        </p>
      </div>
    </footer>
  );
};

export default Footer;
