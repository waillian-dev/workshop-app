import { useEffect, useState } from 'react';
import { api, formatTimeRange } from '../api';

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
    if (!window.confirm('Delete this session?')) return;
    try {
      await api.deleteSession(id);
      await loadSessions();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return (
    <div className="card loading-card">
      <div className="spinner"></div>
      Loading sessions...
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1>Session Management</h1>
        <button className="btn" onClick={openCreate}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Session
        </button>
      </div>
      {error && !showModal && <div className="alert error">{error}</div>}
      {sessions.length === 0 ? (
        <div className="card empty-state">No sessions yet. Add the first session.</div>
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Speaker</th>
                <th>Time</th>
                <th>Location</th>
                <th>Actions</th>
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
                    <div className="actions">
                      <button className="btn secondary" onClick={() => openEdit(session)}>Edit</button>
                      <button className="btn danger" onClick={() => handleDelete(session.id)}>Delete</button>
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
            <h2>{editingId ? 'Edit Session' : 'Add Session'}</h2>
            {error && <div className="alert error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Speaker</label>
                <input value={form.speaker} onChange={(e) => setForm({ ...form, speaker: e.target.value })} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Time</label>
                  <input type="datetime-local" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input type="datetime-local" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label>Location</label>
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="actions">
                <button className="btn" type="submit">{editingId ? 'Save Changes' : 'Create Session'}</button>
                <button className="btn secondary" type="button" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
