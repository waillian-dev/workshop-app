import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, formatDateTime } from '../api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function CheckInPage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [checkedInAt, setCheckedInAt] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      setStatus('invalid');
      setMessage('No attendance token provided.');
      return;
    }
    if (!user) {
      setStatus('login_required');
      return;
    }
    if (user.role !== 'attendee') {
      setStatus('forbidden');
      setMessage('Only attendees can check in.');
      return;
    }

    setStatus('checking_in');
    api.checkIn(token)
      .then((data) => {
        setStatus(data.status);
        setMessage(data.message);
        setCheckedInAt(data.checkedInAt);
      })
      .catch((err) => {
        if (err.message.includes('token')) {
          setStatus('invalid');
        } else {
          setStatus('error');
        }
        setMessage(err.message);
      });
  }, [authLoading, user, token]);

  const loginUrl = `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h1>{t('checkinTitle')}</h1>
        
        {status === 'login_required' && (
          <div style={{ textAlign: 'center' }}>
            <div className="checkin-icon info-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
            </div>
            <div className="alert info">{t('pleaseLoginCheckin')}</div>
            <Link className="btn btn-full" to={loginUrl}>{t('goToLogin')}</Link>
          </div>
        )}
        
        {status === 'checking_in' && (
          <div style={{ textAlign: 'center' }}>
            <div className="checkin-icon info-icon">
              <div className="spinner"></div>
            </div>
            <div className="alert info">{t('checkingYouIn')}</div>
          </div>
        )}
        
        {status === 'checked_in' && (
          <div style={{ textAlign: 'center' }}>
            <div className="checkin-icon success-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="alert success">{t('alreadyCheckedInAlert')}</div>
            {checkedInAt && <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{t('checkedInAt')}: {formatDateTime(checkedInAt)}</p>}
            <Link className="btn btn-full" to="/dashboard">{t('goToDashboard')}</Link>
          </div>
        )}
        
        {status === 'already_checked_in' && (
          <div style={{ textAlign: 'center' }}>
            <div className="checkin-icon success-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="alert success">{t('alreadyCheckedInAlert')}</div>
            {checkedInAt && <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{t('checkedInAt')}: {formatDateTime(checkedInAt)}</p>}
            <Link className="btn btn-full" to="/dashboard">{t('goToDashboard')}</Link>
          </div>
        )}
        
        {(status === 'invalid' || status === 'forbidden' || status === 'error') && (
          <div style={{ textAlign: 'center' }}>
            <div className="checkin-icon error-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
            <div className="alert error">{message || 'Check-in failed.'}</div>
            <Link className="btn btn-full secondary" to="/">{t('backHome')}</Link>
          </div>
        )}
      </div>
    </div>
  );
}
