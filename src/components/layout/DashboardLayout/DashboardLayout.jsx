import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Header from '../Header/Header';
import { SITE } from '../../../config/constants';
import './DashboardLayout.css';

// SVG Icons for Sidebar
const Icons = {
  Calculator: () => (
    <svg xmlns="http://www.w3.org/-2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" /><line x1="8" x2="16" y1="6" y2="6" /><line x1="16" x2="16" y1="14" y2="18" /><path d="M16 10h.01" /><path d="M12 10h.01" /><path d="M8 10h.01" /><path d="M12 14h.01" /><path d="M8 14h.01" /><path d="M12 18h.01" /><path d="M8 18h.01" /></svg>
  ),
  Vastu: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
  ),
  Dashboard: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
  )
};

function DashboardLayout({ children, activeTab, onTabChange }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isCalculatorRoute = location.pathname === '/';

  const calculatorTabs = [
    { id: 'costing', label: 'Home Extimate', icon: <Icons.Calculator /> },
    { id: 'structural', label: 'Structural Design', icon: <Icons.Calculator /> },
    { id: 'brick', label: 'Brick Masonry', icon: <Icons.Calculator /> },
    { id: 'paint', label: 'Paint Estimator', icon: <Icons.Calculator /> },
  ];

  return (
    <div className="dashboard-layout">
      {/* ── Top Header (Mobile & Desktop) ───────────────────── */}
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="dashboard-container">
        {/* ── Sidebar Navigation ──────────────────────────────── */}
        <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
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
        <main className="dashboard-main">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
