import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function AttendeeDashboard() {
  const { user } = useAuth();
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

  if (attendance === null && !error) {
    return (
      <div className="card loading-card">
        <div className="spinner" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="welcome-banner">
        <h1>Welcome, {user?.name}! 👋</h1>
        <p>Your workshop status at a glance</p>
      </div>
      {error && <div className="alert error">{error}</div>}
      <div className="grid-stats">
        <div className="stat-card green">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <div className="label">Registration</div>
          <div className="value">
            <span className="badge success">Registered</span>
          </div>
        </div>
        <div className="stat-card cyan">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            </svg>
          </div>
          <div className="label">Attendance</div>
          <div className="value">
            {attendance?.checkedIn ? (
              <span className="badge success">Checked In</span>
            ) : (
              <span className="badge warning">Not Checked In</span>
            )}
          </div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="6" />
              <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
            </svg>
          </div>
          <div className="label">Certificate</div>
          <div className="value">
            {certificate?.eligible ? (
              <span className="badge success">Eligible</span>
            ) : (
              <span className="badge neutral">Not Eligible</span>
            )}
          </div>
        </div>
      </div>
      <div className="card">
        <h2>Quick Links</h2>
        <div className="quick-actions">
          <Link className="quick-action-btn" to="/schedule">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            View Schedule
          </Link>
          <Link className="quick-action-btn" to="/certificate">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="6" />
              <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
            </svg>
            Certificate
          </Link>
        </div>
      </div>
    </div>
  );
}
