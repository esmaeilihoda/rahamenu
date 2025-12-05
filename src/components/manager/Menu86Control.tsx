import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { menuItems as initialMenuItems, MenuItem } from '@/data/menuData';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

const Menu86Control = () => {
  const [items, setItems] = useState<MenuItem[]>(initialMenuItems);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const getCategoryLabel = (category: string) => {
    switch(category) {
      case 'coffee': return 'قهوه';
      case 'tea': return 'چای';
      case 'pastry': return 'شیرینی';
      case 'cold': return 'سرد';
      default: return category;
    }
  };

  const toggleAvailability = (itemId: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newState = !item.available;
        toast({
          title: newState ? "محصول موجود شد" : "محصول ناموجود شد",
          description: `${item.name} اکنون ${newState ? 'موجود' : 'ناموجود'} است`,
        });
        return { ...item, available: newState };
      }
      return item;
    }));
  };

  const filteredItems = items.filter(item =>
    item.name.includes(searchQuery) ||
    getCategoryLabel(item.category).includes(searchQuery)
  );

  const unavailableCount = items.filter(i => !i.available).length;

  return (
    <div>
      {/* Header Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <motion.div
          className="glass-card p-4 rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-sm text-muted-foreground">کل محصولات</p>
          <p className="text-3xl font-bold">{items.length}</p>
        </motion.div>
        <motion.div
          className="glass-card p-4 rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-sm text-muted-foreground">ناموجود</p>
          <p className="text-3xl font-bold text-status-alert">{unavailableCount}</p>
        </motion.div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="جستجوی محصولات..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full ps-12 pe-4 py-3 rounded-xl bg-muted border border-border focus:border-primary focus:outline-none transition-colors"
        />
      </div>

      {/* Items List */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 p-4 border-b border-border text-sm text-muted-foreground font-medium">
          <span>تصویر</span>
          <span>محصول</span>
          <span>قیمت</span>
          <span>وضعیت</span>
        </div>

        <div className="divide-y divide-border">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              className={`grid grid-cols-[auto_1fr_auto_auto] gap-4 p-4 items-center transition-opacity ${
                !item.available ? 'opacity-50' : ''
              }`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: item.available ? 1 : 0.5, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">{getCategoryLabel(item.category)}</p>
              </div>
              <span className="font-semibold">{item.price.toFixed(2)} تومان</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  item.available 
                    ? 'bg-status-empty/20 text-status-empty' 
                    : 'bg-status-alert/20 text-status-alert'
                }`}>
                  {item.available ? 'موجود' : 'ناموجود'}
                </span>
                <Switch
                  checked={item.available}
                  onCheckedChange={() => toggleAvailability(item.id)}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Menu86Control;
