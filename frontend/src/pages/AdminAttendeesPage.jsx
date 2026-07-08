import { useEffect, useState } from 'react';
import { api, formatDateTime } from '../api';

export default function AdminAttendeesPage() {
  const [attendees, setAttendees] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    attendance: '',
    certificate: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getAttendees(filters)
      .then(({ attendees: data }) => setAttendees(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <div>
      <div className="page-header">
        <h1>Registered Attendees</h1>
      </div>
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="form-row">
          <div className="form-group">
            <label>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: '0.35rem' }}>
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Search
            </label>
            <input
              placeholder="Name or email"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Attendance</label>
            <select
              value={filters.attendance}
              onChange={(e) => setFilters({ ...filters, attendance: e.target.value })}
            >
              <option value="">All</option>
              <option value="checked_in">Checked In</option>
              <option value="not_checked_in">Not Checked In</option>
            </select>
          </div>
          <div className="form-group">
            <label>Certificate</label>
            <select
              value={filters.certificate}
              onChange={(e) => setFilters({ ...filters, certificate: e.target.value })}
            >
              <option value="">All</option>
              <option value="eligible">Eligible</option>
              <option value="not_eligible">Not Eligible</option>
            </select>
          </div>
        </div>
      </div>
      {error && <div className="alert error">{error}</div>}
      {loading ? (
        <div className="card loading-card">
          <div className="spinner"></div>
          Loading attendees...
        </div>
      ) : attendees.length === 0 ? (
        <div className="card empty-state">No attendees found.</div>
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Organization</th>
                <th>Phone</th>
                <th>Registered</th>
                <th>Attendance</th>
                <th>Certificate</th>
              </tr>
            </thead>
            <tbody>
              {attendees.map((attendee) => (
                <tr key={attendee.id}>
                  <td>{attendee.name}</td>
                  <td>{attendee.email}</td>
                  <td>{attendee.organization || '—'}</td>
                  <td>{attendee.phone || '—'}</td>
                  <td>{formatDateTime(attendee.registeredAt)}</td>
                  <td>
                    {attendee.checkedIn ? (
                      <span className="badge success">Checked In</span>
                    ) : (
                      <span className="badge warning">Pending</span>
                    )}
                  </td>
                  <td>
                    {attendee.certificateEligible ? (
                      <span className="badge success">{attendee.certificateCode || 'Eligible'}</span>
                    ) : (
                      <span className="badge neutral">Not Eligible</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
