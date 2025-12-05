import { motion } from 'framer-motion';
import { MenuItem } from '@/data/menuData';
import { formatToman } from '@/lib/utils';
import { Plus, Clock } from 'lucide-react';

interface MenuCardProps {
  item: MenuItem;
  index: number;
  onSelect: (item: MenuItem) => void;
}

const MenuCard = ({ item, index, onSelect }: MenuCardProps) => {
  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl ${!item.available ? 'opacity-50' : ''}`}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: item.available ? 1.02 : 1 }}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent" />
        
        {!item.available && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="font-medium">تمام شد</span>
            </div>
          </div>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-end justify-between">
            <div className="flex-1">
              <h3 className="font-serif text-xl font-semibold text-foreground mb-1">
                {item.name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {item.description}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-lg font-semibold text-primary">
                  {formatToman(item.price)}
                </span>
                {item.pairing && (
                  <span className="text-xs text-coffee-light px-2 py-1 rounded-full bg-coffee/10">
                    پیشنهاد: {item.pairing}
                  </span>
                )}
              </div>
            </div>
            
            {item.available && (
              <motion.button
                onClick={() => onSelect(item)}
                className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Plus className="w-6 h-6 text-primary-foreground" />
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MenuCard;
