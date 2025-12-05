import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus } from 'lucide-react';
import { MenuItem } from '@/data/menuData';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { formatToman } from '@/lib/utils';

interface SmartBuilderProps {
  item: MenuItem;
  isOpen: boolean;
  onClose: () => void;
  allItems: MenuItem[];
}

const SmartBuilder = ({ item, isOpen, onClose, allItems }: SmartBuilderProps) => {
  const [sweetness, setSweetness] = useState(50);
  const [quantity, setQuantity] = useState(1);
  const [addPairing, setAddPairing] = useState(false);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const { addItem } = useCart();
  const { toast } = useToast();

  const pairingItem = Array.isArray(item.pairings) && item.pairings.length > 0 && allItems
    ? allItems.find(m => m.id === item.pairings![0]) || null
    : null;

  const calculateTotal = () => {
    let total = item.price * quantity;
    if (addPairing && pairingItem) total += pairingItem.price;
    // Per-item add-ons pricing
    const addOnCatalog = Array.isArray(item.addOns) ? item.addOns : [];
    selectedAddOns.forEach(name => {
      const meta = addOnCatalog.find(a => a.name === name);
      if (meta?.price) total += meta.price * quantity;
    });
    return total;
  };

  const handleAddToCart = () => {
    addItem({
      menuItem: item,
      quantity,
      sweetness,
      addOns: [
        ...(addPairing && pairingItem ? [pairingItem.name] : []),
        ...selectedAddOns,
      ],
      totalPrice: calculateTotal()
    });
    
    toast({
      title: "به سبد اضافه شد!",
      description: `${quantity} عدد ${item.name}`,
    });
    
    onClose();
    setQuantity(1);
    setSweetness(50);
    setAddPairing(false);
    setSelectedAddOns([]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 glass-card rounded-t-3xl max-h-[85vh] overflow-y-auto"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="p-6">
              {/* Handle bar */}
              <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-6" />
              
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="font-serif text-2xl font-semibold">{item.name}</h2>
                  <p className="text-muted-foreground mt-1">{item.description}</p>
                </div>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-muted">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sweetness Slider */}
              {(item.category === 'coffee' || item.category === 'tea' || item.category === 'cold') && (
                <div className="mb-6">
                  <h3 className="font-medium mb-3">میزان شیرینی: {sweetness}٪</h3>
                  <div className="relative">
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-coffee to-cream rounded-full"
                        initial={{ width: '50%' }}
                        animate={{ width: `${sweetness}%` }}
                      />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sweetness}
                      onChange={(e) => setSweetness(Number(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>بدون شکر</span>
                    <span>خیلی شیرین</span>
                  </div>
                </div>
              )}

              {/* Pairing Suggestion */}
              {pairingItem && pairingItem.available && (
                <motion.div
                  className={`mb-6 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    addPairing ? 'border-primary bg-primary/10' : 'border-border'
                  }`}
                  onClick={() => setAddPairing(!addPairing)}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={pairingItem.image}
                      alt={pairingItem.name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-xs text-primary font-medium mb-1">پیشنهاد ویژه</p>
                      <h4 className="font-medium">{pairingItem.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        +{formatToman(pairingItem.price)}
                      </p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      addPairing ? 'bg-primary border-primary' : 'border-muted'
                    }`}>
                      {addPairing && <span className="text-primary-foreground text-xs">✓</span>}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Add-ons selection (per-item) */}
              {Array.isArray(item.addOns) && item.addOns.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium mb-3">افزودنی‌ها</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {item.addOns.map((meta) => {
                      const active = selectedAddOns.includes(meta.name);
                      return (
                        <motion.button
                          key={meta.name}
                          onClick={() => {
                            setSelectedAddOns(prev => active ? prev.filter(n => n !== meta.name) : [...prev, meta.name]);
                          }}
                          className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                            active
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                          }`}
                          whileTap={{ scale: 0.95 }}
                        >
                          <span className="text-2xl">{meta.emoji}</span>
                          <span className="text-sm font-medium text-center">{meta.name}</span>
                          {meta.price > 0 && (
                            <span className="text-xs text-muted-foreground">
                              +{formatToman(meta.price)}
                            </span>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">افزودنی‌ها بر قیمت نهایی اضافه می‌شوند و در رسید و آنالیزها لحاظ می‌گردند.</p>
                </div>
              )}

              {/* Quantity & Add to Cart */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-muted rounded-full p-1">
                  <motion.button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-full bg-card flex items-center justify-center"
                    whileTap={{ scale: 0.9 }}
                  >
                    <Minus className="w-4 h-4" />
                  </motion.button>
                  <span className="w-8 text-center font-semibold">{quantity}</span>
                  <motion.button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-full bg-card flex items-center justify-center"
                    whileTap={{ scale: 0.9 }}
                  >
                    <Plus className="w-4 h-4" />
                  </motion.button>
                </div>

                <motion.button
                  onClick={handleAddToCart}
                  className="flex-1 py-4 rounded-full bg-primary text-primary-foreground font-semibold text-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  افزودن · {formatToman(calculateTotal())}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SmartBuilder;
