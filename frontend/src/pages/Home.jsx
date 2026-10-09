import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { NoteCard } from '../components/NoteCard';
import { noteService } from '../services/noteService';
import {
  Share2,
  Sparkles,
  Search,
  GraduationCap,
  Upload,
  Cpu,
  FileCheck2,
  BookMarked,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export const Home = () => {
  const [featuredNotes, setFeaturedNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    noteService.getNotes({ size: 3, sortBy: 'viewCount', direction: 'desc' })
      .then((res) => {
        if (res.data?.content) {
          setFeaturedNotes(res.data.content);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="app-container">
      <Navbar />

      {/* Hero Section */}
      <section className="hero-section">
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#eef2ff',
            border: '1px solid #c7d2fe',
            color: '#4f46e5',
            padding: '0.4rem 1rem',
            borderRadius: '9999px',
            fontSize: '0.875rem',
            fontWeight: 600,
            marginBottom: '1.5rem'
          }}>
            <Sparkles size={16} /> Powered by Google Gemini AI
          </div>

          <h1 className="hero-title">
            Share. Learn. <span className="hero-gradient-text">Summarize.</span>
          </h1>

          <p className="hero-subtitle">
            A smart platform where college students can upload, discover and summarize academic notes using AI. Turn 50-page PDFs into instant exam revision guides in seconds.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/notes" className="btn btn-primary btn-lg">
              Browse Notes <ArrowRight size={18} />
            </Link>
            <Link to="/upload" className="btn btn-secondary btn-lg">
              Upload Notes
            </Link>
            <Link to="/register" className="btn btn-secondary btn-lg" style={{ backgroundColor: '#f8fafc' }}>
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '4rem 1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>Core Capabilities for High Achievers</h2>
          <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
            Everything you need to study faster, excel in university exams, and collaborate with peers.
          </p>
        </div>

        <div className="grid-cols-4">
          <div className="card">
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#eef2ff',
              color: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}>
              <Share2 size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Note Sharing</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Upload and access high-quality semester syllabus notes, lecture slides, and handwritten summaries categorized by department and unit.
            </p>
          </div>

          <div className="card">
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#fdf4ff',
              color: '#c026d3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}>
              <Sparkles size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>AI Summarization</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Extract key takeaways, core topics, and essential terminology automatically from lengthy PDF lecture notes using Google Gemini.
            </p>
          </div>

          <div className="card">
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#ecfeff',
              color: '#0891b2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}>
              <Search size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Smart Search</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Pinpoint exact study material across subjects, units, academic years, and custom tags with instantaneous multi-faceted filtering.
            </p>
          </div>

          <div className="card">
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}>
              <GraduationCap size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Exam Preparation</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Practice with AI-generated 1-mark, 3-mark, and 6-mark exam questions modeled after real university semester test patterns.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>How Smart College Notes Works</h2>
          <p style={{ color: '#64748b', fontSize: '1.05rem', marginBottom: '3.5rem' }}>
            A streamlined 4-step workflow designed for academic productivity.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem', position: 'relative' }}>
            <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#4f46e5', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontWeight: 700 }}>
                1
              </div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Upload Note</h4>
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                Upload your syllabus PDF notes with subject, semester, and unit details.
              </p>
            </div>

            <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#0891b2', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontWeight: 700 }}>
                2
              </div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>AI Processing</h4>
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                Apache PDFBox parses the text and backend streams it to Google Gemini.
              </p>
            </div>

            <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#8b5cf6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontWeight: 700 }}>
                3
              </div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Instant Summary</h4>
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                Receive structured key points, important topics, and mark-wise exam questions.
              </p>
            </div>

            <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontWeight: 700 }}>
                4
              </div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Learn & Ace</h4>
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                Revise key formulas, ask the AI Study Assistant questions, and download notes anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Notes Section */}
      {featuredNotes.length > 0 && (
        <section style={{ padding: '5rem 1.5rem', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
            <div>
              <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Popular Academic Notes</h2>
              <p style={{ color: '#64748b' }}>Top-rated resources trending among college students.</p>
            </div>
            <Link to="/notes" className="btn btn-secondary">
              View All Notes <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid-cols-3">
            {featuredNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        color: 'white',
        padding: '5rem 1.5rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <h2 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '1rem' }}>
            Ready to revolutionize your college revision?
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: '1.6' }}>
            Join your fellow students in uploading, sharing, and digesting college courses with state-of-the-art AI assistance.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg" style={{ background: '#4f46e5' }}>
              Create Student Account
            </Link>
            <Link to="/notes" className="btn btn-secondary btn-lg" style={{ background: 'transparent', color: 'white', borderColor: '#6366f1' }}>
              Explore Library
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
