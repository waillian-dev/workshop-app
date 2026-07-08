import { useEffect, useState } from 'react';
import { api, formatTimeRange } from '../api';
import { useLanguage } from '../context/LanguageContext';

export default function SchedulePage({ publicView = false }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { t } = useLanguage();
  
  // State for detail modal and session check-in
  const [selectedSession, setSelectedSession] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [checkinError, setCheckinError] = useState('');

  async function loadSessions() {
    const { sessions } = await api.getSessions();
    setSessions(sessions);
  }

  useEffect(() => {
    loadSessions()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!publicView) {
      api.getMyAttendance()
        .then((data) => setAttendance(data))
        .catch(() => {});
    }
  }, [publicView]);

  function handleSessionClick(session) {
    setSelectedSession(session);
    setCheckinError('');
  }

  async function handleCheckIn() {
    if (!selectedSession) return;
    setCheckinLoading(true);
    setCheckinError('');
    try {
      const data = await api.sessionCheckIn(selectedSession.id);
      if (data.status === 'checked_in' || data.status === 'already_checked_in') {
        setAttendance({
          checkedIn: true,
          checkedInAt: data.checkedInAt,
          method: 'session',
        });
      }
    } catch (err) {
      setCheckinError(err.message);
    } finally {
      setCheckinLoading(false);
    }
  }

  if (loading) return (
    <div className="card loading-card">
      <div className="spinner" />
      <p>{t('loading')}</p>
    </div>
  );
  if (error) return <div className="alert error">{error}</div>;

  return (
    <div>
      <div className="page-header">
        <h1>{publicView ? t('publicSchedule') : t('schedule')}</h1>
      </div>
      {sessions.length === 0 ? (
        <div className="card empty-state">{t('sessionsScheduled')}</div>
      ) : (
        <div className="session-list">
          {sessions.map((session) => (
            <div 
              key={session.id} 
              className="card session-item" 
              onClick={() => handleSessionClick(session)}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <h3 style={{ marginTop: 0 }}>{session.title}</h3>
                {session.is_open === 1 && (
                  <span className="badge success" style={{ fontSize: '0.7rem' }}>{t('openBadge')}</span>
                )}
              </div>
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

      {/* Session Details & Attendance Check-in Modal */}
      {selectedSession && (
        <div className="modal-backdrop" onClick={() => setSelectedSession(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedSession.title}</h2>
            <div className="session-meta" style={{ marginBottom: '1.25rem', flexDirection: 'column', gap: '0.6rem' }}>
              <div className="session-meta-item">
                <strong>{t('speaker')}:</strong> {selectedSession.speaker}
              </div>
              <div className="session-meta-item">
                <strong>{t('time')}:</strong> {formatTimeRange(selectedSession.start_time, selectedSession.end_time)}
              </div>
              {selectedSession.location && (
                <div className="session-meta-item">
                  <strong>{t('location')}:</strong> {selectedSession.location}
                </div>
              )}
            </div>
            {selectedSession.description && (
              <p className="session-description" style={{ marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}>
                {selectedSession.description}
              </p>
            )}

            {!publicView && (
              <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.25rem' }}>
                {selectedSession.is_open ? (
                  attendance?.checkedIn ? (
                    <div className="alert success">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {t('alreadyCheckedInAlert')}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div className="alert info">{t('checkinOpenAlert')}</div>
                      {checkinError && <div className="alert error">{checkinError}</div>}
                      <button
                        className="btn btn-full"
                        onClick={handleCheckIn}
                        disabled={checkinLoading}
                      >
                        {checkinLoading ? t('recordingAttendance') : t('recordAttendanceBtn')}
                      </button>
                    </div>
                  )
                ) : (
                  <div className="alert info" style={{ opacity: 0.7 }}>
                    {t('checkinClosedAlert')}
                  </div>
                )}
              </div>
            )}
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn secondary" onClick={() => setSelectedSession(null)}>{t('closeBtn')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
