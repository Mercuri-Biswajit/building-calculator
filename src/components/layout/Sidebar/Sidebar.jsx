import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import { SITE } from '../../../config/constants';
import './Sidebar.css';

// SVG Icons for Sidebar
const Icons = {
  Calculator: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" /><line x1="8" x2="16" y1="6" y2="6" /><line x1="16" x2="16" y1="14" y2="18" /><path d="M16 10h.01" /><path d="M12 10h.01" /><path d="M8 10h.01" /><path d="M12 14h.01" /><path d="M8 14h.01" /><path d="M12 18h.01" /><path d="M8 18h.01" /></svg>
  ),
  Home: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  ),
  Layers: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 12 12 17 22 12"/><polyline points="2 17 12 22 22 17"/></svg>
  ),
  Brick: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v6"/><path d="M15 9v6"/><path d="M9 15v6"/></svg>
  ),
  Paint: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z"/><path d="m5 2 5 5"/><path d="M2 13h15"/><path d="M22 20a2 2 0 1 1-4 0c0-1.6 1.7-2.4 2-4 .3 1.6 2 2.4 2 4Z"/></svg>
  ),
  Vastu: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m16 12-4-4-4 4"/><path d="M12 8v8"/></svg>
  ),
  Dashboard: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
  )
};

function Sidebar({ children, activeTab, onTabChange }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isCalculatorRoute = location.pathname === '/';

  const calculatorTabs = [
    { id: 'costing', label: 'Home Estimate', icon: <Icons.Home /> },
    { id: 'structural', label: 'Structural Design', icon: <Icons.Layers /> },
    { id: 'brick', label: 'Brick Masonry', icon: <Icons.Brick /> },
    { id: 'paint', label: 'Paint Estimator', icon: <Icons.Paint /> },
  ];

  return (
    <div className="sidebar-layout">
      {/* ── Top Header (Mobile & Desktop) ───────────────────── */}
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="sidebar-container">
        {/* ── Sidebar Navigation ──────────────────────────────── */}
        <aside className={`sidebar-nav-container ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <img src="/assets/icons/My__Logo.png" alt={SITE.name} className="sidebar-logo" />
            <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>×</button>
          </div>

          <nav className="sidebar-nav">
            <div className="nav-group">
              <h3 className="nav-group-title">CALCULATORS</h3>
              {calculatorTabs.map(tab => (
                isCalculatorRoute ? (
                  <button
                    key={tab.id}
                    className={`sidebar-link ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => { onTabChange(tab.id); setSidebarOpen(false); }}
                  >
                    <span className="sidebar-icon">{tab.icon}</span>
                    {tab.label}
                  </button>
                ) : (
                  <NavLink
                    key={tab.id}
                    to="/"
                    className="sidebar-link"
                    onClick={() => {
                        sessionStorage.setItem("openTab", tab.id);
                        setSidebarOpen(false);
                    }}
                  >
                    <span className="sidebar-icon">{tab.icon}</span>
                    {tab.label}
                  </NavLink>
                )
              ))}
            </div>

            <div className="nav-group">
              <h3 className="nav-group-title">RESOURCES</h3>
              <NavLink 
                to="/dashboard" 
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sidebar-icon"><Icons.Dashboard /></span>
                Saved Projects
              </NavLink>
              <NavLink 
                to="/vastu" 
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sidebar-icon"><Icons.Vastu /></span>
                Vastu Shastra
              </NavLink>
            </div>
            
             <div className="nav-group sidebar-bottom">
               <a href="/assets/files/Biswajit_Deb_Barman__CV.pdf" download className="btn-sidebar-cta">
                  DOWNLOAD RESUME
               </a>
             </div>
          </nav>
        </aside>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

        {/* ── Main Content Area ───────────────────────────────── */}
        <div className="sidebar-content-wrapper">
          <main className="sidebar-main">
            {children}
          </main>
          <div className="sidebar-footer-wrapper">
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
