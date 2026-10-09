import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { userService } from '../services/userService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { formatDate } from '../utils/formatters';
import {
  User,
  Mail,
  Building,
  GraduationCap,
  Calendar,
  Save,
  CheckCircle2,
  BookOpen,
  Download
} from 'lucide-react';

export const Profile = () => {
  const { user, updateUserState } = useAuth();
  const { success, error: toastError } = useToast();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    department: '',
    year: 1,
    semester: 1,
  });

  useEffect(() => {
    userService.getProfile()
      .then((res) => {
        if (res.data) {
          setProfileData(res.data);
          setFormData({
            name: res.data.name || '',
            department: res.data.department || 'Computer Science',
            year: res.data.year || 1,
            semester: res.data.semester || 1,
          });
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        year: parseInt(formData.year, 10),
        semester: parseInt(formData.semester, 10),
      };
      const res = await userService.updateProfile(payload);
      if (res.data) {
        setProfileData((prev) => ({ ...prev, ...res.data }));
        updateUserState(res.data);
        success('Profile updated successfully!');
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar />

      <div className="dashboard-layout">
        <Sidebar type={user?.role === 'ADMIN' ? 'admin' : 'student'} />

        <main className="dashboard-main">
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Student Profile</h1>
              <p style={{ color: '#64748b' }}>
                Manage your academic credentials and university affiliations.
              </p>
            </div>

            {loading ? (
              <LoadingSpinner message="Loading your profile details..." />
            ) : (
              <>
                {/* Profile Stats Summary */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                  <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{profileData?.notesCount || 0}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Notes Uploaded</div>
                    </div>
                  </div>

                  <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Download size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{profileData?.downloadsCount || 0}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Peers Downloaded</div>
                    </div>
                  </div>

                  <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fdf4ff', color: '#c026d3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <GraduationCap size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{profileData?.role}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Account Role</div>
                    </div>
                  </div>
                </div>

                {/* Edit Form */}
                <div className="card" style={{ padding: '2rem' }}>
                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="name">Full Name</label>
                      <input
                        id="name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="form-control"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Email Address (Read-only)</label>
                      <input
                        type="email"
                        value={profileData?.email || ''}
                        disabled
                        className="form-control"
                        style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed' }}
                      />
                      <small style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                        Your email address is bound to your university account credentials.
                      </small>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="department">Academic Department</label>
                      <select
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="form-select"
                      >
                        <option value="Computer Science">Computer Science & Engineering</option>
                        <option value="Information Technology">Information Technology</option>
                        <option value="Electronics & Comm">Electronics & Communication</option>
                        <option value="Electrical Engineering">Electrical Engineering</option>
                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                        <option value="Civil Engineering">Civil Engineering</option>
                        <option value="First Year Common">First Year Common</option>
                      </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label" htmlFor="year">Year of Study</label>
                        <select
                          id="year"
                          name="year"
                          value={formData.year}
                          onChange={handleChange}
                          className="form-select"
                        >
                          <option value={1}>1st Year</option>
                          <option value={2}>2nd Year</option>
                          <option value={3}>3rd Year</option>
                          <option value={4}>4th Year</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="semester">Semester</label>
                        <select
                          id="semester"
                          name="semester"
                          value={formData.semester}
                          onChange={handleChange}
                          className="form-select"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                            <option key={s} value={s}>Semester {s}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                      <button type="submit" disabled={saving} className="btn btn-primary">
                        <Save size={16} /> {saving ? 'Saving Changes...' : 'Save Profile Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
