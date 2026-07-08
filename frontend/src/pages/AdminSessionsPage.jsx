import { useEffect, useState } from 'react';
import { api, formatTimeRange } from '../api';
import { useLanguage } from '../context/LanguageContext';

const emptyForm = {
  title: '',
  description: '',
  speaker: '',
  start_time: '',
  end_time: '',
  location: '',
};

function toLocalInputValue(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function toIsoString(localValue) {
  if (!localValue) return '';
  return new Date(localValue).toISOString();
}

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  async function loadSessions() {
    const { sessions: data } = await api.getSessions();
    setSessions(data);
  }

  useEffect(() => {
    loadSessions()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
    setError('');
  }

  function openEdit(session) {
    setEditingId(session.id);
    setForm({
      title: session.title,
      description: session.description || '',
      speaker: session.speaker,
      start_time: toLocalInputValue(session.start_time),
      end_time: toLocalInputValue(session.end_time),
      location: session.location || '',
    });
    setShowModal(true);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const payload = {
      ...form,
      start_time: toIsoString(form.start_time),
      end_time: toIsoString(form.end_time),
    };

    try {
      if (editingId) {
        await api.updateSession(editingId, payload);
      } else {
        await api.createSession(payload);
      }
      setShowModal(false);
      await loadSessions();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm(t('confirmDelete') || 'Delete this session?')) return;
    try {
      await api.deleteSession(id);
      await loadSessions();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleToggle(id) {
    setError('');
    try {
      await api.toggleSessionOpen(id);
      await loadSessions();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return (
    <div className="card loading-card">
      <div className="spinner"></div>
      {t('loading')}
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1>{t('manageSessions')}</h1>
        <button className="btn" onClick={openCreate}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {t('addSession') || 'Add Session'}
        </button>
      </div>
      {error && !showModal && <div className="alert error">{error}</div>}
      {sessions.length === 0 ? (
        <div className="card empty-state">{t('noSessions') || 'No sessions yet.'}</div>
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>{t('title') || 'Title'}</th>
                <th>{t('speaker')}</th>
                <th>{t('time')}</th>
                <th>{t('location')}</th>
                <th>{t('attendanceFilter') || 'Status'}</th>
                <th>{t('action') || 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id}>
                  <td>{session.title}</td>
                  <td>{session.speaker}</td>
                  <td>{formatTimeRange(session.start_time, session.end_time)}</td>
                  <td>{session.location || '—'}</td>
                  <td>
                    {session.is_open ? (
                      <span className="badge success">{t('openBadge')}</span>
                    ) : (
                      <span className="badge neutral">{t('pendingBadge') || 'Closed'}</span>
                    )}
                  </td>
                  <td>
                    <div className="actions">
                      <button 
                        className={`btn ${session.is_open ? 'secondary' : ''}`} 
                        onClick={() => handleToggle(session.id)}
                        style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                      >
                        {session.is_open ? t('closeBtn') || 'Close' : t('openBadge') || 'Open'}
                      </button>
                      <button className="btn secondary" onClick={() => openEdit(session)}>{t('edit') || 'Edit'}</button>
                      <button className="btn danger" onClick={() => handleDelete(session.id)}>{t('delete') || 'Delete'}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>{editingId ? (t('editSession') || 'Edit Session') : (t('addSession') || 'Add Session')}</h2>
            {error && <div className="alert error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>{t('title') || 'Title'}</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>{t('speaker')}</label>
                <input value={form.speaker} onChange={(e) => setForm({ ...form, speaker: e.target.value })} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>{t('startTime') || 'Start Time'}</label>
                  <input type="datetime-local" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>{t('endTime') || 'End Time'}</label>
                  <input type="datetime-local" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label>{t('location')}</label>
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
              <div className="form-group">
                <label>{t('description')}</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="actions">
                <button className="btn" type="submit">{editingId ? (t('save') || 'Save Changes') : (t('create') || 'Create')}</button>
                <button className="btn secondary" type="button" onClick={() => setShowModal(false)}>{t('closeBtn') || 'Cancel'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
