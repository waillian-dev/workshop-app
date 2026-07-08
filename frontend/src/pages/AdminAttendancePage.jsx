import { useEffect, useState } from 'react';
import { api, formatDateTime } from '../api';
import { useLanguage } from '../context/LanguageContext';

export default function AdminAttendancePage() {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    api.getAdminAttendance()
      .then(({ records: data }) => setRecords(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>{t('attendanceRecords')}</h1>
      </div>
      {error && <div className="alert error">{error}</div>}
      {loading ? (
        <div className="card loading-card">
          <div className="spinner"></div>
          {t('loading')}
        </div>
      ) : records.length === 0 ? (
        <div className="card empty-state">{t('noAttendanceRecords')}</div>
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>{t('nameLabel')}</th>
                <th>{t('email')}</th>
                <th>{t('checkedInAt')}</th>
                <th>{t('method')}</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  <td>{record.name}</td>
                  <td>{record.email}</td>
                  <td>{formatDateTime(record.checked_in_at)}</td>
                  <td>
                    <span className="badge info">{record.method}</span>
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
