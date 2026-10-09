import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RatingStars } from './RatingStars';
import { formatDate, formatFileSize, getStatusBadgeClass } from '../utils/formatters';
import { noteService } from '../services/noteService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import {
  Download,
  Bookmark,
  Eye,
  Sparkles,
  FileText,
  User,
  Calendar,
  Layers
} from 'lucide-react';

export const NoteCard = ({ note, onBookmarkToggle = null, showStatus = false }) => {
  const { isAuthenticated } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [bookmarked, setBookmarked] = useState(note?.isBookmarked || false);
  const [downloadCount, setDownloadCount] = useState(note?.downloadCount || 0);
  const [downloading, setDownloading] = useState(false);

  const handleBookmark = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      error('Please login to bookmark notes.');
      navigate('/login');
      return;
    }

    try {
      if (bookmarked) {
        await noteService.removeBookmark(note.id);
        setBookmarked(false);
        success('Removed from bookmarks');
      } else {
        await noteService.bookmarkNote(note.id);
        setBookmarked(true);
        success('Saved to bookmarks');
      }
      if (onBookmarkToggle) onBookmarkToggle(note.id, !bookmarked);
    } catch (err) {
      error(err.response?.data?.message || 'Bookmark action failed');
    }
  };

  const handleDownload = async (e) => {
    e.preventDefault();
    setDownloading(true);
    try {
      await noteService.downloadNote(note.id, note.fileName);
      setDownloadCount((prev) => prev + 1);
      success('Download started');
    } catch (err) {
      error('Failed to download PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="note-card">
      <div>
        <div className="note-card-header">
          <span className="badge badge-info" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <FileText size={12} /> {note.subject}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {showStatus && (
              <span className={getStatusBadgeClass(note.status)}>
                {note.status}
              </span>
            )}
            <button
              onClick={handleBookmark}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                color: bookmarked ? '#4f46e5' : '#94a3b8',
                display: 'flex',
                alignItems: 'center'
              }}
              title={bookmarked ? 'Remove bookmark' : 'Bookmark note'}
            >
              <Bookmark size={18} fill={bookmarked ? '#4f46e5' : 'transparent'} />
            </button>
          </div>
        </div>

        <Link to={`/notes/${note.id}`} style={{ textDecoration: 'none' }}>
          <h3 className="note-card-title">{note.title}</h3>
        </Link>

        {note.description && (
          <p style={{
            fontSize: '0.85rem',
            color: '#64748b',
            marginTop: '0.5rem',
            lineHeight: '1.5',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {note.description}
          </p>
        )}

        <div className="note-card-meta">
          <span className="meta-chip">{note.department}</span>
          <span className="meta-chip">Sem {note.semester}</span>
          {note.unit && <span className="meta-chip"><Layers size={10} style={{ display: 'inline', marginRight: '2px' }} /> Unit {note.unit}</span>}
          {note.fileSize && <span className="meta-chip">{formatFileSize(note.fileSize)}</span>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', marginTop: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <User size={13} /> {note.uploadedByName || 'Student'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={13} /> {formatDate(note.createdAt)}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RatingStars rating={note.averageRating || 0} size={14} />
            <span style={{ fontWeight: 600, color: '#334155' }}>{note.averageRating > 0 ? note.averageRating.toFixed(1) : 'New'}</span>
            <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>({note.reviewCount || 0})</span>
          </div>
          <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
            {downloadCount} {downloadCount === 1 ? 'download' : 'downloads'}
          </span>
        </div>
      </div>

      <div className="note-card-footer">
        <Link to={`/notes/${note.id}`} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
          <Eye size={14} /> View
        </Link>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="btn btn-secondary btn-sm"
          style={{ flex: 1 }}
          title="Download PDF"
        >
          <Download size={14} /> {downloading ? '...' : 'PDF'}
        </button>
        <Link
          to={`/ai-summarizer?noteId=${note.id}`}
          className="btn btn-primary btn-sm"
          style={{ flex: 1.2, padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
        >
          <Sparkles size={14} /> AI Summary
        </Link>
      </div>
    </div>
  );
};
