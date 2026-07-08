import { useEffect, useState } from 'react';
import { api, formatDateTime } from '../api';
import { useLanguage } from '../context/LanguageContext';

export default function AdminAttendeesPage() {
  const [attendees, setAttendees] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    attendance: '',
    certificate: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

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
        <h1>{t('registeredAttendees')}</h1>
      </div>
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="form-row">
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              {t('searchLabel')}
            </label>
            <input
              placeholder={t('searchPlaceholder')}
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>{t('attendanceFilter')}</label>
            <select
              value={filters.attendance}
              onChange={(e) => setFilters({ ...filters, attendance: e.target.value })}
            >
              <option value="">{t('allOption')}</option>
              <option value="checked_in">{t('checkedIn')}</option>
              <option value="not_checked_in">{t('notCheckedInBadge')}</option>
            </select>
          </div>
          <div className="form-group">
            <label>{t('certificateFilter')}</label>
            <select
              value={filters.certificate}
              onChange={(e) => setFilters({ ...filters, certificate: e.target.value })}
            >
              <option value="">{t('allOption')}</option>
              <option value="eligible">{t('eligibleBadge')}</option>
              <option value="not_eligible">{t('notEligibleBadge')}</option>
            </select>
          </div>
        </div>
      </div>
      {error && <div className="alert error">{error}</div>}
      {loading ? (
        <div className="card loading-card">
          <div className="spinner"></div>
          {t('loading')}
        </div>
      ) : attendees.length === 0 ? (
        <div className="card empty-state">{t('noAttendeesFound')}</div>
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>{t('nameLabel')}</th>
                <th>{t('email')}</th>
                <th>{t('organization')}</th>
                <th>{t('phone')}</th>
                <th>{t('registeredBadge')}</th>
                <th>{t('attendanceFilter')}</th>
                <th>{t('certificateFilter')}</th>
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
                      <span className="badge success">{t('checkedIn')}</span>
                    ) : (
                      <span className="badge warning">{t('pendingBadge')}</span>
                    )}
                  </td>
                  <td>
                    {attendee.certificateEligible ? (
                      <span className="badge success">{attendee.certificateCode || t('eligibleBadge')}</span>
                    ) : (
                      <span className="badge neutral">{t('notEligibleBadge')}</span>
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
