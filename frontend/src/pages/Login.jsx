import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { LogIn, Mail, Lock, AlertCircle, BookOpen } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setGeneralError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setGeneralError('');

    try {
      const res = await login(formData);
      success('Welcome back, ' + (res.data?.name || 'Student') + '!');
      
      const role = res.data?.role;
      if (role === 'ADMIN') {
        navigate('/admin');
      } else {
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from);
      }
    } catch (err) {
      let msg = err.response?.data?.message;
      if (!msg) {
        if (err.message === 'Network Error' || !err.response) {
          msg = 'Cannot connect to backend server. Please make sure Spring Boot is running on http://localhost:8080.';
        } else {
          msg = err.message || 'Invalid email or password. Please try again.';
        }
      }
      setGeneralError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar />

      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        background: 'radial-gradient(circle at 50% 10%, rgba(99, 102, 241, 0.08) 0%, transparent 50%)'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '440px',
          background: 'white',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          padding: '2.5rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.02)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1, #4338ca)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
            }}>
              <LogIn size={24} />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Welcome Back</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Access your college notes and AI summaries
            </p>
          </div>

          {generalError && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              fontSize: '0.875rem',
              marginBottom: '1.5rem'
            }}>
              <AlertCircle size={18} />
              <span>{generalError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="student@college.edu"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
              {errors.password && <div className="form-error">{errors.password}</div>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div style={{
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid #f1f5f9',
            textAlign: 'center',
            fontSize: '0.9rem',
            color: '#64748b'
          }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ fontWeight: 600, color: '#4f46e5' }}>
              Create Account
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};
