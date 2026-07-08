import { useEffect, useState } from 'react';
import { api, formatTimeRange } from '../api';

export default function SchedulePage({ publicView = false }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getSessions()
      .then(({ sessions }) => setSessions(sessions))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="card loading-card">
      <div className="spinner" />
      <p>Loading schedule...</p>
    </div>
  );
  if (error) return <div className="alert error">{error}</div>;

  return (
    <div>
      <div className="page-header">
        <h1>{publicView ? 'Workshop Schedule' : 'Schedule'}</h1>
      </div>
      {sessions.length === 0 ? (
        <div className="card empty-state">No sessions scheduled yet.</div>
      ) : (
        <div className="session-list">
          {sessions.map((session) => (
            <div key={session.id} className="card session-item">
              <h3 style={{ marginTop: 0 }}>{session.title}</h3>
              <div className="session-meta">
                <div className="session-meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {formatTimeRange(session.start_time, session.end_time)}
                </div>
                <div className="session-meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  {session.speaker}
                </div>
                {session.location && (
                  <div className="session-meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {session.location}
                  </div>
                )}
              </div>
              {session.description && <p className="session-description">{session.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
