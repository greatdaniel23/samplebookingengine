import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { paths } from '@/config/paths';
import { setAuthToken } from '@/config/cloudflare';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const isAdminLoggedIn = sessionStorage.getItem('adminLoggedIn');
    if (isAdminLoggedIn === 'true') {
      navigate('/admin');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(paths.buildApiUrl('auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.data?.token) {
        setAuthToken(data.data.token);
        sessionStorage.setItem('adminLoggedIn', 'true');
        sessionStorage.setItem('adminUser', credentials.username);
        navigate('/admin');
      } else {
        setError('Could not sign in. Please verify your credentials and try again.');
      }
    } catch (err) {
      setError('Could not sign in. Please verify your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-samudra-paper flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Brand block */}
        <div className="text-center mb-12">
          <p className="font-script text-samudra-gold text-[28px] leading-none mb-4">
            samudra
          </p>
          <div className="h-px w-[60px] mx-auto mb-6" style={{ background: 'rgba(31,27,23,0.4)' }} />
          <h1 className="font-display text-[32px] font-light tracking-[0.32em] uppercase text-samudra-ink">
            Admin Access
          </h1>
        </div>

        {/* Form card */}
        <div className="w-full bg-samudra-paper border border-samudra-paper-deep p-8 space-y-6">

          {error && (
            <div
              className="text-[12px] italic pl-3 mt-2"
              style={{ color: '#7a3d31', borderLeft: '1px solid #7a3d31' }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="eyebrow block mb-2"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                required
                className="h-11 w-full bg-samudra-paper border px-3 text-[14px] text-samudra-ink transition-colors focus:outline-none"
                style={{
                  borderColor: 'rgba(31,27,23,0.3)',
                  fontFamily: 'var(--font-label)',
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'var(--teal)';
                  e.target.style.boxShadow = '0 0 0 2px rgba(30,68,63,0.2)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(31,27,23,0.3)';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder=""
                autoComplete="username"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="eyebrow block mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                required
                className="h-11 w-full bg-samudra-paper border px-3 text-[14px] text-samudra-ink transition-colors focus:outline-none"
                style={{
                  borderColor: 'rgba(31,27,23,0.3)',
                  fontFamily: 'var(--font-label)',
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'var(--teal)';
                  e.target.style.boxShadow = '0 0 0 2px rgba(30,68,63,0.2)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(31,27,23,0.3)';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder=""
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-samudra-ink text-samudra-paper text-[11px] tracking-[0.3em] uppercase font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-samudra-teal"
              style={{ fontFamily: 'var(--font-label)', cursor: loading ? 'wait' : 'pointer' }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Back to home link */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            aria-label="Back to public homepage"
            className="eyebrow inline-flex items-center gap-2 text-samudra-ink-mute hover:underline transition-all"
          >
            <span>&#8592;</span>
            <span>Back to Homepage</span>
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <div className="h-px w-20 mx-auto mb-4 bg-samudra-paper-deep" />
          <p className="eyebrow text-samudra-ink-mute">
            Samudra &middot; Uluwatu &middot; Bali &middot; 2026
          </p>
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;
