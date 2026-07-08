import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../api';

export default function AdminQrPage() {
  const [tokenData, setTokenData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  async function loadToken() {
    const data = await api.getAttendanceToken();
    setTokenData(data);
  }

  useEffect(() => {
    loadToken()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleRegenerate() {
    setRegenerating(true);
    setError('');
    try {
      const data = await api.regenerateAttendanceToken();
      setTokenData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setRegenerating(false);
    }
  }

  const fullUrl = tokenData
    ? `${window.location.origin}${tokenData.checkInUrl}`
    : '';

  if (loading) return (
    <div className="card loading-card">
      <div className="spinner"></div>
      Loading QR code...
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1>Attendance QR Code</h1>
        <button className="btn secondary" onClick={handleRegenerate} disabled={regenerating}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" />
            <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14" />
          </svg>
          {regenerating ? 'Regenerating...' : 'Regenerate Token'}
        </button>
      </div>
      {error && <div className="alert error">{error}</div>}
      {tokenData && (
        <div className="card qr-container">
          <div className="qr-glow">
            <QRCodeSVG value={fullUrl} size={220} />
          </div>
          <div>
            <span className="badge success">Active</span>
          </div>
          <p className="qr-instructions">Display this QR code during the workshop for attendee self-check-in.</p>
          <div className="qr-url">{fullUrl}</div>
        </div>
      )}
    </div>
  );
}
