/**
 * İletişim sayfası — telefon, e-posta ve Esenler Hal'deki dükkan bilgileri.
 */
const ContactPage = () => {
  return (
    <div className="container contact-page">
      <section className="hero hero--center">
        <h1 className="hero__tagline">Bize Ulaşın</h1>
        <p className="hero__sub">
          Siparişleriniz ve toptan fiyat talepleriniz için hafta içi ve cumartesi hal
          saatlerinde bize ulaşabilirsiniz.
        </p>
      </section>

      <div className="contact-grid">
        <div className="card contact-card">
          <h3>Telefon</h3>
          <p><a href="tel:+902126570000">0212 657 00 00</a> <span className="text-muted">— Sabit</span></p>
          <p><a href="tel:+905321110000">0532 111 00 00</a> <span className="text-muted">— Sipariş hattı</span></p>
          <p><a href="tel:+905334440000">0533 444 00 00</a> <span className="text-muted">— WhatsApp sipariş</span></p>
        </div>

        <div className="card contact-card">
          <h3>E-posta</h3>
          <p><a href="mailto:info@numangida.com">info@numangida.com</a> <span className="text-muted">— Genel</span></p>
          <p><a href="mailto:siparis@numangida.com">siparis@numangida.com</a> <span className="text-muted">— Sipariş</span></p>
        </div>

        <div className="card contact-card">
          <h3>Dükkan Adresi</h3>
          <p><strong>Numan Gıda Toptan</strong></p>
          <p>İstanbul Esenler Yaş Sebze ve Meyve Hali</p>
          <p>C Blok No: 42, Esenler / İstanbul</p>
        </div>

        <div className="card contact-card">
          <h3>Çalışma Saatleri</h3>
          <p>Pazartesi – Cuma: <strong>04:00 – 14:00</strong></p>
          <p>Cumartesi: <strong>04:00 – 12:00</strong></p>
          <p className="text-muted">Pazar kapalı</p>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
