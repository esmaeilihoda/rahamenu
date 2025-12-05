import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, User, Droplets, Receipt, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSocket } from '@/hooks/useSocket';
import apiClient from '@/lib/api';

interface DigitalBellProps {
  tableId?: string;
  tableNumber?: number;
  restaurantId?: string;
}

const DigitalBell = ({ tableId, tableNumber, restaurantId }: DigitalBellProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { emit, isConnected } = useSocket();

  const actions = [
    { id: 'waiter', icon: User, label: 'صدا زدن گارسون', color: 'bg-status-alert' },
    { id: 'water', icon: Droplets, label: 'درخواست آب', color: 'bg-status-browsing' },
    { id: 'bill', icon: Receipt, label: 'درخواست صورتحساب', color: 'bg-status-ordered' },
  ];

  // Cooldown timer effect
  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setTimeout(() => {
        setCooldownSeconds(cooldownSeconds - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsDisabled(false);
    }
  }, [cooldownSeconds]);

  const handleAction = async (action: typeof actions[0]) => {
    if (isDisabled) {
      toast({
        title: 'لطفا صبر کنید',
        description: `می‌توانید بعد از ${cooldownSeconds} ثانیه دوباره درخواست دهید.`,
        variant: 'destructive',
      });
      return;
    }

    if (!tableId) {
      toast({
        title: 'خطا',
        description: 'اطلاعات میز یافت نشد',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Call the backend API to trigger alert
      await apiClient.post(`/tables/${tableId}/call-waiter`, {
        action: action.id,
      });

      toast({
        title: action.label,
        description: "✅ درخواست شما به کارکنان ارسال شد.",
      });

      // Start cooldown (2 minutes = 120 seconds)
      setIsDisabled(true);
      setCooldownSeconds(120);
      setIsExpanded(false);
    } catch (error: any) {
      console.error('Failed to call waiter:', error);
      toast({
        title: 'خطا در ارسال درخواست',
        description: error.response?.data?.error || 'لطفا دوباره تلاش کنید',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 start-4 z-40">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="absolute bottom-16 start-0 flex flex-col gap-3 items-start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {actions.map((action, index) => (
              <motion.button
                key={action.id}
                onClick={() => handleAction(action)}
                disabled={isDisabled || isLoading}
                className={`flex items-center gap-3 px-4 py-3 rounded-full glass-card shadow-xl ${
                  isDisabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                initial={{ opacity: 0, x: -50, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -50, scale: 0.8 }}
                transition={{ 
                  delay: index * 0.1,
                  type: 'spring',
                  damping: 15,
                  stiffness: 300
                }}
                whileHover={!isDisabled && !isLoading ? { scale: 1.05 } : {}}
                whileTap={!isDisabled && !isLoading ? { scale: 0.95 } : {}}
              >
                <span className="text-sm font-medium">
                  {action.label}
                  {isDisabled && action.id === 'waiter' && cooldownSeconds > 0 && (
                    <span className="text-xs block text-muted-foreground">
                      ({cooldownSeconds}s)
                    </span>
                  )}
                </span>
                <div className={`w-10 h-10 rounded-full ${action.color} flex items-center justify-center`}>
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 text-foreground animate-spin" />
                  ) : (
                    <action.icon className="w-5 h-5 text-foreground" />
                  )}
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center ${
          isExpanded ? 'bg-muted' : 'bg-primary'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={isExpanded ? {} : { y: [0, -5, 0] }}
        transition={isExpanded ? {} : { 
          repeat: Infinity, 
          duration: 2,
          ease: "easeInOut"
        }}
      >
        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="bell"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <Bell className="w-6 h-6 text-primary-foreground" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default DigitalBell;
