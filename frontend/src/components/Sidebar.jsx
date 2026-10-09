import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard,
  BookOpen,
  UploadCloud,
  Bookmark,
  Sparkles,
  Bot,
  User,
  LogOut,
  Users,
  FileCheck
} from 'lucide-react';

export const Sidebar = ({ type = 'student' }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {type === 'admin' ? (
        <>
          <div className="sidebar-heading">Admin Management</div>
          <NavLink to="/admin" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={18} /> Admin Overview
          </NavLink>
          <NavLink to="/admin/notes" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <FileCheck size={18} /> Note Approvals
          </NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Users size={18} /> User Directory
          </NavLink>

          <div className="sidebar-heading" style={{ marginTop: '1rem' }}>Navigation</div>
          <NavLink to="/notes" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <BookOpen size={18} /> Notes Library
          </NavLink>
        </>
      ) : (
        <>
          <div className="sidebar-heading">Study Workspace</div>
          <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>
          <NavLink to="/notes" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <BookOpen size={18} /> Notes Library
          </NavLink>
          <NavLink to="/upload" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <UploadCloud size={18} /> Upload Notes
          </NavLink>
          <NavLink to="/saved" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Bookmark size={18} /> Saved Notes
          </NavLink>

          <div className="sidebar-heading" style={{ marginTop: '1rem' }}>AI Intelligence</div>
          <NavLink to="/ai-summarizer" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Sparkles size={18} color="#6366f1" /> AI Summarizer
          </NavLink>
          <NavLink to="/ai-assistant" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Bot size={18} color="#06b6d4" /> AI Study Assistant
          </NavLink>

          <div className="sidebar-heading" style={{ marginTop: '1rem' }}>Account</div>
          <NavLink to="/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <User size={18} /> My Profile
          </NavLink>
        </>
      )}

      <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ padding: '0 0.5rem 0.75rem', fontSize: '0.85rem' }}>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>{user?.name || 'User'}</div>
          <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{user?.email}</div>
        </div>
        <button
          onClick={handleLogout}
          className="sidebar-link"
          style={{ width: '100%', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', color: '#ef4444' }}
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );
};
