import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { noteService } from '../services/noteService';
import { aiService } from '../services/aiService';
import { useToast } from '../hooks/useToast';
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  Layers,
  HelpCircle,
  RotateCw,
  Tag,
  ArrowRight
} from 'lucide-react';

export const AiSummarizer = () => {
  const [searchParams] = useSearchParams();
  const preselectedNoteId = searchParams.get('noteId');

  const { success, error: toastError, info } = useToast();

  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(preselectedNoteId || '');
  const [summaryData, setSummaryData] = useState(null);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [summarizing, setSummarizing] = useState(false);

  // Load user notes or approved notes for selection
  useEffect(() => {
    Promise.allSettled([
      noteService.getNotes({ size: 50 }),
      noteService.getMyNotes({ size: 50 })
    ]).then(([publicRes, myRes]) => {
      const publicNotes = publicRes.status === 'fulfilled' ? (publicRes.value?.data?.content || []) : [];
      const myNotes = myRes.status === 'fulfilled' ? (myRes.value?.data?.content || []) : [];

      const map = new Map();
      [...myNotes, ...publicNotes].forEach((n) => map.set(n.id, n));
      const combined = Array.from(map.values());

      setNotes(combined);
      if (!selectedNoteId && combined.length > 0) {
        setSelectedNoteId(combined[0].id);
      }
    })
    .catch((err) => console.error(err))
    .finally(() => setLoadingNotes(false));
  }, []);

  // When note is selected or changed, check if summary already exists
  useEffect(() => {
    if (selectedNoteId) {
      aiService.getNoteSummary(selectedNoteId)
        .then((res) => {
          if (res.data) setSummaryData(res.data);
        })
        .catch(() => {
          // No summary exists yet
          setSummaryData(null);
        });
    }
  }, [selectedNoteId]);

  const handleGenerateSummary = async (force = false) => {
    if (!selectedNoteId) {
      toastError('Please select a note to summarize.');
      return;
    }

    setSummarizing(true);
    info('Gemini AI is parsing the PDF and generating exam questions...');

    try {
      const res = await aiService.summarizeNote(selectedNoteId, force);
      if (res.data) {
        setSummaryData(res.data);
        success('AI Summary and Exam Revision Guide generated!');
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to process AI summary.');
    } finally {
      setSummarizing(false);
    }
  };

  const currentNote = notes.find((n) => n.id.toString() === selectedNoteId?.toString());

  return (
    <div className="app-container">
      <Navbar />

      <div className="dashboard-layout">
        <Sidebar type="student" />

        <main className="dashboard-main">
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
              <Sparkles size={28} color="#6366f1" /> AI Note Summarizer & Exam Question Generator
            </h1>
            <p style={{ color: '#64748b' }}>
              Turn lengthy multi-chapter PDFs into structured key concepts and university test questions powered by Google Gemini.
            </p>
          </div>

          {/* Note Selection & Trigger Card */}
          <div className="card" style={{ marginBottom: '2rem', padding: '1.75rem' }}>
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '300px' }}>
                <label className="form-label" htmlFor="note-selector">
                  Select College Note from Library
                </label>
                <select
                  id="note-selector"
                  value={selectedNoteId}
                  onChange={(e) => setSelectedNoteId(e.target.value)}
                  className="form-select"
                  disabled={loadingNotes || summarizing}
                >
                  {notes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.title} ({n.subject} - Sem {n.semester})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => handleGenerateSummary(false)}
                  disabled={summarizing || !selectedNoteId}
                  className="btn btn-primary"
                >
                  <Sparkles size={16} />
                  {summarizing ? 'Analyzing with Gemini...' : summaryData ? 'View Summary' : 'Generate AI Summary'}
                </button>

                {summaryData && (
                  <button
                    onClick={() => handleGenerateSummary(true)}
                    disabled={summarizing}
                    className="btn btn-secondary"
                    title="Force regenerate fresh summary from Gemini AI"
                  >
                    <RotateCw size={16} /> Regenerate
                  </button>
                )}
              </div>
            </div>

            {currentNote && (
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', fontSize: '0.85rem', color: '#64748b', flexWrap: 'wrap' }}>
                <span>Subject: <strong>{currentNote.subject}</strong></span>
                <span>•</span>
                <span>Department: <strong>{currentNote.department}</strong></span>
                <span>•</span>
                <span>Unit: <strong>{currentNote.unit || 'General'}</strong></span>
                <span>•</span>
                <Link to={`/notes/${currentNote.id}`} style={{ fontWeight: 600 }}>
                  View Full Note Details <ArrowRight size={12} style={{ display: 'inline' }} />
                </Link>
              </div>
            )}
          </div>

          {/* Results Section */}
          {summarizing ? (
            <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
              <LoadingSpinner message="Gemini AI is reading and distilling key points from the uploaded PDF document..." size="lg" />
            </div>
          ) : summaryData ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              {/* SUMMARY CARD */}
              <div className="card" style={{ borderLeft: '4px solid #4f46e5' }}>
                <h3 style={{ fontSize: '1.25rem', color: '#4f46e5', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  SUMMARY
                </h3>
                <p style={{ color: '#334155', lineHeight: '1.7', fontSize: '0.95rem', whiteSpace: 'pre-line' }}>
                  {summaryData.summary}
                </p>
              </div>

              {/* KEY POINTS & IMPORTANT TOPICS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
                <div className="card">
                  <h3 style={{ fontSize: '1.15rem', color: '#0891b2', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={18} /> KEY POINTS
                  </h3>
                  <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', color: '#334155', fontSize: '0.9rem' }}>
                    {summaryData.keyPoints?.map((pt, idx) => (
                      <li key={idx}>{pt}</li>
                    ))}
                  </ul>
                </div>

                <div className="card">
                  <h3 style={{ fontSize: '1.15rem', color: '#8b5cf6', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Layers size={18} /> IMPORTANT TOPICS
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1.5rem' }}>
                    {summaryData.importantTopics?.map((top, idx) => (
                      <span key={idx} className="badge badge-info" style={{ fontSize: '0.85rem', padding: '0.4rem 0.75rem' }}>
                        {top}
                      </span>
                    ))}
                  </div>

                  <h3 style={{ fontSize: '1.15rem', color: '#059669', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Tag size={16} /> KEYWORDS
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {summaryData.keywords?.map((kw, idx) => (
                      <span key={idx} className="meta-chip">#{kw}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* EXAM QUESTIONS CARDS */}
              <div className="card">
                <h3 style={{ fontSize: '1.35rem', marginBottom: '1.5rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <HelpCircle size={22} color="#f59e0b" /> AI-Generated Examination Question Bank
                </h3>

                {/* 1-Mark Questions */}
                <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', borderLeft: '4px solid #6366f1' }}>
                  <h4 style={{ color: '#4338ca', fontSize: '1rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    1-MARK QUESTIONS (Short Definitions & Core Formulae)
                  </h4>
                  <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', color: '#334155', fontSize: '0.9rem' }}>
                    {summaryData.oneMarkQuestions?.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>

                {/* 3-Mark Questions */}
                <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', borderLeft: '4px solid #f59e0b' }}>
                  <h4 style={{ color: '#b45309', fontSize: '1rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    3-MARK QUESTIONS (Mechanisms, Differences & Short Derivations)
                  </h4>
                  <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', color: '#334155', fontSize: '0.9rem' }}>
                    {summaryData.threeMarkQuestions?.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>

                {/* 6-Mark Questions */}
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', borderLeft: '4px solid #ef4444' }}>
                  <h4 style={{ color: '#b91c1c', fontSize: '1rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    6-MARK QUESTIONS (Comprehensive Essay, Architecture & Case Studies)
                  </h4>
                  <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', color: '#334155', fontSize: '0.9rem' }}>
                    {summaryData.sixMarkQuestions?.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '4rem 1.5rem',
              backgroundColor: 'white',
              borderRadius: '16px',
              border: '1px dashed #cbd5e1'
            }}>
              <Sparkles size={40} color="#6366f1" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Select a Note and Generate Summary</h3>
              <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
                Pick an uploaded lecture PDF from the selector above to distill syllabus key points and 1, 3, and 6-mark questions.
              </p>
              <button
                onClick={() => handleGenerateSummary(false)}
                disabled={!selectedNoteId}
                className="btn btn-primary"
              >
                <Sparkles size={16} /> Generate AI Summary Now
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
