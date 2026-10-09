import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { noteService } from '../services/noteService';
import { subjectService } from '../services/subjectService';
import { useToast } from '../hooks/useToast';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  X
} from 'lucide-react';

export const UploadNotes = () => {
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    department: 'Computer Science',
    year: 3,
    semester: 5,
    unit: 'Unit 1',
    description: '',
    tags: '',
  });

  const [file, setFile] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('idle'); // 'idle' | 'uploading' | 'success' | 'failed'
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch subjects
  useEffect(() => {
    subjectService.getAllSubjects().then((res) => {
      if (res.data && res.data.length > 0) {
        setSubjects(res.data);
        setFormData((prev) => ({ ...prev, subject: res.data[0].name }));
      }
    }).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      toastError('Only PDF files are supported. Please select a .pdf file.');
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      toastError('File size exceeds the 50MB maximum limit.');
      return;
    }

    setFile(selectedFile);
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toastError('Please enter a note title.');
      return;
    }

    if (!formData.subject) {
      toastError('Please select or specify a subject.');
      return;
    }

    if (!file) {
      toastError('Please choose a PDF file to upload.');
      return;
    }

    setUploadStatus('uploading');
    setErrorMessage('');

    try {
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('subject', formData.subject.trim());
      data.append('department', formData.department);
      data.append('year', formData.year);
      data.append('semester', formData.semester);
      if (formData.unit) data.append('unit', formData.unit);
      if (formData.description) data.append('description', formData.description.trim());
      if (formData.tags) data.append('tags', formData.tags.trim());
      data.append('file', file);

      await noteService.uploadNote(data);
      setUploadStatus('success');
      success('Note uploaded successfully! Submitted for admin approval.');

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (err) {
      const msg = err.response?.data?.message || 'Upload failed. Please check the PDF file and try again.';
      setUploadStatus('failed');
      setErrorMessage(msg);
      toastError(msg);
    }
  };

  return (
    <div className="app-container">
      <Navbar />

      <div className="dashboard-layout">
        <Sidebar type="student" />

        <main className="dashboard-main">
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Upload Course Notes</h1>
              <p style={{ color: '#64748b' }}>
                Upload high-quality syllabus notes and academic slides for peers and AI analysis.
              </p>
            </div>

            {uploadStatus === 'success' && (
              <div style={{
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                padding: '1.5rem',
                borderRadius: '12px',
                color: '#065f46',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                <CheckCircle2 size={28} />
                <div>
                  <h4 style={{ fontWeight: 700, margin: 0 }}>Upload successful!</h4>
                  <p style={{ fontSize: '0.9rem', margin: '4px 0 0' }}>
                    Your note has been securely stored and submitted to administrators for verification. Redirecting...
                  </p>
                </div>
              </div>
            )}

            {uploadStatus === 'failed' && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                padding: '1.5rem',
                borderRadius: '12px',
                color: '#991b1b',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                <AlertCircle size={28} />
                <div>
                  <h4 style={{ fontWeight: 700, margin: 0 }}>Upload failed</h4>
                  <p style={{ fontSize: '0.9rem', margin: '4px 0 0' }}>{errorMessage}</p>
                </div>
              </div>
            )}

            <div className="card" style={{ padding: '2rem' }}>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="title">Note Title *</label>
                  <input
                    id="title"
                    type="text"
                    name="title"
                    placeholder="e.g. Relational Calculus & Normalization (1NF to BCNF)"
                    value={formData.title}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="department">Department *</label>
                    <select
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="Computer Science">Computer Science</option>
                      <option value="Information Technology">Information Tech</option>
                      <option value="Electronics & Comm">Electronics & Comm</option>
                      <option value="Mechanical Engineering">Mechanical</option>
                      <option value="Civil Engineering">Civil</option>
                      <option value="First Year Common">First Year Common</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="subject">Subject *</label>
                    <input
                      id="subject"
                      type="text"
                      name="subject"
                      list="subject-list"
                      placeholder="e.g. Database Management Systems"
                      value={formData.subject}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                    <datalist id="subject-list">
                      {subjects.map((s) => (
                        <option key={s.id} value={s.name} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="year">Year *</label>
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
                    <label className="form-label" htmlFor="semester">Semester *</label>
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

                  <div className="form-group">
                    <label className="form-label" htmlFor="unit">Unit / Chapter</label>
                    <select
                      id="unit"
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="Unit 1">Unit 1</option>
                      <option value="Unit 2">Unit 2</option>
                      <option value="Unit 3">Unit 3</option>
                      <option value="Unit 4">Unit 4</option>
                      <option value="Unit 5">Unit 5</option>
                      <option value="Comprehensive">Full Syllabus</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="description">Description & Course Highlights</label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    placeholder="Briefly describe the key formulas, theorems, and topics covered in this PDF..."
                    value={formData.description}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="tags">Tags (comma separated)</label>
                  <input
                    id="tags"
                    type="text"
                    name="tags"
                    placeholder="e.g. bcnf, sql, transactions, exam-prep"
                    value={formData.tags}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                {/* PDF File Drag/Upload Area */}
                <div className="form-group">
                  <label className="form-label">Attach PDF File * (max 50MB)</label>
                  <div style={{
                    border: '2px dashed #cbd5e1',
                    borderRadius: '12px',
                    padding: '2rem',
                    textAlign: 'center',
                    backgroundColor: '#f8fafc',
                    cursor: 'pointer',
                    position: 'relative'
                  }}>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileChange}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        opacity: 0,
                        cursor: 'pointer',
                        width: '100%',
                        height: '100%'
                      }}
                    />

                    {file ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#4f46e5' }}>
                        <FileCheck size={28} />
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{file.name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <UploadCloud size={36} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
                        <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#334155' }}>
                          Click to browse or drop your PDF document here
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
                          Must be a valid .pdf file up to 50MB
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: '2rem' }}>
                  <button
                    type="submit"
                    disabled={uploadStatus === 'uploading'}
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%' }}
                  >
                    {uploadStatus === 'uploading' ? 'Uploading PDF Document...' : 'Upload Note'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
