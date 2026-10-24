import React from 'react';
import { Link, NavLink } from 'react-router-dom';

export const ThemeContext = React.createContext({
  darkMode: false,
  toggleTheme: () => {},
});

export function BrandHeader({ landing = false }) {
  const { darkMode, toggleTheme } = React.useContext(ThemeContext);

  return (
    <header className={`app-header${landing ? ' landing-header' : ''}`}>
      <div className="brand-lockup">
        <Link to="/" className="brand-mark-link" aria-label="Smart OBD home">
          <span className="brand-mark" aria-hidden="true">OBD</span>
        </Link>
        <div className="brand-copy">
          <p className="brand-name">Smart OBD</p>
          <p className="brand-caption">Vehicle Library</p>
          {landing && <p className="brand-signature">Smart Library</p>}
        </div>
      </div>
      <p className="nav-headline">Everything you need to keep moving.</p>
      <div className="header-actions">
        <span className="header-status">
          <span className="status-dot" aria-hidden="true" />
          Your workshop companion
        </span>
        <button
          className="theme-toggle"
          type="button"
          onClick={toggleTheme}
          aria-label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
          aria-pressed={darkMode}
        >
          <span aria-hidden="true">{darkMode ? '☀' : '☾'}</span>
          <span className="theme-toggle-label">{darkMode ? 'Light mode' : 'Dark mode'}</span>
        </button>
      </div>
    </header>
  );
}

export function MechanicSidebar() {
  return (
    <aside className="sidebar">
      <p className="sidebar-label">WORKSPACE</p>
      <nav className="sidebar-nav" aria-label="Mechanic navigation">
        <NavLink to="/home" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
          <span className="nav-icon" aria-hidden="true">⌂</span>
          Home
        </NavLink>
        <NavLink to="/home?add=new" className={({ isActive }) => `sidebar-link sidebar-action${isActive ? ' active' : ''}`}>
          <span className="nav-icon" aria-hidden="true">＋</span>
          Add New
        </NavLink>
        <NavLink to="/history" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
          <span className="nav-icon" aria-hidden="true">▤</span>
          History
        </NavLink>
        <NavLink to="/about" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
          <span className="nav-icon" aria-hidden="true">✎</span>
          About
        </NavLink>
        <NavLink to="/feedback" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
          <span className="nav-icon" aria-hidden="true">✉</span>
          Customer feedback
        </NavLink>
      </nav>
    </aside>
  );
}
