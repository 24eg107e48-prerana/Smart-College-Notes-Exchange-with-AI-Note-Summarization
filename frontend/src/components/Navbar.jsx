import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { BookOpen, LogIn, UserPlus, LogOut, LayoutDashboard, Shield, Sparkles } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <div className="logo-icon">
            <BookOpen size={22} />
          </div>
          <span>Smart College Notes</span>
        </Link>

        <ul className="navbar-nav">
          <li>
            <NavLink to="/notes" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Notes Library
            </NavLink>
          </li>
          <li>
            <NavLink to="/ai-summarizer" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={16} color="#6366f1" /> AI Summarizer
              </span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/ai-assistant" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              AI Assistant
            </NavLink>
          </li>

          {isAuthenticated ? (
            <>
              {isAdmin ? (
                <li>
                  <Link to="/admin" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Shield size={16} color="#4f46e5" /> Admin Panel
                  </Link>
                </li>
              ) : (
                <li>
                  <Link to="/dashboard" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                </li>
              )}
              <li>
                <button
                  onClick={handleLogout}
                  className="btn btn-sm"
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid #e2e8f0',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="Logout"
                >
                  <LogOut size={16} /> Logout
                </button>
              </li>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <LogIn size={16} /> Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <UserPlus size={16} /> Register
              </Link>
            </div>
          )}
        </ul>
      </div>
    </nav>
  );
};
