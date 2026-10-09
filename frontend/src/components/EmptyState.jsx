import React from 'react';
import { BookOpen } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = BookOpen,
  title = 'No notes found',
  description = 'Try adjusting your search filters or browse other departments.',
  action = null
}) => {
  return (
    <div style={{
      textAlign: 'center',
      padding: '4rem 1.5rem',
      backgroundColor: 'white',
      borderRadius: '16px',
      border: '1px solid #e2e8f0',
      maxWidth: '540px',
      margin: '2rem auto'
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '16px',
        backgroundColor: '#eef2ff',
        color: '#4f46e5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 1.5rem'
      }}>
        <Icon size={32} />
      </div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>
        {title}
      </h3>
      <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: action ? '1.5rem' : 0 }}>
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};
