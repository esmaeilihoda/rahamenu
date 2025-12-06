import React, { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://rahamenu.onrender.com/api/v1';

export const DebugView = () => {
  const vibeDebug = localStorage.getItem('_vibe_debug');
  const apiDebug = localStorage.getItem('_api_debug');
  const vibeData = vibeDebug ? JSON.parse(vibeDebug) : null;
  const apiData = apiDebug ? JSON.parse(apiDebug) : null;
  const [headerData, setHeaderData] = useState<any>(null);
  const [headerError, setHeaderError] = useState<string | null>(null);

  useEffect(() => {
    // Test what headers are being sent (absolute URL so it hits the API, not the Vercel static site)
    fetch(`${API_URL}/debug/headers`)
      .then(r => r.json())
      .then(data => {
        setHeaderData(data);
        localStorage.setItem('_header_debug', JSON.stringify(data));
      })
      .catch(err => {
        console.error('Header test failed:', err);
        setHeaderError(err?.message || 'Header fetch failed');
      });
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', fontSize: '12px', color: '#fff', backgroundColor: '#000', minHeight: '100vh', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
      <h1>Debug Info</h1>
      
      <h2>Vibe Loading Status:</h2>
      {vibeData ? (
        <>
          <div>Status: <strong style={{ color: vibeData.status === 'success' ? '#0f0' : '#f00' }}>{vibeData.status}</strong></div>
          {vibeData.count !== undefined && <div>Count: {vibeData.count}</div>}
          {vibeData.message && <div style={{ color: '#f00' }}>Error: {vibeData.message}</div>}
          <div>Timestamp: {vibeData.timestamp}</div>
        </>
      ) : (
        <div style={{ color: '#999' }}>No vibe debug data yet</div>
      )}

      <h2 style={{ marginTop: '20px' }}>API Configuration:</h2>
      {apiData ? (
        <>
          <div>Event: {apiData.event}</div>
          <div>URL: {apiData.url}</div>
          <div>Pathname: {apiData.pathname}</div>
          <div>Timestamp: {apiData.timestamp}</div>
        </>
      ) : (
        <div style={{ color: '#999' }}>No API debug data yet</div>
      )}

      <h2 style={{ marginTop: '20px' }}>Headers Being Sent:</h2>
      {headerData ? (
        <details>
          <summary>Click to expand</summary>
          <pre>{JSON.stringify(headerData, null, 2)}</pre>
        </details>
      ) : headerError ? (
        <div style={{ color: '#f00' }}>Header load error: {headerError}</div>
      ) : (
        <div style={{ color: '#999' }}>Loading header data...</div>
      )}

      <h2 style={{ marginTop: '20px' }}>Current URL:</h2>
      <div>{window.location.href}</div>

      <h2 style={{ marginTop: '20px' }}>Pathname:</h2>
      <div>{window.location.pathname}</div>

      <button 
        onClick={() => { localStorage.clear(); window.location.reload(); }}
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
        Clear Debug Data & Reload
      </button>
    </div>
  );
};
