import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useLanguage } from '../context/LanguageContext';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    api.getDashboard()
      .then(setStats)
      .catch((err) => setError(err.message));
  }, []);

  if (!stats && !error) {
    return (
      <div className="card loading-card">
        <div className="spinner"></div>
        {t('loading')}
      </div>
    );
  }

  return (
    <div>
      <div className="welcome-banner">
        <h1>{t('welcomeAdmin')}! 👋</h1>
        <p>{t('adminOverview')}</p>
      </div>

      {error && <div className="alert error">{error}</div>}
      
      {stats && (
        <>
          <div className="grid-stats">
            <div className="stat-card purple">
              <div className="stat-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="label">{t('totalAttendees')}</div>
              <div className="value">{stats.totalAttendees}</div>
            </div>
            
            <div className="stat-card cyan">
              <div className="stat-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <rect x="8" y="2" width="8" height="4" rx="1" />
                  <path d="M9 14l2 2 4-4" />
                </svg>
              </div>
              <div className="label">{t('checkedIn')}</div>
              <div className="value">{stats.totalCheckedIn}</div>
            </div>
            
            <div className="stat-card amber">
              <div className="stat-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="6" />
                  <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
                </svg>
              </div>
              <div className="label">{t('certificatesIssued')}</div>
              <div className="value">{stats.totalCertificates}</div>
            </div>
            
            <div className="stat-card green">
              <div className="stat-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div className="label">{t('sessions')}</div>
              <div className="value">{stats.totalSessions}</div>
            </div>
          </div>
          
          <div className="card">
            <h2>{t('quickActions')}</h2>
            <div className="quick-actions">
              <Link className="quick-action-btn" to="/admin/sessions">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>{t('manageSessions')}</span>
              </Link>
              <Link className="quick-action-btn" to="/admin/qr">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="3" height="3" />
                  <line x1="21" y1="14" x2="21" y2="17" />
                  <line x1="14" y1="21" x2="17" y2="21" />
                  <line x1="21" y1="21" x2="21" y2="21" />
                </svg>
                <span>{t('showQrCode')}</span>
              </Link>
              <Link className="quick-action-btn" to="/admin/attendees">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span>{t('viewAttendees')}</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
