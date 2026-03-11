import { Link } from 'react-router-dom';
import { SITE } from '../../../config/constants';
import { UnitToggle } from '../../ui/UnitToggle';
import { useUnit } from '../../../context/UnitContext';
import "./Header.css";

function Header({ toggleSidebar }) {
  const { unit, setUnit } = useUnit();

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button
          className="hamburger-btn"
          onClick={toggleSidebar}
          aria-label="Toggle Navigation"
        >
          <svg xmlns="http://www.w3.org/-2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
        </button>
        <Link to="/" className="header-logo-container">
          <img src="/assets/icons/My__Logo.png" alt={SITE.name} className="header-logo" />
        </Link>
      </div>

      <div className="header-center">
        <h1 className="header-title">{SITE.name}</h1>
      </div>

      <div className="header-right">
        <UnitToggle unit={unit} onChange={setUnit} />
      </div>
    </header>
  );
}

export default Header;