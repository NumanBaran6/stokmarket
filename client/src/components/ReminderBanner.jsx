import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

/**
 * Haftalık sipariş hatırlatma afişi.
 * Hafta başında (Pazartesi-Salı) ve son sipariş günü o gün kapanmadan
 * bayilere haftalık siparişlerini vermelerini hatırlatır.
 * Kullanıcı kapattığında o gün için tekrar gösterilmez (localStorage).
 */
const ReminderBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const today = new Date();
    const dayKey = today.toDateString();
    const dismissed = localStorage.getItem('stokmarket_reminder_dismissed');

    // Hafta başı günleri hatırlatma göster (0=Pazar ... 1=Pzt, 2=Salı)
    const day = today.getDay();
    const isReminderDay = day === 1 || day === 2;

    if (isReminderDay && dismissed !== dayKey) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem('stokmarket_reminder_dismissed', new Date().toDateString());
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="reminder">
      <span className="reminder__icon">🔔</span>
      <span className="reminder__text">
        <strong>Haftalık sipariş zamanı!</strong> Bu haftanın siparişini vermeyi unutma — teslimat
        gününü seçip listeni oluştur.
      </span>
      <Link to="/sepet" className="btn btn--light btn--sm">
        Siparişe git
      </Link>
      <button className="reminder__close" onClick={dismiss} aria-label="Kapat">
        ✕
      </button>
    </div>
  );
};

export default ReminderBanner;
