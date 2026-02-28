import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { NAVBAR, SITE } from '../../../config/constants';

import "./Header.css";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Close menu on route change
  useEffect(() => { 
    setMenuOpen(false); 
  }, [location]);

  // Scrolled state for navbar style
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > NAVBAR.scrollThreshold);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close on ESC key
  useEffect(() => {
    const handleKey = (e) => { 
      if (e.key === 'Escape') setMenuOpen(false); 
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const getLinkClass = (path) =>
    location.pathname === path ? 'nav-link active' : 'nav-link';

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">

        <div className="logo">
          <Link to="/">
            <img
              src="/assets/icons/My__Logo.png"
              alt={SITE.name}
              className="logo-img"
            />
          </Link>
        </div>

        <div className={`nav-menu ${menuOpen ? 'active' : ''}`}>
          {/* <Link to="/" className={getLinkClass('/')}>HOME</Link>
          <Link to="/projects" className={getLinkClass('/projects')}>PROJECTS</Link>
          <Link to="/about" className={getLinkClass('/about')}>ABOUT</Link> */}
          <Link to="/" className={getLinkClass('/')}>CALCULATORS</Link>
          <Link to="/boq-generator" className={getLinkClass('/boq-generator')}>BOQ Generator</Link>
          <Link to="/bbs-generator" className={getLinkClass('/bbs-generator')}>BBS Generator</Link>
          <Link to="/vastu" className={getLinkClass('/vastu')}>VASTU</Link>
        </div>

        <a
          href="/assets/files/Biswajit_Deb_Barman__CV.pdf"
          download
          className="btn-nav-cta"
        >
          DOWNLOAD RESUME
        </a>

        <button
          className={`hamburger ${menuOpen ? 'active' : ''}`}
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation"
        >
          <span />
          <span />
          <span />
        </button>

      </div>
    </nav>
  );
}

export default Header;