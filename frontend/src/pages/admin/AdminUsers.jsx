import React, { useEffect, useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { Sidebar } from '../../components/Sidebar';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { adminService } from '../../services/adminService';
import { formatDate } from '../../utils/formatters';
import { Users, Shield, GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchUsers = async (page = 0) => {
    setLoading(true);
    try {
      const res = await adminService.getUsers({ page, size: 15 });
      if (res.data) {
        setUsers(res.data.content || []);
        setCurrentPage(res.data.page);
        setTotalPages(res.data.totalPages);
        setTotalElements(res.data.totalElements);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(0);
  }, []);

  return (
    <div className="app-container">
      <Navbar />

      <div className="dashboard-layout">
        <Sidebar type="admin" />

        <main className="dashboard-main">
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
              <Users size={28} color="#4f46e5" /> User Management Directory
            </h1>
            <p style={{ color: '#64748b' }}>
              View and audit all registered university students and administrators ({totalElements} total).
            </p>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading user directory..." />
          ) : (
            <div className="card">
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Department</th>
                      <th>Year / Sem</th>
                      <th>Notes Shared</th>
                      <th>Joined Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{u.name}</div>
                        </td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`badge ${u.role === 'ADMIN' ? 'badge-approved' : 'badge-info'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            {u.role === 'ADMIN' ? <Shield size={12} /> : <GraduationCap size={12} />}
                            {u.role}
                          </span>
                        </td>
                        <td>{u.department || 'N/A'}</td>
                        <td>
                          {u.year ? `Year ${u.year} (Sem ${u.semester})` : 'N/A'}
                        </td>
                        <td>
                          <strong>{u.notesCount}</strong> notes
                        </td>
                        <td>{formatDate(u.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button
                    onClick={() => fetchUsers(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="btn btn-secondary btn-sm"
                  >
                    <ChevronLeft size={16} /> Previous
                  </button>

                  <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
                    Page <strong>{currentPage + 1}</strong> of <strong>{totalPages}</strong>
                  </span>

                  <button
                    onClick={() => fetchUsers(currentPage + 1)}
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
