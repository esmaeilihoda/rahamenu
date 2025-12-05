import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Trash2, CreditCard, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { ordersAPI, CreateOrderDTO } from '@/lib/api/orders.api';
import { PaymentModal } from './PaymentModal';
import { useSearchParams } from 'react-router-dom';
import { formatToman } from '@/lib/utils';

const CartSheet = () => {
  const { items, totalItems, totalPrice, removeItem, paymentMode, setPaymentMode, clearCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const handleCheckout = async () => {
    // Get table number from URL params
    const tableParam = searchParams.get('table');
    
    if (!tableParam) {
      toast({
        title: "خطا",
        description: "شماره میز مشخص نیست. لطفا دوباره اسکن کنید.",
        variant: "destructive",
      });
      return;
    }

    const tableNumber = parseInt(tableParam);
    if (isNaN(tableNumber)) {
      toast({
        title: "خطا",
        description: "شماره میز نامعتبر است.",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "سبد خالی است",
        description: "لطفا ابتدا سفارش خود را انتخاب کنید.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare order data with tableNumber as integer
      const orderData: any = {
        tableNumber,
        items: items.map(item => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
          customizations: {
            sweetness: item.sweetness,
            addOns: item.addOns,
          },
          addOnsDetails: Array.isArray(item.menuItem.addOns)
            ? item.addOns.map(name => {
                const meta = item.menuItem.addOns!.find(a => a.name === name);
                return meta ? { name: meta.name, price: meta.price, category: meta.category, emoji: meta.emoji } : { name, price: 0, category: 'flavor', emoji: '✨' };
              })
            : item.addOns.map(name => ({ name, price: 0, category: 'flavor', emoji: '✨' })),
        })),
        customerNotes: '',
        selectedVibe: localStorage.getItem('selected_vibe') || undefined,
      };

      console.log('📦 Creating order:', orderData);

      // Create order via API
      const createdOrder = await ordersAPI.createOrder(orderData);
      
      console.log('✅ Order created successfully:', createdOrder);

      // Open payment modal
      setCreatedOrderId(createdOrder._id);
      setIsPaymentModalOpen(true);
    } catch (error: any) {
      console.error('❌ Order creation failed:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast({
        title: "خطا در ثبت سفارش",
        description: error.response?.data?.error || error.message || "لطفا دوباره تلاش کنید.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Cart Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 right-4 py-4 px-6 rounded-2xl bg-primary text-primary-foreground font-semibold flex items-center justify-between z-40 shadow-xl"
        initial={{ y: 100 }}
        animate={{ y: totalItems > 0 ? 0 : 100 }}
        transition={{ type: 'spring', damping: 20 }}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <ShoppingBag className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center font-bold">
              {totalItems}
            </span>
          </div>
          <span>مشاهده سبد</span>
        </div>
        <span className="text-lg">{formatToman(totalPrice)}</span>
      </motion.button>

      {/* Cart Sheet */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 glass-card rounded-t-3xl max-h-[80vh] overflow-y-auto"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="p-6">
                {/* Handle bar */}
                <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-6" />
                
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif text-2xl font-semibold">سفارش شما</h2>
                  <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-muted">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Payment Mode Toggle */}
                <div className="glass-card p-4 rounded-xl mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-primary" />
                      <span className="font-medium">
                        {paymentMode === 'self' ? 'پرداخت جداگانه' : 'پرداخت کل میز'}
                      </span>
                    </div>
                    <Switch
                      checked={paymentMode === 'table'}
                      onCheckedChange={(checked) => setPaymentMode(checked ? 'table' : 'self')}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {paymentMode === 'self' 
                      ? "سفارشات شما جداگانه محاسبه می‌شود"
                      : "همه سفارشات میز با هم محاسبه می‌شود"}
                  </p>
                </div>

                {/* Cart Items */}
                <div className="space-y-4 mb-6">
                  {items.map((item, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center gap-4 p-4 rounded-xl bg-card"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <img
                        src={item.menuItem.image}
                        alt={item.menuItem.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.menuItem.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.sweetness}٪ شیرینی
                        </p>
                        {item.addOns.length > 0 && (
                          <p className="text-xs text-primary">+ {item.addOns.join('، ')}</p>
                        )}
                      </div>
                      <div className="text-start">
                        <p className="font-semibold">{formatToman(item.totalPrice)}</p>
                        <p className="text-sm text-muted-foreground">×{item.quantity}</p>
                      </div>
                      <button
                        onClick={() => removeItem(index)}
                        className="p-2 rounded-full hover:bg-destructive/20 text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>

                {/* Total & Checkout */}
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-muted-foreground">جمع کل</span>
                    <span className="font-semibold text-lg">{formatToman(totalPrice)}</span>
                  </div>
                  <motion.button
                    onClick={handleCheckout}
                    disabled={isSubmitting || items.length === 0}
                    className="w-full py-4 rounded-full bg-primary text-primary-foreground font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                    whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>در حال ثبت...</span>
                      </>
                    ) : (
                      'ثبت سفارش'
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {createdOrderId && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            clearCart();
          }}
          orderId={createdOrderId}
          totalAmount={Math.round(totalPrice)}
        />
      )}
    </>
  );
};

export default CartSheet;
