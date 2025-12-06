import { useEffect, useState } from 'react';
import apiClient from '@/lib/api';

interface VibeSelectorProps {
  selectedVibe: string | null;
  onSelectVibe: (vibe: string | null) => void;
}

const VibeSelector = ({ selectedVibe, onSelectVibe }: VibeSelectorProps) => {
  const [vibes, setVibes] = useState<Array<{ key: string; label: string; emoji?: string }>>([]);
  useEffect(() => {
    (async () => {
      try {
        console.log('[VibeSelector] Fetching vibes...');
        const { data } = await apiClient.get('/vibes');
        console.log('[VibeSelector] ✅ Vibes loaded:', data?.data?.length);
        const list = (data?.data || []).map((v: any) => ({ key: v.key, label: v.label, emoji: v.emoji }));
        setVibes(list);
        localStorage.setItem('_vibe_debug', JSON.stringify({ status: 'success', count: list.length, timestamp: new Date().toISOString() }));
      } catch (error: any) {
        const status = error?.response?.status || 'unknown';
        const statusText = error?.response?.statusText || '';
        const errorMsg = `HTTP ${status} ${statusText}`;
        console.error('[VibeSelector] ❌ Failed to load vibes:', errorMsg);
        console.error('[VibeSelector] Full error:', error);
        localStorage.setItem('_vibe_debug', JSON.stringify({ 
          status: 'error', 
          httpStatus: status,
          statusText: statusText,
          message: errorMsg,
          timestamp: new Date().toISOString() 
        }));
      }
    })();
  }, []);
  return (
    <div style={{ position: 'relative' }}>
      {/* Debug: Always visible indicator */}
      <div style={{ 
        position: 'absolute', 
        top: '-30px', 
        left: '4px',
        fontSize: '10px',
        color: '#ff6b00',
        zIndex: 50,
        backgroundColor: '#000',
        padding: '2px 4px',
        borderRadius: '2px'
      }}>
        Vibes: {vibes.length}
      </div>
      <div className="w-full py-4 px-4 vibes-scroll" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', display: 'flex', gap: '12px' }}>
      {/* All Vibes Button */}
      <button
        onClick={() => onSelectVibe(null)}
        className={`flex items-center gap-2 px-5 py-3 rounded-full whitespace-nowrap transition-all flex-shrink-0 ${
          selectedVibe === null ? 'pill-active' : 'pill-inactive'
        }`}
      >
        <span className="text-lg">✨</span>
        <span className="font-medium">همه موارد</span>
      </button>
      
      {/* Individual Vibe Buttons */}
      {vibes.map((vibe) => (
        <button
          key={vibe.key}
          onClick={() => onSelectVibe(vibe.key)}
          className={`flex items-center gap-2 px-5 py-3 rounded-full whitespace-nowrap transition-all flex-shrink-0 ${
            selectedVibe === vibe.key ? 'pill-active' : 'pill-inactive'
          }`}
        >
          <span className="text-lg">{vibe.emoji || '✨'}</span>
          <span className="font-medium">{vibe.label}</span>
        </button>
      ))}
    </div>
    </div>
  );
};

export default VibeSelector;
