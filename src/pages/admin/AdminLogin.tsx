import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already logged in
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
      // For demo purposes, using simple credentials
      // In production, this should be a proper API call
      if (credentials.username === 'admin' && credentials.password === 'admin123') {
        sessionStorage.setItem('adminLoggedIn', 'true');
        sessionStorage.setItem('adminUser', credentials.username);
        navigate('/admin');
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
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
    <div className="min-h-screen bg-gradient-to-br from-hotel-cream to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back to home link */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="flex items-center text-hotel-gold hover:text-hotel-bronze transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-hotel-gold rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-hotel-navy">Admin Login</h1>
            <p className="text-hotel-bronze mt-2">Access the villa management system</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="username"
                  value={credentials.username}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hotel-gold focus:border-transparent"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hotel-gold focus:border-transparent"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-hotel-gold text-white py-3 px-4 rounded-lg hover:bg-hotel-bronze transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;