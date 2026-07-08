import { useEffect, useState } from 'react';
import { api, downloadBlob } from '../api';
import { formatDateTime } from '../api';
import { useLanguage } from '../context/LanguageContext';

export default function CertificatePage() {
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    api.getMyCertificate()
      .then(setCertificate)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleDownload() {
    setDownloading(true);
    setError('');
    try {
      const blob = await api.downloadMyCertificate();
      downloadBlob(blob, `certificate-${certificate.certificateCode}.pdf`);
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloading(false);
    }
  }

  if (loading) return (
    <div className="card loading-card">
      <div className="spinner" />
      <p>{t('loading')}</p>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1>{t('certificate')}</h1>
      </div>
      {error && <div className="alert error">{error}</div>}
      <div className="card cert-card">
        {certificate?.eligible ? (
          <>
            <div className="cert-icon eligible">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="6" />
                <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
              </svg>
            </div>
            <h2>{t('certificateReady')}</h2>
            <div className="cert-code-container" style={{ margin: '1rem 0' }}>
              <p style={{ margin: '0 0 0.25rem', fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                {t('certificateCode')}
              </p>
              <div className="cert-code">{certificate.certificateCode}</div>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              <strong>{t('issuedAt')}:</strong> {formatDateTime(certificate.issuedAt)}
            </p>
            <button className="btn" onClick={handleDownload} disabled={downloading} style={{ width: '100%', maxWidth: '300px' }}>
              {downloading ? (
                <>
                  <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                  {t('downloading')}
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  {t('downloadPdf')}
                </>
              )}
            </button>
          </>
        ) : (
          <>
            <div className="cert-icon not-eligible">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h2>{t('certificateNotAvailable')}</h2>
            <div className="alert warning" style={{ margin: '1rem 0 0' }}>
              {certificate?.message ? t('certificateInstruction') : t('certificateInstruction')}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
