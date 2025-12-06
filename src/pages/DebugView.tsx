import React from 'react';

export const DebugView = () => (
  <div style={{ padding: '20px', fontFamily: 'monospace', fontSize: '12px', color: '#fff', backgroundColor: '#000', minHeight: '100vh', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
    <h1>Debug Info</h1>
    <p>Debug page has been disabled for production.</p>
    <button 
      onClick={() => { localStorage.clear(); window.location.href = '/'; }}
      style={{
        marginTop: '20px',
        padding: '10px 20px',
        backgroundColor: '#f00',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      Clear Data & Go Home
    </button>
  </div>
);
export default DebugView;
