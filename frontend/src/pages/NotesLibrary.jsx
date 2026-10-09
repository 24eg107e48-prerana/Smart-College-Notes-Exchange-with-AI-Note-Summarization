import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { NoteCard } from '../components/NoteCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { noteService } from '../services/noteService';
import { subjectService } from '../services/subjectService';
import { Search, Filter, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

export const NotesLibrary = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);

  // Search & Filter State
  const [keyword, setKeyword] = useState('');
  const [department, setDepartment] = useState('All');
  const [subject, setSubject] = useState('All');
  const [year, setYear] = useState('All');
  const [semester, setSemester] = useState('All');
  const [unit, setUnit] = useState('All');
  const [sortBy, setSortBy] = useState('createdAt');
  const [direction, setDirection] = useState('desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Load available subjects
  useEffect(() => {
    subjectService.getAllSubjects().then((res) => {
      if (res.data) setSubjects(res.data);
    }).catch(() => {});
  }, []);

  const fetchNotes = async (page = 0) => {
    setLoading(true);
    try {
      const params = {
        page,
        size: 9,
        sortBy,
        direction,
      };

      if (keyword.trim()) params.keyword = keyword.trim();
      if (department !== 'All') params.department = department;
      if (subject !== 'All') params.subject = subject;
      if (year !== 'All') params.year = parseInt(year, 10);
      if (semester !== 'All') params.semester = parseInt(semester, 10);
      if (unit !== 'All') params.unit = unit;

      const res = await noteService.searchNotes(params);
      if (res.data) {
        setNotes(res.data.content || []);
        setCurrentPage(res.data.page);
        setTotalPages(res.data.totalPages);
        setTotalElements(res.data.totalElements);
      }
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes(0);
  }, [department, subject, year, semester, unit, sortBy, direction]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchNotes(0);
  };

  const handleResetFilters = () => {
    setKeyword('');
    setDepartment('All');
    setSubject('All');
    setYear('All');
    setSemester('All');
    setUnit('All');
    setSortBy('createdAt');
    setDirection('desc');
  };

  const handleSortChange = (e) => {
    const val = e.target.value;
    if (val === 'latest') {
      setSortBy('createdAt');
      setDirection('desc');
    } else if (val === 'downloads') {
      setSortBy('downloadCount');
      setDirection('desc');
    } else if (val === 'views') {
      setSortBy('viewCount');
      setDirection('desc');
    }
  };

  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content">
        <div className="page-wrapper">
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>College Notes Library</h1>
            <p style={{ color: '#64748b' }}>
              Explore and download verified academic course notes, unit modules, and study guides.
            </p>
          </div>

          {/* Search Bar & Sorting */}
          <div className="card" style={{ marginBottom: '2rem', padding: '1.25rem' }}>
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Search by note title, keywords, syllabus topic, or tags..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Search
              </button>

              <button type="button" onClick={handleResetFilters} className="btn btn-secondary" title="Reset all filters">
                <RotateCcw size={16} /> Reset
              </button>
            </form>

            {/* Filter Controls Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>Department</label>
                <select value={department} onChange={(e) => setDepartment(e.target.value)} className="form-select">
                  <option value="All">All Departments</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Tech</option>
                  <option value="Electronics & Comm">Electronics & Comm</option>
                  <option value="Mechanical Engineering">Mechanical</option>
                  <option value="Civil Engineering">Civil</option>
                  <option value="First Year Common">First Year Common</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>Subject</label>
                <select value={subject} onChange={(e) => setSubject(e.target.value)} className="form-select">
                  <option value="All">All Subjects</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.name}>{sub.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>Academic Year</label>
                <select value={year} onChange={(e) => setYear(e.target.value)} className="form-select">
                  <option value="All">All Years</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>Semester</label>
                <select value={semester} onChange={(e) => setSemester(e.target.value)} className="form-select">
                  <option value="All">All Semesters</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>Unit</label>
                <select value={unit} onChange={(e) => setUnit(e.target.value)} className="form-select">
                  <option value="All">All Units</option>
                  <option value="Unit 1">Unit 1</option>
                  <option value="Unit 2">Unit 2</option>
                  <option value="Unit 3">Unit 3</option>
                  <option value="Unit 4">Unit 4</option>
                  <option value="Unit 5">Unit 5</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>Sort By</label>
                <select onChange={handleSortChange} className="form-select">
                  <option value="latest">Latest First</option>
                  <option value="downloads">Most Downloaded</option>
                  <option value="views">Most Viewed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', color: '#64748b', fontSize: '0.9rem' }}>
            <span>Found <strong>{totalElements}</strong> approved academic notes</span>
          </div>

          {/* Notes Grid */}
          {loading ? (
            <LoadingSpinner message="Searching verified notes..." />
          ) : notes.length === 0 ? (
            <EmptyState
              title="No notes match your filter"
              description="Try clearing your search query or choosing 'All' across filters to see available material."
              action={
                <button onClick={handleResetFilters} className="btn btn-secondary btn-sm">
                  Clear Filters
                </button>
              }
            />
          ) : (
            <div className="grid-cols-3">
              {notes.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginTop: '3rem' }}>
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
      </main>

      <Footer />
    </div>
  );
};
