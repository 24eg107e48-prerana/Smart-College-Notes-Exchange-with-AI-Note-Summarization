import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Sidebar } from '../../components/Sidebar';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { adminService } from '../../services/adminService';
import { useToast } from '../../hooks/useToast';
import { formatDate, getStatusBadgeClass } from '../../utils/formatters';
import {
  FileCheck,
  Check,
  X,
  Trash2,
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const AdminNotes = () => {
  const { success, error: toastError } = useToast();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchNotes = async (page = 0) => {
    setLoading(true);
    try {
      const params = { page, size: 15 };
      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }
      const res = await adminService.getNotes(params);
      if (res.data) {
        setNotes(res.data.content || []);
        setCurrentPage(res.data.page);
        setTotalPages(res.data.totalPages);
        setTotalElements(res.data.totalElements);
      }
    } catch (err) {
      console.error(err);
      toastError('Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes(0);
  }, [statusFilter]);

  const handleApprove = async (id) => {
    try {
      await adminService.approveNote(id);
      success('Note approved!');
      fetchNotes(currentPage);
    } catch (err) {
      toastError('Failed to approve note');
    }
  };

  const handleReject = async (id) => {
    try {
      await adminService.rejectNote(id);
      success('Note rejected');
      fetchNotes(currentPage);
    } catch (err) {
      toastError('Failed to reject note');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete note "${title}"?`)) {
      return;
    }
    try {
      await adminService.deleteNote(id);
      success('Note deleted permanently');
      fetchNotes(currentPage);
    } catch (err) {
      toastError('Failed to delete note');
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
              <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                <FileCheck size={28} color="#4f46e5" /> Academic Notes Moderation
              </h1>
              <p style={{ color: '#64748b' }}>
                Review student uploads, approve syllabus materials, and moderate content quality.
              </p>
            </div>

            {/* Status Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={16} color="#64748b" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-select"
                style={{ width: '180px' }}
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending Review</option>
                <option value="APPROVED">Approved Notes</option>
                <option value="REJECTED">Rejected Notes</option>
              </select>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading note submissions..." />
          ) : notes.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <p style={{ color: '#64748b' }}>No notes found with status: {statusFilter}</p>
            </div>
          ) : (
            <div className="card">
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Subject</th>
                      <th>Dept & Sem</th>
                      <th>Uploader</th>
                      <th>Status</th>
                      <th>Views / Downloads</th>
                      <th>Date</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notes.map((note) => (
                      <tr key={note.id}>
                        <td>
                          <Link to={`/notes/${note.id}`} style={{ fontWeight: 600, color: '#0f172a' }}>
                            {note.title}
                          </Link>
                          {note.unit && <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Unit: {note.unit}</div>}
                        </td>
                        <td>{note.subject}</td>
                        <td>{note.department} (S{note.semester})</td>
                        <td>{note.uploadedByName}</td>
                        <td>
                          <span className={getStatusBadgeClass(note.status)}>
                            {note.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.85rem' }}>
                            <span>{note.viewCount} views</span> • <span>{note.downloadCount} dl</span>
                          </div>
                        </td>
                        <td>{formatDate(note.createdAt)}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            {note.status !== 'APPROVED' && (
                              <button
                                onClick={() => handleApprove(note.id)}
                                className="btn btn-success btn-sm"
                                title="Approve"
                              >
                                <Check size={14} />
                              </button>
                            )}

                            {note.status !== 'REJECTED' && (
                              <button
                                onClick={() => handleReject(note.id)}
                                className="btn btn-danger btn-sm"
                                style={{ backgroundColor: '#f59e0b' }}
                                title="Reject"
                              >
                                <X size={14} />
                              </button>
                            )}

                            <Link to={`/notes/${note.id}`} className="btn btn-secondary btn-sm" title="View details">
                              <Eye size={14} />
                            </Link>

                            <button
                              onClick={() => handleDelete(note.id, note.title)}
                              className="btn btn-danger btn-sm"
                              title="Delete permanently"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button
                    onClick={() => fetchNotes(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="btn btn-secondary btn-sm"
                  >
                    <ChevronLeft size={16} /> Previous
                  </button>

                  <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
                    Page <strong>{currentPage + 1}</strong> of <strong>{totalPages}</strong>
                  </span>

                  <button
                    onClick={() => fetchNotes(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                    className="btn btn-secondary btn-sm"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
