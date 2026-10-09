import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { noteService } from '../services/noteService';
import { aiService } from '../services/aiService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { formatFileSize } from '../utils/formatters';
import {
  Bot,
  Send,
  User,
  Sparkles,
  BookOpen,
  HelpCircle,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Trash2,
  Download,
  FileText,
  ExternalLink,
  ChevronRight,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';

export const AiStudyAssistant = () => {
  const [searchParams] = useSearchParams();
  const preselectedNoteId = searchParams.get('noteId');

  const { user } = useAuth();
  const { error: toastError, success: toastSuccess, info: toastInfo } = useToast();

  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(preselectedNoteId || '');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: "👋 Hello! I am your AI Study Assistant. I analyze your uploaded lecture notes and syllabus PDFs to break down complex concepts, formulas, and university exam questions.\n\nSelect a reference note and ask me anything!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [speakingId, setSpeakingId] = useState(null);

  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Load available notes (combines public approved and student's uploaded notes)
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
        setSelectedNoteId(combined[0].id.toString());
      }
    });
  }, []);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const selectedNote = notes.find((n) => n.id.toString() === selectedNoteId?.toString());

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputQuery).trim();
    if (!query) return;

    if (!selectedNoteId) {
      toastError('Please select a reference syllabus note.');
      return;
    }

    const userMsgId = 'msg-' + Date.now();
    const userMsg = {
      id: userMsgId,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await aiService.askStudyAssistant(selectedNoteId, query);
      const aiReply = res.data?.answer || "I reviewed your note context. Please make sure the Gemini API key is configured in your backend.";

      setMessages((prev) => [
        ...prev,
        {
          id: 'ai-' + Date.now(),
          sender: 'ai',
          text: aiReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      const msg = err.response?.data?.message || 'AI request timed out. Please try again.';
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          sender: 'ai',
          text: `⚠️ ${msg}`,
          isError: true,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickQuestion = (q) => {
    handleSendMessage(q);
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toastSuccess('Explanation copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSpeak = (text, id) => {
    if (!('speechSynthesis' in window)) {
      toastError('Text-to-speech is not supported by your browser.');
      return;
    }

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleClearChat = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setSpeakingId(null);
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'ai',
        text: `Conversation reset. Ready to study **${selectedNote ? selectedNote.title : 'your notes'}**! Ask a question or pick a quick topic below.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    toastInfo('Chat conversation cleared.');
  };

  const handleExportChat = () => {
    const formattedChat = messages
      .map((m) => `[${m.time}] ${m.sender === 'user' ? 'Student' : 'AI Study Assistant'}:\n${m.text}\n`)
      .join('\n----------------------------------------\n\n');

    const noteTitle = selectedNote ? selectedNote.title : 'General';
    const blob = new Blob([`Smart Notes AI - Study Session (${noteTitle})\nDate: ${new Date().toLocaleDateString()}\n\n` + formattedChat], {
      type: 'text/markdown;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Study-Chat-${noteTitle.replace(/[^a-zA-Z0-9]/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toastSuccess('Chat session exported as markdown file!');
  };

  // Helper to render text with basic markdown formatting
  const renderFormattedText = (text) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();

      // Heading 3
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={idx} style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0.75rem 0 0.4rem', color: '#1e293b' }}>
            {trimmed.replace('### ', '')}
          </h3>
        );
      }

      // Heading 2
      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={idx} style={{ fontSize: '1.25rem', fontWeight: 800, margin: '1rem 0 0.5rem', color: '#0f172a' }}>
            {trimmed.replace('## ', '')}
          </h2>
        );
      }

      // Horizontal rule
      if (trimmed === '---') {
        return <hr key={idx} style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '0.75rem 0' }} />;
      }

      // Bullet points
      if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const bulletText = trimmed.replace(/^[•\-*]\s+/, '');
        return (
          <div key={idx} style={{ display: 'flex', gap: '8px', margin: '0.25rem 0', alignItems: 'flex-start' }}>
            <span style={{ color: '#6366f1', fontWeight: 'bold' }}>•</span>
            <span>{formatBoldKeywords(bulletText)}</span>
          </div>
        );
      }

      // Numbered items
      if (/^\d+\.\s/.test(trimmed)) {
        return (
          <div key={idx} style={{ display: 'flex', gap: '8px', margin: '0.25rem 0', alignItems: 'flex-start' }}>
            <span style={{ color: '#06b6d4', fontWeight: 'bold' }}>{trimmed.split(' ')[0]}</span>
            <span>{formatBoldKeywords(trimmed.replace(/^\d+\.\s+/, ''))}</span>
          </div>
        );
      }

      // Normal lines
      if (trimmed === '') {
        return <div key={idx} style={{ height: '0.5rem' }} />;
      }

      return (
        <p key={idx} style={{ margin: '0.35rem 0', lineHeight: 1.6 }}>
          {formatBoldKeywords(line)}
        </p>
      );
    });
  };

  // Bold renderer for **keyword**
  const formatBoldKeywords = (str) => {
    const parts = str.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} style={{ color: '#1e1b4b', fontWeight: 650 }}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="app-container">
      <Navbar />

      <div className="dashboard-layout">
        <Sidebar type="student" />

        <main className="dashboard-main" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Top Header Card */}
          <div style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '1.25rem 1.75rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                  padding: '8px',
                  borderRadius: '12px',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(6, 182, 212, 0.25)'
                }}>
                  <Bot size={24} />
                </div>
                <div>
                  <h1 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                    AI Study Assistant
                  </h1>
                  <span style={{ fontSize: '0.8rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500, marginTop: '2px' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block', boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.2)' }} />
                    Active Tutor • Ready to analyze syllabus & exam questions
                  </span>
                </div>
              </div>
            </div>

            {/* Note Selector & Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ minWidth: '260px' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>
                  Reference Note:
                </label>
                <select
                  value={selectedNoteId}
                  onChange={(e) => setSelectedNoteId(e.target.value)}
                  className="form-select"
                  style={{ fontSize: '0.875rem', padding: '0.5rem 0.85rem', borderColor: '#cbd5e1', borderRadius: '10px' }}
                  disabled={notes.length === 0}
                >
                  {notes.length === 0 ? (
                    <option value="">No notes found (Upload note first)</option>
                  ) : (
                    notes.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.title} — {n.subject}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '6px', marginTop: '18px' }}>
                <button
                  onClick={handleClearChat}
                  className="btn btn-secondary btn-sm"
                  title="Clear conversation"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', borderRadius: '8px' }}
                >
                  <Trash2 size={14} /> Clear
                </button>
                <button
                  onClick={handleExportChat}
                  className="btn btn-secondary btn-sm"
                  title="Export study notes"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', borderRadius: '8px' }}
                >
                  <Download size={14} /> Export
                </button>
              </div>
            </div>
          </div>

          {/* Chat & Context Split View */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1rem', alignItems: 'start' }}>
            
            {/* Main Chat Area */}
            <div className="chat-container" style={{ height: '620px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              
              {/* Quick Prompts Bar */}
              <div style={{
                padding: '0.75rem 1.25rem',
                borderBottom: '1px solid #f1f5f9',
                backgroundColor: '#faf5ff',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                flexWrap: 'wrap'
              }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#7e22ce', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={13} color="#9333ea" /> Quick Study Prompts:
                </span>
                <button
                  onClick={() => handleQuickQuestion("What are the most important exam questions (1-mark, 3-mark, 6-mark) from this note?")}
                  className="btn btn-sm"
                  style={{ fontSize: '0.725rem', padding: '0.25rem 0.6rem', backgroundColor: 'white', border: '1px solid #e9d5ff', color: '#6b21a8', borderRadius: '20px' }}
                >
                  🎯 High-Yield Exam Questions
                </button>
                <button
                  onClick={() => handleQuickQuestion("Can you explain the main mechanism step-by-step with a practical example?")}
                  className="btn btn-sm"
                  style={{ fontSize: '0.725rem', padding: '0.25rem 0.6rem', backgroundColor: 'white', border: '1px solid #e9d5ff', color: '#6b21a8', borderRadius: '20px' }}
                >
                  ⚙️ Explain Main Mechanism
                </button>
                <button
                  onClick={() => handleQuickQuestion("What are key definitions, formulas, and parameters mentioned in this note?")}
                  className="btn btn-sm"
                  style={{ fontSize: '0.725rem', padding: '0.25rem 0.6rem', backgroundColor: 'white', border: '1px solid #e9d5ff', color: '#6b21a8', borderRadius: '20px' }}
                >
                  📐 Key Formulas & Terms
                </button>
                <button
                  onClick={() => handleQuickQuestion("What common conceptual traps and exam pitfalls do students face in this topic?")}
                  className="btn btn-sm"
                  style={{ fontSize: '0.725rem', padding: '0.25rem 0.6rem', backgroundColor: 'white', border: '1px solid #e9d5ff', color: '#6b21a8', borderRadius: '20px' }}
                >
                  ⚠️ Common Exam Mistakes
                </button>
              </div>

              {/* Message History */}
              <div className="chat-messages" style={{ padding: '1.25rem', backgroundColor: '#f8fafc' }}>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`chat-bubble ${msg.sender === 'user' ? 'chat-user' : 'chat-ai'}`}
                    style={{
                      backgroundColor: msg.isError ? '#fef2f2' : msg.sender === 'user' ? undefined : 'white',
                      color: msg.isError ? '#991b1b' : undefined,
                      border: msg.isError ? '1px solid #fecaca' : msg.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                      borderRadius: '14px',
                      maxWidth: '85%',
                      boxShadow: msg.sender === 'user' ? '0 4px 14px rgba(99, 102, 241, 0.25)' : '0 2px 6px rgba(0,0,0,0.03)'
                    }}
                  >
                    {/* Header with Avatar & Time */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.75rem', opacity: 0.85 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                        {msg.sender === 'user' ? (
                          <>
                            <div style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <User size={12} />
                            </div>
                            <span>{user?.name || 'You'}</span>
                          </>
                        ) : (
                          <>
                            <div style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}>
                              <Sparkles size={11} />
                            </div>
                            <span style={{ color: '#4f46e5' }}>Gemini Study Tutor</span>
                          </>
                        )}
                      </div>
                      <span style={{ fontSize: '0.7rem', color: msg.sender === 'user' ? 'rgba(255,255,255,0.8)' : '#94a3b8' }}>{msg.time}</span>
                    </div>

                    {/* Content */}
                    <div style={{ fontSize: '0.925rem', lineHeight: 1.65 }}>
                      {renderFormattedText(msg.text)}
                    </div>

                    {/* Action Footer for AI messages */}
                    {msg.sender === 'ai' && !msg.isError && (
                      <div style={{
                        marginTop: '0.75rem',
                        paddingTop: '0.5rem',
                        borderTop: '1px solid #f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '6px'
                      }}>
                        <button
                          onClick={() => handleCopy(msg.text, msg.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: copiedId === msg.id ? '#10b981' : '#64748b',
                            fontSize: '0.725rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer',
                            padding: '3px 7px',
                            borderRadius: '6px'
                          }}
                          title="Copy response"
                        >
                          {copiedId === msg.id ? <Check size={12} /> : <Copy size={12} />}
                          {copiedId === msg.id ? 'Copied' : 'Copy'}
                        </button>

                        <button
                          onClick={() => handleSpeak(msg.text, msg.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: speakingId === msg.id ? '#6366f1' : '#64748b',
                            fontSize: '0.725rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer',
                            padding: '3px 7px',
                            borderRadius: '6px'
                          }}
                          title={speakingId === msg.id ? "Stop audio" : "Listen to explanation"}
                        >
                          {speakingId === msg.id ? <VolumeX size={12} /> : <Volume2 size={12} />}
                          {speakingId === msg.id ? 'Stop Voice' : 'Read Aloud'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {/* Thinking Indicator */}
                {loading && (
                  <div className="chat-bubble chat-ai" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '14px',
                    padding: '0.85rem 1.25rem'
                  }}>
                    <div style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white'
                    }}>
                      <Sparkles size={14} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>
                        Synthesizing study response...
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        Analyzing syllabus notes for {selectedNote?.title || 'selected unit'}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className="chat-input-area" style={{ padding: '0.9rem 1.25rem', backgroundColor: 'white', borderTop: '1px solid #e2e8f0' }}>
                <textarea
                  ref={textareaRef}
                  rows={2}
                  placeholder={selectedNote ? `Ask anything about "${selectedNote.title}" (Press Enter to send)...` : "Select a note to ask questions..."}
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="form-control"
                  style={{
                    resize: 'none',
                    fontSize: '0.9rem',
                    borderRadius: '12px',
                    padding: '0.65rem 0.85rem',
                    border: '1px solid #cbd5e1'
                  }}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={loading || !inputQuery.trim()}
                  className="btn btn-primary"
                  style={{
                    padding: '0 1.5rem',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '2px',
                    minWidth: '85px'
                  }}
                >
                  <Send size={18} />
                  <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>Send</span>
                </button>
              </div>
            </div>

            {/* Right Note Context Card */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {selectedNote ? (
                <div style={{
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                    <BookOpen size={18} color="#6366f1" />
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                      Reference Material
                    </h3>
                  </div>

                  <div style={{
                    padding: '0.75rem',
                    background: '#f8fafc',
                    borderRadius: '10px',
                    border: '1px solid #f1f5f9',
                    marginBottom: '0.75rem'
                  }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0' }}>
                      {selectedNote.title}
                    </h4>
                    <span style={{
                      display: 'inline-block',
                      backgroundColor: '#e0e7ff',
                      color: '#4338ca',
                      fontSize: '0.725rem',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '6px'
                    }}>
                      {selectedNote.subject}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Department:</span>
                      <strong style={{ color: '#334155' }}>{selectedNote.department}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Semester:</span>
                      <strong style={{ color: '#334155' }}>Sem {selectedNote.semester} (Yr {selectedNote.year})</strong>
                    </div>
                    {selectedNote.unit && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Unit:</span>
                        <strong style={{ color: '#334155' }}>{selectedNote.unit}</strong>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>File Size:</span>
                      <strong style={{ color: '#334155' }}>{formatFileSize(selectedNote.fileSize)}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <Link
                      to={`/summarizer?noteId=${selectedNote.id}`}
                      className="btn btn-secondary btn-sm"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        fontSize: '0.8rem',
                        padding: '0.5rem',
                        borderRadius: '8px',
                        textDecoration: 'none'
                      }}
                    >
                      <Sparkles size={14} color="#8b5cf6" />
                      View Full AI Summary
                    </Link>

                    <button
                      onClick={() => noteService.downloadNote(selectedNote.id, selectedNote.fileName)}
                      className="btn btn-secondary btn-sm"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        fontSize: '0.8rem',
                        padding: '0.5rem',
                        borderRadius: '8px'
                      }}
                    >
                      <Download size={14} />
                      Download PDF
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  textAlign: 'center',
                  color: '#64748b'
                }}>
                  <BookOpen size={24} style={{ margin: '0 auto 8px', color: '#94a3b8' }} />
                  <p style={{ fontSize: '0.85rem', margin: 0 }}>
                    Select a note from the dropdown to view reference context details.
                  </p>
                </div>
              )}

              {/* Study Tips Card */}
              <div style={{
                background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                border: '1px solid #bbf7d0',
                borderRadius: '16px',
                padding: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: '#166534' }}>
                  <Lightbulb size={16} />
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0 }}>
                    Study Smarter
                  </h4>
                </div>
                <p style={{ fontSize: '0.775rem', color: '#15803d', margin: 0, lineHeight: 1.5 }}>
                  Ask the assistant to test your memory: type <em>"Quiz me on 3 questions from this chapter"</em> for active recall!
                </p>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};
