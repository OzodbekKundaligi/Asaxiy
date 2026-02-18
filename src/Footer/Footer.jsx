import React from 'react';
import './Footer.css';

const quickLinks = ['Aksiyalar', "To'lov va yetkazib berish", 'Kafolat', 'Qaytarish siyosati'];

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-shell">
        <div className="footer-brand">
          <div className="footer-logo">A</div>
          <div>
            <h3>asaxiy</h3>
            <p>Texnika va gadjetlar uchun ishonchli onlayn market.</p>
          </div>
        </div>

        <div className="footer-links">
          {quickLinks.map((link) => (
            <a href="#" key={link}>
              {link}
            </a>
          ))}
        </div>
      </div>

      <p className="footer-copy">
        2015 - 2026 Asaxiy.uz. Barcha huquqlar himoyalangan. O'zbekiston bo'ylab yetkazib berish xizmati mavjud.
      </p>
    </footer>
  );
}

export default Footer;
