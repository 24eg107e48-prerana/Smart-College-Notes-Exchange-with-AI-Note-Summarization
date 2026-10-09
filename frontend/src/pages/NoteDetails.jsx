import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { RatingStars } from '../components/RatingStars';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { noteService } from '../services/noteService';
import { aiService } from '../services/aiService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { formatDate, formatFileSize } from '../utils/formatters';
import {
  Download,
  Bookmark,
  Sparkles,
  User,
  Calendar,
  Layers,
  BookOpen,
  MessageSquare,
  Send,
  HelpCircle,
  FileCheck,
  CheckCircle2,
  Tag,
  ArrowLeft,
  Bot
} from 'lucide-react';

export const NoteDetails = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { success, error: toastError, info } = useToast();
  const navigate = useNavigate();

  const [noteData, setNoteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [summarizing, setSummarizing] = useState(false);

  // Review Form State
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchNoteDetails = async () => {
    try {
      const res = await noteService.getNoteById(id);
      if (res.data) {
        setNoteData(res.data);
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to load note details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNoteDetails();
  }, [id]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await noteService.downloadNote(noteData.note.id, noteData.note.fileName);
      success('PDF download started');
      setNoteData((prev) => ({
        ...prev,
        note: { ...prev.note, downloadCount: prev.note.downloadCount + 1 }
      }));
    } catch (err) {
      toastError('Download failed');
    } finally {
      setDownloading(false);
    }
  };

  const handleBookmarkToggle = async () => {
    if (!isAuthenticated) {
      toastError('Please login to bookmark notes.');
      navigate('/login');
      return;
    }
    try {
      const isBookmarked = noteData.note.isBookmarked;
      if (isBookmarked) {
        await noteService.removeBookmark(noteData.note.id);
        success('Removed from bookmarks');
      } else {
        await noteService.bookmarkNote(noteData.note.id);
        success('Saved to bookmarks');
      }
      setNoteData((prev) => ({
        ...prev,
        note: { ...prev.note, isBookmarked: !isBookmarked }
      }));
    } catch (err) {
      toastError('Bookmark update failed');
    }
  };

  const handleGenerateSummary = async (force = false) => {
    if (!isAuthenticated) {
      toastError('Please login to generate AI summaries.');
      navigate('/login');
      return;
    }
    setSummarizing(true);
    info('Analyzing PDF with Gemini AI... Please hold on!');
    try {
      const res = await aiService.summarizeNote(noteData.note.id, force);
      if (res.data) {
        setNoteData((prev) => ({
          ...prev,
          aiSummary: res.data,
          note: { ...prev.note, hasAiSummary: true }
        }));
        success('AI Summary generated successfully!');
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to generate AI summary.');
    } finally {
      setSummarizing(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toastError('Please login to submit a review.');
      navigate('/login');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await noteService.reviewNote(noteData.note.id, {
        rating: userRating,
        comment: userComment.trim(),
      });
      success('Thank you for rating this note!');
      setUserComment('');
      fetchNoteDetails();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <Navbar />
        <LoadingSpinner message="Loading note details..." />
        <Footer />
      </div>
    );
  }

  if (!noteData?.note) {
    return (
      <div className="app-container">
        <Navbar />
        <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
          <h2>Note Not Found</h2>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>This note may have been removed or is pending approval.</p>
          <Link to="/notes" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Back to Notes</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const { note, aiSummary, reviews, userReviewed } = noteData;

  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content">
        <div className="page-wrapper">
          {/* Breadcrumb / Back button */}
          <div style={{ marginBottom: '1.5rem' }}>
            <Link to="/notes" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: '#64748b' }}>
              <ArrowLeft size={16} /> Back to Library
            </Link>
          </div>

          {/* Note Overview Card */}
          <div className="card" style={{ marginBottom: '2.5rem', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div style={{ flex: 1, minWidth: '300px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  <span className="badge badge-info">{note.subject}</span>
                  <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>{note.department}</span>
                  <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>Year {note.year}</span>
                  <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>Semester {note.semester}</span>
                  {note.unit && <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>Unit {note.unit}</span>}
                </div>

                <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#0f172a' }}>{note.title}</h1>

                {note.description && (
                  <p style={{ color: '#475569', fontSize: '1rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                    {note.description}
                  </p>
                )}

                {/* Metadata Row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.875rem', color: '#64748b' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={16} color="#4f46e5" />
                    <span>Uploaded by <strong>{note.uploadedByName}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={16} />
                    <span>{formatDate(note.createdAt)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Download size={16} />
                    <span>{note.downloadCount} downloads</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <RatingStars rating={note.averageRating || 0} size={16} />
                    <span style={{ fontWeight: 600, color: '#334155' }}>
                      {note.averageRating > 0 ? note.averageRating.toFixed(1) : 'No reviews'}
                    </span>
                    <span>({note.reviewCount || 0})</span>
                  </div>
                </div>

                {note.tags && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                    <Tag size={14} color="#94a3b8" />
                    {note.tags.split(',').map((t, idx) => (
                      <span key={idx} className="meta-chip">#{t.trim()}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '220px' }}>
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%' }}
                >
                  <Download size={18} /> {downloading ? 'Downloading...' : 'Download PDF'}
                </button>

                <button
                  onClick={handleBookmarkToggle}
                  className="btn btn-secondary"
                  style={{ width: '100%' }}
                >
                  <Bookmark size={18} fill={note.isBookmarked ? '#4f46e5' : 'transparent'} color={note.isBookmarked ? '#4f46e5' : '#64748b'} />
                  {note.isBookmarked ? 'Bookmarked' : 'Save Note'}
                </button>

                <button
                  onClick={() => handleGenerateSummary(true)}
                  disabled={summarizing}
                  className="btn btn-secondary"
                  style={{ width: '100%', borderColor: '#c7d2fe', color: '#4f46e5' }}
                >
                  <Sparkles size={18} /> {summarizing ? 'Processing AI...' : aiSummary ? 'Regenerate Summary' : 'Generate AI Summary'}
                </button>

                <Link
                  to={`/ai-assistant?noteId=${note.id}`}
                  className="btn btn-secondary"
                  style={{ width: '100%', borderColor: '#a5f3fc', color: '#0891b2' }}
                >
                  <Bot size={18} /> Ask AI Assistant
                </Link>
              </div>
            </div>
          </div>

          {/* AI SUMMARY SECTION */}
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={24} color="#6366f1" /> AI Exam Revision Guide
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                  Automated syllabus analysis, key concepts, and exam questions synthesized by Gemini AI
                </p>
              </div>

              {!aiSummary && (
                <button
                  onClick={() => handleGenerateSummary(false)}
                  disabled={summarizing}
                  className="btn btn-primary"
                >
                  <Sparkles size={16} /> {summarizing ? 'Analyzing with Gemini...' : 'Generate AI Summary'}
                </button>
              )}
            </div>

            {aiSummary ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Executive Summary Card */}
                <div className="card" style={{ borderLeft: '4px solid #4f46e5' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: '#4f46e5' }}>
                    Executive Summary
                  </h3>
                  <p style={{ color: '#334155', lineHeight: '1.7', fontSize: '0.95rem', whiteSpace: 'pre-line' }}>
                    {aiSummary.summary}
                  </p>
                </div>

                {/* Key Points & Topics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                  <div className="card">
                    <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', color: '#0891b2', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={18} /> Core Key Points
                    </h3>
                    <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', color: '#334155', fontSize: '0.9rem' }}>
                      {aiSummary.keyPoints.map((pt, idx) => (
                        <li key={idx}>{pt}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="card">
                    <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Layers size={18} /> High-Yield Topics & Terminology
                    </h3>
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>IMPORTANT TOPICS</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {aiSummary.importantTopics.map((top, idx) => (
                          <span key={idx} className="badge badge-info">{top}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>ESSENTIAL KEYWORDS</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {aiSummary.keywords.map((kw, idx) => (
                          <span key={idx} className="meta-chip">#{kw}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Exam Questions Cards */}
                <div className="card">
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HelpCircle size={20} color="#f59e0b" /> University Exam Question Bank
                  </h3>

                  {/* 1-Mark Questions */}
                  <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '12px' }}>
                    <span className="badge" style={{ backgroundColor: '#e0e7ff', color: '#4338ca', marginBottom: '0.75rem' }}>
                      1-Mark Questions (Short Definitions & Concepts)
                    </span>
                    <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#334155', fontSize: '0.9rem' }}>
                      {aiSummary.oneMarkQuestions.map((q, idx) => (
                        <li key={idx}>{q}</li>
                      ))}
                    </ul>
                  </div>

                  {/* 3-Mark Questions */}
                  <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '12px' }}>
                    <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#b45309', marginBottom: '0.75rem' }}>
                      3-Mark Questions (Explain Mechanism & Compare)
                    </span>
                    <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#334155', fontSize: '0.9rem' }}>
                      {aiSummary.threeMarkQuestions.map((q, idx) => (
                        <li key={idx}>{q}</li>
                      ))}
                    </ul>
                  </div>

                  {/* 6-Mark Questions */}
                  <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px' }}>
                    <span className="badge" style={{ backgroundColor: '#fee2e2', color: '#b91c1c', marginBottom: '0.75rem' }}>
                      6-Mark Questions (In-Depth Essay, Derivation & Case Analysis)
                    </span>
                    <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#334155', fontSize: '0.9rem' }}>
                      {aiSummary.sixMarkQuestions.map((q, idx) => (
                        <li key={idx}>{q}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '3rem 1.5rem',
                backgroundColor: '#ffffff',
                border: '1px dashed #cbd5e1',
                borderRadius: '16px'
              }}>
                <Sparkles size={36} color="#6366f1" style={{ margin: '0 auto 1rem' }} />
                <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No AI Summary Available Yet</h4>
                <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
                  Click the button below to have Google Gemini extract the key points, topics, and potential exam questions from this document.
                </p>
                <button
                  onClick={() => handleGenerateSummary(false)}
                  disabled={summarizing}
                  className="btn btn-primary"
                >
                  <Sparkles size={16} /> {summarizing ? 'Processing PDF with Gemini...' : 'Generate AI Summary'}
                </button>
              </div>
            )}
          </div>

          {/* RATINGS & REVIEWS SECTION */}
          <div className="card">
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={22} color="#4f46e5" /> Student Reviews ({reviews?.length || 0})
            </h2>

            {/* Review Submission Form */}
            {isAuthenticated ? (
              <form onSubmit={handleReviewSubmit} style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
                <h4 style={{ fontSize: '1.05rem', marginBottom: '0.75rem' }}>
                  {userReviewed ? 'Update Your Review' : 'Leave a Rating & Review'}
                </h4>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Your Rating:</span>
                  <RatingStars rating={userRating} onRate={(r) => setUserRating(r)} size={22} />
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>({userRating} out of 5 stars)</span>
                </div>

                <div className="form-group">
                  <textarea
                    rows={3}
                    placeholder="Share how helpful this note was for your coursework or revision..."
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    className="form-control"
                    required
                  />
                </div>

                <button type="submit" disabled={submittingReview} className="btn btn-primary btn-sm">
                  <Send size={14} /> {submittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </form>
            ) : (
              <div style={{ padding: '1rem 1.5rem', background: '#f1f5f9', borderRadius: '8px', marginBottom: '2rem', fontSize: '0.9rem', color: '#475569' }}>
                <Link to="/login" style={{ fontWeight: 600, color: '#4f46e5' }}>Sign in</Link> to rate and write a review for this note.
              </div>
            )}

            {/* Reviews List */}
            {reviews?.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic' }}>
                No reviews yet. Be the first to review this note!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {reviews.map((rev) => (
                  <div key={rev.id} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{rev.userName}</span>
                        <RatingStars rating={rev.rating} size={14} />
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{formatDate(rev.createdAt)}</span>
                    </div>
                    {rev.comment && (
                      <p style={{ color: '#475569', fontSize: '0.9rem', marginTop: '4px', lineHeight: '1.5' }}>
                        {rev.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
