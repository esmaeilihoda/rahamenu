import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

const EMOJIS = ['✨','🌾','🌰','🍫','🍯','🥜','🍓','🍊','🧂','🧊','🍮','🍪','🥐','🥛','☕'];

interface EmojiPickerProps {
  value?: string;
  onChange: (emoji: string) => void;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ value, onChange }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" type="button" className="w-full justify-start">
          <span className="mr-2">{value || 'ایموجی'}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="start">
        <div className="grid grid-cols-8 gap-2">
          {EMOJIS.map((e) => (
            <button
              key={e}
              className="text-xl p-2 rounded hover:bg-muted"
              onClick={() => onChange(e)}
              type="button"
            >
              {e}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default EmojiPicker;
