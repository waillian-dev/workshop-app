import { useEffect, useState } from 'react';
import { api, downloadBlob, formatDateTime } from '../api';
import { useLanguage } from '../context/LanguageContext';

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    api.getAdminCertificates()
      .then(({ certificates: data }) => setCertificates(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleDownload(userId, code) {
    setDownloadingId(userId);
    setError('');
    try {
      const blob = await api.downloadAdminCertificate(userId);
      downloadBlob(blob, `certificate-${code || userId}.pdf`);
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>{t('certificateManagement')}</h1>
      </div>
      {error && <div className="alert error">{error}</div>}
      {loading ? (
        <div className="card loading-card">
          <div className="spinner"></div>
          {t('loading')}
        </div>
      ) : certificates.length === 0 ? (
        <div className="card empty-state">{t('noAttendeesRegistered')}</div>
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>{t('nameLabel')}</th>
                <th>{t('email')}</th>
                <th>{t('attendanceFilter')}</th>
                <th>{t('eligibility')}</th>
                <th>{t('certificateCode')}</th>
                <th>{t('issuedAt')}</th>
                <th>{t('action')}</th>
              </tr>
            </thead>
            <tbody>
              {certificates.map((item) => (
                <tr key={item.userId}>
                  <td>{item.name}</td>
                  <td>{item.email}</td>
                  <td>
                    {item.checkedIn ? (
                      <span className="badge success">{t('checkedIn')}</span>
                    ) : (
                      <span className="badge warning">{t('pendingBadge')}</span>
                    )}
                  </td>
                  <td>
                    {item.eligible ? (
                      <span className="badge success">{t('eligibleBadge')}</span>
                    ) : (
                      <span className="badge neutral">{t('notEligibleBadge')}</span>
                    )}
                  </td>
                  <td>{item.certificateCode || '—'}</td>
                  <td>{formatDateTime(item.issuedAt)}</td>
                  <td>
                    <button
                      className="btn secondary"
                      disabled={!item.eligible || downloadingId === item.userId}
                      onClick={() => handleDownload(item.userId, item.certificateCode)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={downloadingId === item.userId ? 'spinner' : ''} style={{ animation: downloadingId === item.userId ? 'spin 1s linear infinite' : 'none' }}>
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      {downloadingId === item.userId ? t('loading') : t('downloadPdf')}
                    </button>
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
