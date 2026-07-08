import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (redirect && user.role === 'attendee') {
        navigate(redirect);
        return;
      }
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V5a4 4 0 0 0-8 0v2" />
            </svg>
          </div>
          <span className="auth-brand-name">{t('brandName')}</span>
        </div>
        <h1>{t('signIn')}</h1>
        <p className="auth-subtitle">{t('loginSubtitle')}</p>
        {error && <div className="alert error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">{t('email')}</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="password">{t('password')}</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button className="btn btn-full" type="submit" disabled={loading}>
            {loading ? t('signingIn') : t('signInBtn')}
          </button>
        </form>
        <div className="auth-footer">
          <p style={{ margin: 0 }}>
            {t('newAttendee')}{' '}
            <Link to="/register" style={{ fontWeight: 600 }}>{t('registerHere')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
