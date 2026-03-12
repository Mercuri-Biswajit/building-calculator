import { Link } from "react-router-dom";
import { SITE } from "../../../config/constants";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      {/* ══ TOP BAND ══ */}
      <div className="footer-top-band">
        <div className="container">
          <div className="footer-top-inner">
            <div className="footer-top-left">
              <span className="footer-top-eyebrow">
                Civil Engineer &amp; Structural Designer
              </span>
              <h2 className="footer-top-name">
                Er. <span>Biswajit</span> Deb Barman
              </h2>
            </div>
            <div className="footer-top-right">
              <span className="footer-top-tag">Available for Projects</span>
              <a
                href="mailto:biswajitdebbarman.civil@gmail.com"
                className="footer-top-cta"
              >
                Hire Me
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ══ MAIN GRID ══ */}
      <div className="container">
        <div className="footer-main">
          {/* Contact */}
          <div className="footer-contact-col">
            <Link to="/" className="footer-logo-link">
              <img
                src="/assets/icons/My__Logo.png"
                alt={SITE.name}
                className="footer-logo-img"
              />
            </Link>
            <p className="footer-tagline">
              Providing expert structural design and civil engineering solutions
              across West Bengal. Building strong foundations, one project at a
              time.
            </p>
            <div className="footer-section-label">Contact</div>
            <div className="footer-contact-list">
              <div className="footer-contact-row">
                <div className="footer-contact-icon">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div className="footer-contact-info">
                  <span className="footer-contact-tag">Address</span>
                  <span className="footer-contact-val">
                    Chanditala, Raiganj, Uttar Dinajpur, WB – 733134
                  </span>
                </div>
              </div>

              <a href="tel:+917602120054" className="footer-contact-row">
                <div className="footer-contact-icon">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.38 2 2 0 0 1 3.6 1.2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6 6l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z" />
                  </svg>
                </div>
                <div className="footer-contact-info">
                  <span className="footer-contact-tag">Phone</span>
                  <span className="footer-contact-val">+91-7602120054</span>
                </div>
              </a>

              <a
                href="mailto:biswajitdebbarman.civil@gmail.com"
                className="footer-contact-row"
              >
                <div className="footer-contact-icon">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div className="footer-contact-info">
                  <span className="footer-contact-tag">Email</span>
                  <span className="footer-contact-val">
                    biswajitdebbarman.civil@gmail.com
                  </span>
                </div>
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div className="footer-nav-col">
            <div className="footer-col-header">
              <span className="footer-col-accent" aria-hidden="true" />
              <h4>Navigation</h4>
            </div>
            <nav className="footer-nav-list">
              {[
                // { to: "/", icon: "🏠", label: "Home" },
                // { to: "/projects", icon: "🏗️", label: "Projects" },
                // { to: "/about", icon: "👤", label: "About" },
                { to: "/", icon: "🧮", label: "Calculator" },
                { to: "/vastu", icon: "🏡", label: "Vastu Guide" },
              ].map(({ to, icon, label }) => (
                <Link key={to} to={to} className="footer-nav-item">
                  <span className="footer-nav-left">
                    <span className="footer-nav-icon">{icon}</span>
                    <span className="footer-nav-label">{label}</span>
                  </span>
                  <span className="footer-nav-arrow">›</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Connect */}
          <div className="footer-connect-col">
            <div className="footer-col-header">
              <span className="footer-col-accent" aria-hidden="true" />
              <h4>Connect</h4>
            </div>
            <div className="footer-connect-list">
              <a
                href={SITE.linkedin}
                target="_blank"
                rel="noreferrer"
                className="footer-connect-item"
              >
                <span className="footer-connect-icon">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </span>
                <span className="footer-connect-label">LinkedIn</span>
                <span className="footer-connect-badge">Profile</span>
              </a>

              <a
                href={SITE.facebook}
                target="_blank"
                rel="noreferrer"
                className="footer-connect-item"
              >
                <span className="footer-connect-icon">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </span>
                <span className="footer-connect-label">Facebook</span>
                <span className="footer-connect-badge">Follow</span>
              </a>

              <a
                href={SITE.instagram}
                target="_blank"
                rel="noreferrer"
                className="footer-connect-item"
              >
                <span className="footer-connect-icon">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </span>
                <span className="footer-connect-label">Instagram</span>
                <span className="footer-connect-badge">Follow</span>
              </a>
            </div>
          </div>
        </div>
        {/* /footer-main */}

        {/* ══ BOTTOM BAR ══ */}
        <div className="footer-bottom">
          <p>
            © 2026 Er. Biswajit Deb Barman — Civil Engineer, Raiganj, West
            Bengal. All rights reserved.
          </p>
          <span className="footer-bottom-right">
            Civil · Structural · Design
          </span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
