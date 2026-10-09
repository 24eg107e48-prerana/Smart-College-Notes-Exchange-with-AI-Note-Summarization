import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { NoteCard } from '../components/NoteCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { noteService } from '../services/noteService';
import { Bookmark, BookOpen } from 'lucide-react';

export const SavedNotes = () => {
  const [savedNotes, setSavedNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    try {
      const res = await noteService.getSavedNotes();
      if (res.data?.content) {
        setSavedNotes(res.data.content);
      }
    } catch (err) {
      console.error('Failed to load saved notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleBookmarkToggle = (noteId, isBookmarked) => {
    if (!isBookmarked) {
      setSavedNotes((prev) => prev.filter((n) => n.id !== noteId));
    }
  };

  return (
    <div className="app-container">
      <Navbar />

      <div className="dashboard-layout">
        <Sidebar type="student" />

        <main className="dashboard-main">
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
              <Bookmark size={26} color="#4f46e5" fill="#4f46e5" /> Saved & Bookmarked Notes
            </h1>
            <p style={{ color: '#64748b' }}>
              Your personal library of bookmarked revision notes for quick exam reference.
            </p>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading your bookmarks..." />
          ) : savedNotes.length === 0 ? (
            <EmptyState
              icon={Bookmark}
              title="No saved notes yet"
              description="Click the bookmark icon on any note in the library to save it here for offline revision."
              action={
                <Link to="/notes" className="btn btn-primary btn-sm">
                  Browse Notes Library
                </Link>
              }
            />
          ) : (
            <div className="grid-cols-3">
              {savedNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onBookmarkToggle={handleBookmarkToggle}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
