import { motion } from 'framer-motion';
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
      } catch {}
    })();
  }, []);
  return (
    <div className="w-full overflow-x-auto scrollbar-hide py-4 px-4">
      <motion.div 
        className="flex gap-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.button
          onClick={() => onSelectVibe(null)}
          className={`flex items-center gap-2 px-5 py-3 rounded-full whitespace-nowrap transition-all ${
            selectedVibe === null ? 'pill-active' : 'pill-inactive'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-lg">✨</span>
          <span className="font-medium">همه موارد</span>
        </motion.button>
        
        {vibes.map((vibe, index) => (
          <motion.button
            key={vibe.key}
            onClick={() => onSelectVibe(vibe.key)}
            className={`flex items-center gap-2 px-5 py-3 rounded-full whitespace-nowrap transition-all ${
              selectedVibe === vibe.key ? 'pill-active' : 'pill-inactive'
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-lg">{vibe.emoji || '✨'}</span>
            <span className="font-medium">{vibe.label}</span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};

export default VibeSelector;
