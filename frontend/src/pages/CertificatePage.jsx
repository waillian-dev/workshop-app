import { useEffect, useState } from 'react';
import { api, downloadBlob } from '../api';
import { formatDateTime } from '../api';

export default function CertificatePage() {
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

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
      <p>Loading certificate status...</p>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1>Certificate</h1>
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
            <h2>Certificate Ready!</h2>
            <div className="cert-code">{certificate.certificateCode}</div>
            <p><strong>Issued At:</strong> {formatDateTime(certificate.issuedAt)}</p>
            <button className="btn" onClick={handleDownload} disabled={downloading}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {downloading ? 'Downloading...' : 'Download Certificate PDF'}
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
            <h2>Certificate Not Available</h2>
            <p>{certificate?.message || 'Attendance is required before a certificate can be issued.'}</p>
          </>
        )}
      </div>
    </div>
  );
}
