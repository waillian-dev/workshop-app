import { useEffect, useState } from 'react';
import { api, formatDateTime } from '../api';

export default function AdminAttendancePage() {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAdminAttendance()
      .then(({ records: data }) => setRecords(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Attendance Records</h1>
      </div>
      {error && <div className="alert error">{error}</div>}
      {loading ? (
        <div className="card loading-card">
          <div className="spinner"></div>
          Loading attendance records...
        </div>
      ) : records.length === 0 ? (
        <div className="card empty-state">No attendance records yet.</div>
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Checked In At</th>
                <th>Method</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  <td>{record.name}</td>
                  <td>{record.email}</td>
                  <td>{formatDateTime(record.checked_in_at)}</td>
                  <td>{record.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
