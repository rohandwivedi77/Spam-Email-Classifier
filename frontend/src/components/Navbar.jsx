import React, { useState } from 'react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '#hero' },
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#timeline' },
    { name: 'About', href: '#about' },
  ];

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="site-header">
      <div className="site-nav">
        <a href="#hero" className="site-brand">Spam Email Classifier</a>

        <nav className="site-nav-links" aria-label="Main navigation">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href}>{link.name}</a>
          ))}
          <a href="#prediction">Try Now</a>
        </nav>

        <button
          type="button"
          className="menu-button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? 'Close' : 'Menu'}
        </button>
      </div>

      {mobileMenuOpen && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} onClick={closeMenu}>{link.name}</a>
          ))}
          <a href="#prediction" onClick={closeMenu}>Try Now</a>
        </nav>
      )}
    </header>
  );
}
