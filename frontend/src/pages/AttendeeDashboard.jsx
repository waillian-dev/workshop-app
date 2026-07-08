import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function AttendeeDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [attendance, setAttendance] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.getMyAttendance(), api.getMyCertificate()])
      .then(([attendanceData, certificateData]) => {
        setAttendance(attendanceData);
        setCertificate(certificateData);
      })
      .catch((err) => setError(err.message));
  }, []);

  if (!attendance && !error) {
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
        <h1>{t('welcomeAttendee')}, {user?.name}! 👋</h1>
        <p>{t('attendeeOverview')}</p>
      </div>

      {error && <div className="alert error">{error}</div>}
      
      <div className="grid-stats">
        <div className="stat-card purple">
          <div className="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div className="label">{t('nameLabel')}</div>
          <div className="value" style={{ fontSize: '1.25rem', padding: '0.2rem 0', wordBreak: 'break-all' }}>{user?.name}</div>
        </div>
        
        <div className="stat-card green">
          <div className="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="label">{t('registrationLabel')}</div>
          <div className="value" style={{ fontSize: '1.25rem', padding: '0.2rem 0' }}>
            <span className="badge success">{t('registeredBadge')}</span>
          </div>
        </div>
        
        <div className="stat-card cyan">
          <div className="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" />
            </svg>
          </div>
          <div className="label">{t('attendance')}</div>
          <div className="value" style={{ fontSize: '1.25rem', padding: '0.2rem 0' }}>
            {attendance?.checkedIn ? (
              <span className="badge success">{t('checkedIn')}</span>
            ) : (
              <span className="badge warning">{t('notCheckedInBadge')}</span>
            )}
          </div>
        </div>

        <div className="stat-card amber">
          <div className="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="6" />
              <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
            </svg>
          </div>
          <div className="label">{t('certificate')}</div>
          <div className="value" style={{ fontSize: '1.25rem', padding: '0.2rem 0' }}>
            {certificate?.eligible ? (
              <span className="badge success">{t('eligibleBadge')}</span>
            ) : (
              <span className="badge neutral">{t('notEligibleBadge')}</span>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <h2>{t('quickLinks')}</h2>
        <div className="quick-actions">
          <Link className="quick-action-btn" to="/schedule">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>{t('viewSchedule')}</span>
          </Link>
          <Link className="quick-action-btn" to="/certificate">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="6" />
              <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
            </svg>
            <span>{t('certificate')}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
