import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Sidebar } from '../../components/Sidebar';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { adminService } from '../../services/adminService';
import { useToast } from '../../hooks/useToast';
import { formatDate } from '../../utils/formatters';
import {
  Users,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Eye,
  Check,
  X
} from 'lucide-react';

export const AdminDashboard = () => {
  const { success, error: toastError } = useToast();
  const [stats, setStats] = useState(null);
  const [pendingNotes, setPendingNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      const [statsRes, notesRes] = await Promise.all([
        adminService.getStats(),
        adminService.getNotes({ status: 'PENDING', size: 5 }),
      ]);

      if (statsRes.data) setStats(statsRes.data);
      if (notesRes.data?.content) setPendingNotes(notesRes.data.content);
    } catch (err) {
      console.error(err);
      toastError('Failed to load administrator statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleApprove = async (id) => {
    try {
      await adminService.approveNote(id);
      success('Note approved successfully!');
      fetchAdminData();
    } catch (err) {
      toastError('Failed to approve note');
    }
  };

  const handleReject = async (id) => {
    try {
      await adminService.rejectNote(id);
      success('Note rejected');
      fetchAdminData();
    } catch (err) {
      toastError('Failed to reject note');
    }
  };

  return (
    <div className="app-container">
      <Navbar />

      <div className="dashboard-layout">
        <Sidebar type="admin" />

        <main className="dashboard-main">
          {/* Header */}
          <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={28} color="#4f46e5" /> Administrator Control Center
              </h1>
              <p style={{ color: '#64748b' }}>
                System-wide overview, content moderation queue, and user management.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/admin/notes" className="btn btn-primary">
                Review Pending Notes ({stats?.pendingNotes || 0})
              </Link>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner message="Calculating system metrics..." />
          ) : (
            <>
              {/* Stat Cards Grid */}
              <div className="grid-cols-4" style={{ marginBottom: '2.5rem' }}>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}>
                    <Users size={24} />
                  </div>
                  <div>
                    <div className="stat-value">{stats?.totalUsers || 0}</div>
                    <div className="stat-title">Registered Users</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#f8fafc', color: '#334155', border: '1px solid #e2e8f0' }}>
                    <FileText size={24} />
                  </div>
                  <div>
                    <div className="stat-value">{stats?.totalNotes || 0}</div>
                    <div className="stat-title">Total Notes</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#fffbeb', color: '#f59e0b' }}>
                    <Clock size={24} />
                  </div>
                  <div>
                    <div className="stat-value">{stats?.pendingNotes || 0}</div>
                    <div className="stat-title">Pending Review</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <div className="stat-value">{stats?.approvedNotes || 0}</div>
                    <div className="stat-title">Approved Notes</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#fef2f2', color: '#ef4444' }}>
                    <XCircle size={24} />
                  </div>
                  <div>
                    <div className="stat-value">{stats?.rejectedNotes || 0}</div>
                    <div className="stat-title">Rejected Notes</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#ecfeff', color: '#0891b2' }}>
                    <Download size={24} />
                  </div>
                  <div>
                    <div className="stat-value">{stats?.totalDownloads || 0}</div>
                    <div className="stat-title">Total Downloads</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#fdf4ff', color: '#c026d3' }}>
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <div className="stat-value">{stats?.totalAiSummaries || 0}</div>
                    <div className="stat-title">AI Summaries</div>
                  </div>
                </div>
              </div>

              {/* Pending Approvals Table */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.25rem' }}>Pending Academic Notes Awaiting Approval</h3>
                  <Link to="/admin/notes" style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    View All Notes <ArrowRight size={14} />
                  </Link>
                </div>

                {pendingNotes.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#10b981' }}>
                    <CheckCircle size={40} style={{ margin: '0 auto 0.75rem' }} />
                    <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>No pending notes!</p>
                    <span style={{ color: '#64748b', fontSize: '0.875rem' }}>All uploaded course notes have been reviewed.</span>
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Subject</th>
                          <th>Dept & Sem</th>
                          <th>Uploader</th>
                          <th>Date</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingNotes.map((note) => (
                          <tr key={note.id}>
                            <td>
                              <Link to={`/notes/${note.id}`} style={{ fontWeight: 600, color: '#0f172a' }}>
                                {note.title}
                              </Link>
                            </td>
                            <td>{note.subject}</td>
                            <td>{note.department} (Sem {note.semester})</td>
                            <td>{note.uploadedByName}</td>
                            <td>{formatDate(note.createdAt)}</td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: '6px' }}>
                                <button
                                  onClick={() => handleApprove(note.id)}
                                  className="btn btn-success btn-sm"
                                  title="Approve note"
                                >
                                  <Check size={14} /> Approve
                                </button>
                                <button
                                  onClick={() => handleReject(note.id)}
                                  className="btn btn-danger btn-sm"
                                  title="Reject note"
                                >
                                  <X size={14} /> Reject
                                </button>
                                <Link to={`/notes/${note.id}`} className="btn btn-secondary btn-sm" title="Inspect note">
                                  <Eye size={14} />
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};
