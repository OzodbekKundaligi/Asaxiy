import React from 'react';
import { NavLink } from 'react-router-dom';
import './Footer.css';
import { CATEGORY_LINKS } from '../config/navigation';

const quickLinks = [
  { label: 'Aksiyalar', to: '/super-narx' },
  { label: "To'lov va yetkazib berish", to: '/tolov-qilish' },
  { label: 'Kafolat', to: '/buyurtma-holati' },
  { label: 'Qaytarish siyosati', to: '/sevimlilar' }
];

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
            <NavLink key={link.to} to={link.to}>
              {link.label}
            </NavLink>
          ))}
          {CATEGORY_LINKS.slice(0, 2).map((category) => (
            <NavLink key={category.path} to={category.path}>
              {category.label}
            </NavLink>
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
