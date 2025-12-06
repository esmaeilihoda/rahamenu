import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Coffee } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { MenuItem } from '@/data/menuData';
import VibeSelector from '@/components/customer/VibeSelector';
import MenuCard from '@/components/customer/MenuCard';
import SmartBuilder from '@/components/customer/SmartBuilder';
import DigitalBell from '@/components/customer/DigitalBell';
import CartSheet from '@/components/customer/CartSheet';
import { CartProvider } from '@/context/CartContext';
import apiClient from '@/lib/api';

const CustomerViewContent = () => {
  const [searchParams] = useSearchParams();
  const tableNumber = searchParams.get('table') || '؟';
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
  const [vibes, setVibes] = useState<Array<{ key: string; label: string; emoji?: string }>>([]);
    // Persist vibe selection so CartSheet can include it in order
    useEffect(() => {
      if (selectedVibe) {
        localStorage.setItem('selected_vibe', selectedVibe);
      } else {
        localStorage.removeItem('selected_vibe');
      }
    }, [selectedVibe]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tableId, setTableId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!searchParams.get('table')) {
      console.warn('No table number in URL. Customers should scan QR code.');
    }
  }, [searchParams]);

  // Update table status to "browsing" when customer accesses menu
  useEffect(() => {
    const updateTableStatus = async () => {
      const table = searchParams.get('table');
      if (!table) return;

      try {
        // Find the table by tableNumber and update status
        const { data } = await apiClient.get('/tables');
        const tableData = data?.data?.find((t: any) => t.tableNumber === parseInt(table));
        
        if (tableData?._id) {
          setTableId(tableData._id); // Store table ID for DigitalBell
          await apiClient.patch(`/tables/${tableData._id}/status`, {
            status: 'browsing',
          });
          console.log(`✅ Table ${table} status updated to browsing`);
        }
      } catch (error) {
        console.warn('Could not update table status:', error);
        // Don't show error to customer - this is a background operation
      }
    };

    updateTableStatus();
  }, [searchParams]);

  useEffect(() => {
    const fetchVibes = async () => {
      try {
        const { data } = await apiClient.get('/vibes');
        setVibes((data?.data || []).map((v: any) => ({ key: v.key, label: v.label, emoji: v.emoji })));
      } catch (e) {
        console.error('Failed to load vibes:', e);
      }
    };
    fetchVibes();
  }, []);

  useEffect(() => {
    const fetchMenu = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data } = await apiClient.get('/menu');
        const apiItems: any[] = data?.data || [];
        // Map API items to UI MenuItem shape (id <- _id)
        const mapped: MenuItem[] = apiItems.map((it) => ({
          id: it._id,
          _id: it._id,
          name: it.name,
          description: it.description || '',
          price: Number(it.price) || 0,
          category: it.category,
          vibes: Array.isArray(it.vibes) ? it.vibes : [],
          image: it.image || it.imageUrl || '',
          available: it.available !== false,
          pairing: undefined,
          pairings: Array.isArray(it.pairings) ? it.pairings : [],
          addOns: Array.isArray(it.addOns) ? it.addOns : [],
        }));
        setItems(mapped);
      } catch (e: any) {
        console.error('Failed to load menu:', e);
        setError(e?.response?.data?.error || 'خطا در دریافت منو');
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const filteredItems = selectedVibe
    ? items.filter(item => item.vibes.includes(selectedVibe))
    : items;

  return (
    <div className="min-h-screen bg-background pb-24" dir="rtl">
      {/* Header */}
      <motion.header 
        className="sticky top-0 z-30 glass"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        dir="rtl"
      >
        <div className="flex items-center justify-between p-4 flex-row-reverse" dir="rtl">
          <Link to="/" className="p-2 rounded-full hover:bg-muted">
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Coffee className="w-5 h-5 text-primary" />
            <span className="font-serif text-lg font-semibold">میز {tableNumber}</span>
          </div>
          <div className="w-9" />
        </div>
        
        {/* Vibe Selector */}
        <VibeSelector 
          selectedVibe={selectedVibe} 
          onSelectVibe={setSelectedVibe} 
        />

        {/* Vibe Prompt Banner */}
        {!selectedVibe && vibes.length > 0 && (
          <div className="mx-4 mb-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-2">
            <span className="text-xl">🪄</span>
            <span className="text-sm">برای نمایش آیتم‌های مناسب حال و هوای شما، یک حس‌وحال از بالا انتخاب کنید.</span>
          </div>
        )}
        
      </motion.header>

      {/* Menu Feed */}
      <main className="px-4 pt-4" dir="rtl">
        <motion.h2 
          className="font-serif text-2xl mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {selectedVibe 
            ? `${vibes.find(v => v.key === selectedVibe)?.emoji || '✨'} ${filteredItems.length} مورد`
            : 'منوی ما'}
        </motion.h2>
        {isLoading && (
          <motion.div className="text-center py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-muted-foreground">در حال بارگذاری منو...</p>
          </motion.div>
        )}
        {error && !isLoading && (
          <motion.div className="text-center py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-destructive">{error}</p>
          </motion.div>
        )}
        <div className="grid gap-4">
          {filteredItems.map((item, index) => (
            <MenuCard
              key={item.id}
              item={item}
              index={index}
              onSelect={setSelectedItem}
            />
          ))}
        </div>

        {!isLoading && !error && filteredItems.length === 0 && (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-muted-foreground">موردی با این حس‌وحال پیدا نشد</p>
          </motion.div>
        )}
      </main>

      {/* Smart Builder Modal */}
      {selectedItem && (
        <SmartBuilder
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          allItems={items}
        />
      )}

      {/* Digital Bell */}
      <DigitalBell 
        tableId={tableId}
        tableNumber={parseInt(tableNumber) || undefined}
      />

      {/* Cart Sheet */}
      <CartSheet />
    </div>
  );
};

const CustomerView = () => {
  return (
    <CartProvider>
      <CustomerViewContent />
    </CartProvider>
  );
};

export default CustomerView;
