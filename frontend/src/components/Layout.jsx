import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const navIcons = {
  Dashboard: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  Sessions: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Attendees: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Attendance: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M9 14l2 2 4-4" />
    </svg>
  ),
  'QR Code': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="3" height="3" />
      <line x1="21" y1="14" x2="21" y2="17" />
      <line x1="14" y1="21" x2="17" y2="21" />
      <line x1="21" y1="21" x2="21" y2="21" />
    </svg>
  ),
  Certificates: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  ),
  Schedule: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Certificate: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  ),
  'Public Schedule': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
};

const linkKeys = {
  'Dashboard': 'dashboard',
  'Sessions': 'sessions',
  'Attendees': 'attendees',
  'Attendance': 'attendance',
  'QR Code': 'qrCode',
  'Certificates': 'certificates',
  'Schedule': 'schedule',
  'Certificate': 'certificate',
  'Public Schedule': 'publicSchedule'
};

export default function Layout() {
  const { user, logout } = useAuth();
  const { t, language, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const adminLinks = [
    { to: '/admin', label: 'Dashboard', end: true },
    { to: '/admin/sessions', label: 'Sessions' },
    { to: '/admin/attendees', label: 'Attendees' },
    { to: '/admin/attendance', label: 'Attendance' },
    { to: '/admin/qr', label: 'QR Code' },
    { to: '/admin/certificates', label: 'Certificates' },
  ];

  const attendeeLinks = [
    { to: '/dashboard', label: 'Dashboard', end: true },
    { to: '/schedule', label: 'Schedule' },
    { to: '/certificate', label: 'Certificate' },
  ];

  const links = user?.role === 'admin' ? adminLinks : attendeeLinks;
  const initials = user?.name ? user.name.charAt(0).toUpperCase() : '?';

  return (
    <div className="layout-with-sidebar">
      {/* Mobile Top Header */}
      <header className="mobile-header">
        <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'} className="brand">
          <span className="brand-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V5a4 4 0 0 0-8 0v2" />
            </svg>
          </span>
          {t('brandName')}
        </Link>
        <button className="btn secondary btn-icon" onClick={() => setIsOpen(!isOpen)} type="button" aria-label={t('toggleNav')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {isOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </header>

      {/* Sidebar Drawer Backdrop */}
      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />}

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand-container">
          <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'} className="brand" onClick={() => setIsOpen(false)}>
            <span className="brand-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 7V5a4 4 0 0 0-8 0v2" />
              </svg>
            </span>
            {t('brandName')}
          </Link>
        </div>

        <nav className="sidebar-links">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              {navIcons[link.label]}
              <span>{t(linkKeys[link.label] || link.label)}</span>
            </NavLink>
          ))}
          <NavLink
            to="/schedule-public"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) => (isActive ? 'active' : undefined)}
          >
            {navIcons['Public Schedule']}
            <span>{t('publicSchedule')}</span>
          </NavLink>
        </nav>

        {/* Sidebar Footer with Language Switcher */}
        <div className="sidebar-footer">
          <div className="language-selector" style={{ display: 'flex', gap: '0.5rem', padding: '0.25rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
            <button
              className={`btn ${language === 'en' ? '' : 'secondary'}`}
              onClick={() => changeLanguage('en')}
              style={{ flex: 1, padding: '0.35rem', fontSize: '0.8rem', borderRadius: '6px', minHeight: 'auto', fontWeight: 'bold' }}
              type="button"
            >
              EN
            </button>
            <button
              className={`btn ${language === 'mm' ? '' : 'secondary'}`}
              onClick={() => changeLanguage('mm')}
              style={{ flex: 1, padding: '0.35rem', fontSize: '0.8rem', borderRadius: '6px', minHeight: 'auto', fontWeight: 'bold' }}
              type="button"
            >
              MM
            </button>
          </div>
          
          <div className="sidebar-user-info">
            <span className="avatar">{initials}</span>
            <div className="user-details">
              <span className="username" title={user?.name}>{user?.name}</span>
              <span className="userrole">{user?.role}</span>
            </div>
          </div>
          <button className="nav-logout" onClick={() => { setIsOpen(false); logout(); }} type="button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {t('logout')}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-container">
        <main className="main-content">
          <div className="container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
