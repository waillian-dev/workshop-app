import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../api';
import { useLanguage } from '../context/LanguageContext';

export default function AdminQrPage() {
  const [tokenData, setTokenData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const { t } = useLanguage();

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
      {t('loading')}
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1>{t('attendanceQrCode')}</h1>
        <button className="btn secondary" onClick={handleRegenerate} disabled={regenerating}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={regenerating ? 'spinner' : ''} style={{ animation: regenerating ? 'spin 1s linear infinite' : 'none' }}>
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
          {regenerating ? t('regeneratingToken') : t('regenerateTokenBtn')}
        </button>
      </div>
      {error && <div className="alert error">{error}</div>}
      {tokenData && (
        <div className="card qr-container">
          <div className="qr-glow">
            <QRCodeSVG value={fullUrl} size={220} />
          </div>
          <div>
            <span className="badge success">{t('activeBadge')}</span>
          </div>
          <p className="qr-instructions">{t('qrInstruction')}</p>
          <div className="qr-url">{fullUrl}</div>
        </div>
      )}
    </div>
  );
}
