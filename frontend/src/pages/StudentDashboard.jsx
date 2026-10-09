import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { userService } from '../services/userService';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../utils/formatters';
import {
  FileText,
  Download,
  Bookmark,
  Sparkles,
  UploadCloud,
  ArrowRight,
  Clock,
  Eye,
  CheckCircle,
  Clock4
} from 'lucide-react';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService.getDashboard()
      .then((res) => {
        if (res.data) {
          setDashboardData(res.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const stats = dashboardData?.stats || {
    notesUploaded: 0,
    totalDownloads: 0,
    savedNotes: 0,
    aiSummaries: 0,
  };

  const recentNotes = dashboardData?.recentNotes || [];
  const recentSummaries = dashboardData?.recentSummaries || [];

  return (
    <div className="app-container">
      <Navbar />

      <div className="dashboard-layout">
        <Sidebar type="student" />

        <main className="dashboard-main">
          {/* Welcome Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h1 style={{ fontSize: '1.85rem' }}>
                Welcome back, {user?.name || 'Student'}! 👋
              </h1>
              <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.25rem' }}>
                {user?.department} • Year {user?.year || 1} • Semester {user?.semester || 1}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/upload" className="btn btn-primary">
                <UploadCloud size={16} /> Upload Notes
              </Link>
              <Link to="/ai-summarizer" className="btn btn-secondary">
                <Sparkles size={16} color="#6366f1" /> Summarize PDF
              </Link>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading your dashboard statistics..." />
          ) : (
            <>
              {/* Stat Cards */}
              <div className="grid-cols-4" style={{ marginBottom: '2.5rem' }}>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}>
                    <FileText size={24} />
                  </div>
                  <div>
                    <div className="stat-value">{stats.notesUploaded}</div>
                    <div className="stat-title">Notes Uploaded</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
                    <Download size={24} />
                  </div>
                  <div>
                    <div className="stat-value">{stats.totalDownloads}</div>
                    <div className="stat-title">Total Downloads</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#fffbeb', color: '#f59e0b' }}>
                    <Bookmark size={24} />
                  </div>
                  <div>
                    <div className="stat-value">{stats.savedNotes}</div>
                    <div className="stat-title">Saved Notes</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#fdf4ff', color: '#c026d3' }}>
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <div className="stat-value">{stats.aiSummaries}</div>
                    <div className="stat-title">AI Summaries</div>
                  </div>
                </div>
              </div>

              {/* Two Column Grid for Recent Notes & AI Summaries */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '1.75rem' }}>
                {/* Recent Uploaded Notes */}
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '1.2rem' }}>My Recent Uploads</h3>
                    <Link to="/upload" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                      Upload New
                    </Link>
                  </div>

                  {recentNotes.length === 0 ? (
                    <EmptyState
                      icon={UploadCloud}
                      title="No notes uploaded yet"
                      description="Share your college course notes with your classmates."
                      action={
                        <Link to="/upload" className="btn btn-primary btn-sm">
                          Upload First Note
                        </Link>
                      }
                    />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {recentNotes.map((note) => (
                        <div
                          key={note.id}
                          style={{
                            padding: '1rem',
                            borderRadius: '10px',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: '#f8fafc'
                          }}
                        >
                          <div>
                            <Link to={`/notes/${note.id}`} style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>
                              {note.title}
                            </Link>
                            <div style={{ display: 'flex', gap: '8px', fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                              <span>{note.subject}</span>
                              <span>•</span>
                              <span>{formatDate(note.createdAt)}</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span className={`badge ${note.status === 'APPROVED' ? 'badge-approved' : note.status === 'PENDING' ? 'badge-pending' : 'badge-rejected'}`}>
                              {note.status}
                            </span>
                            <Link to={`/notes/${note.id}`} className="btn btn-secondary btn-sm" title="View note">
                              <Eye size={14} />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent AI Summaries */}
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '1.2rem' }}>Recent AI Summaries</h3>
                    <Link to="/ai-summarizer" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                      All Summaries
                    </Link>
                  </div>

                  {recentSummaries.length === 0 ? (
                    <EmptyState
                      icon={Sparkles}
                      title="No summaries generated"
                      description="Use our Gemini AI engine to extract questions and key points from any note."
                      action={
                        <Link to="/ai-summarizer" className="btn btn-primary btn-sm">
                          Explore AI Summarizer
                        </Link>
                      }
                    />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {recentSummaries.map((summary) => (
                        <div
                          key={summary.id}
                          style={{
                            padding: '1rem',
                            borderRadius: '10px',
                            border: '1px solid #e2e8f0',
                            backgroundColor: '#f8fafc'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4f46e5' }}>
                              AI Study Guide
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                              {formatDate(summary.createdAt)}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.5', marginBottom: '8px' }}>
                            {summary.summary}
                          </p>
                          <Link
                            to={`/ai-summarizer?noteId=${summary.noteId}`}
                            style={{ fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            Read Full Summary & Exam Questions <ArrowRight size={12} />
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};
