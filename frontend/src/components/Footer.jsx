import React from 'react';
import { BookOpen, Sparkles, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer style={{
      backgroundColor: '#ffffff',
      borderTop: '1px solid #e2e8f0',
      padding: '3rem 1.5rem 2rem',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: '2rem'
      }}>
        <div style={{ maxWidth: '360px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', fontWeight: 800, fontSize: '1.25rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #6366f1, #4338ca)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BookOpen size={18} />
            </div>
            <span>Smart College Notes</span>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.6' }}>
            An intelligent academic repository where college students exchange curated syllabus notes, extract key concepts, and generate instant exam preparation summaries powered by Google Gemini AI.
          </p>
        </div>

        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>Quick Navigation</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
            <li><a href="/notes">Notes Library</a></li>
            <li><a href="/upload">Upload Academic Notes</a></li>
            <li><a href="/ai-summarizer">AI Note Summarizer</a></li>
            <li><a href="/ai-assistant">AI Study Assistant</a></li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>Academic Disciplines</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem', color: '#64748b' }}>
            <li>Computer Science & Engineering</li>
            <li>Electronics & Communication</li>
            <li>Mechanical & Civil Engineering</li>
            <li>First Year Engineering Sciences</li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>Technology Highlights</h4>
          <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: '1.6', maxWidth: '240px' }}>
            Built with Spring Boot 3, Hibernate JPA, MySQL, Apache PDFBox, and Google Gemini Generative AI.
          </p>
        </div>
      </div>

      <div style={{
        maxWidth: '1280px',
        margin: '2rem auto 0',
        paddingTop: '1.5rem',
        borderTop: '1px solid #f1f5f9',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        fontSize: '0.85rem',
        color: '#94a3b8'
      }}>
        <span>&copy; {new Date().getFullYear()} Smart College Notes Exchange. All rights reserved.</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          Crafted with <Heart size={14} color="#ef4444" fill="#ef4444" /> for university scholars.
        </span>
      </div>
    </footer>
  );
};
