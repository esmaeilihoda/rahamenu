import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Maximize, Minimize, Volume2, VolumeX, Zap } from 'lucide-react';

interface KitchenSettingsProps {
  onToggleFullscreen: () => void;
}

export const KitchenSettings = ({ onToggleFullscreen }: KitchenSettingsProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [rushMode, setRushMode] = useState(false);

  const toggleFullscreen = () => {
    onToggleFullscreen();
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={toggleFullscreen} title="Toggle full-screen">
        {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setSoundOn(!soundOn)}
        title={soundOn ? 'Disable sound' : 'Enable sound'}
      >
        {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
      </Button>
      <Button
        variant={rushMode ? 'default' : 'outline'}
        onClick={() => setRushMode(!rushMode)}
        title="Rush mode"
        className="gap-2"
      >
        <Zap className="h-4 w-4" /> {rushMode ? 'Rush On' : 'Rush Off'}
      </Button>
    </div>
  );
};
