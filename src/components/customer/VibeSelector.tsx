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
        const { data } = await apiClient.get('/vibes');
        const list = (data?.data || []).map((v: any) => ({ key: v.key, label: v.label, emoji: v.emoji }));
        setVibes(list);
      } catch (error) {
        console.error('Failed to load vibes:', error);
      }
    })();
  }, []);
  return (
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
