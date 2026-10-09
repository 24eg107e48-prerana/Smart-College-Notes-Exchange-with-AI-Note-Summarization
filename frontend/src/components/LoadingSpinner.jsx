import React from 'react';

export const LoadingSpinner = ({ message = 'Loading...', size = 'md' }) => {
  const sizePixels = size === 'sm' ? 24 : size === 'lg' ? 48 : 36;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1.5rem',
      gap: '1rem',
      color: '#64748b'
    }}>
      <div style={{
        width: `${sizePixels}px`,
        height: `${sizePixels}px`,
        border: '3px solid #e2e8f0',
        borderTop: '3px solid #4f46e5',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      {message && <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{message}</span>}
    </div>
  );
};
