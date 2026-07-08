import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, formatDateTime } from '../api';
import { useAuth } from '../context/AuthContext';

export default function CheckInPage() {
  const { user, loading: authLoading } = useAuth();
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
        <h1>Attendance Check-In</h1>
        {status === 'login_required' && (
          <>
            <div className="checkin-icon info-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
            </div>
            <div className="alert info">Please log in to check in.</div>
            <Link className="btn" to={loginUrl}>Go to Login</Link>
          </>
        )}
        {status === 'checking_in' && (
          <>
            <div className="checkin-icon info-icon">
              <div className="spinner"></div>
            </div>
            <div className="alert info">Checking you in...</div>
          </>
        )}
        {status === 'checked_in' && (
          <>
            <div className="checkin-icon success-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="alert success">{message}</div>
            <p>Checked in at: {formatDateTime(checkedInAt)}</p>
            <Link className="btn secondary" to="/dashboard">Go to Dashboard</Link>
          </>
        )}
        {status === 'already_checked_in' && (
          <>
            <div className="checkin-icon warning-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div className="alert warning">{message}</div>
            <p>Checked in at: {formatDateTime(checkedInAt)}</p>
            <Link className="btn secondary" to="/dashboard">Go to Dashboard</Link>
          </>
        )}
        {(status === 'invalid' || status === 'forbidden' || status === 'error') && (
          <>
            <div className="checkin-icon error-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
            <div className="alert error">{message}</div>
            <Link className="btn secondary" to="/">Back Home</Link>
          </>
        )}
      </div>
    </div>
  );
}
