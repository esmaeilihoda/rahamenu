import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrders } from '@/hooks/useOrders';
import { formatDistanceToNow } from 'date-fns';
import { faIR } from 'date-fns/locale';

interface NotificationDropdownProps {
  alertCount?: number;
}

export const NotificationDropdown = ({ alertCount = 0 }: NotificationDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { orders } = useOrders();
  
  // Get recent pending orders as notifications
  const recentNotifications = orders
    .filter(order => order.status === 'pending')
    .slice(0, 5)
    .map(order => ({
      id: order._id,
      title: `سفارش جدید - میز ${order.tableNumber}`,
      message: `${order.items.length} آیتم - ${order.totalAmount.toLocaleString('fa-IR')} تومان`,
      time: new Date(order.createdAt),
    }));

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-notification-dropdown]')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const totalCount = alertCount + recentNotifications.length;

  return (
    <div className="relative" data-notification-dropdown>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Bell className="w-5 h-5" />
        {totalCount > 0 && (
          <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
            {totalCount > 9 ? '9+' : totalCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-background border border-border rounded-xl shadow-lg z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-lg">اعلان‌ها</h3>
              <p className="text-sm text-muted-foreground">
                {totalCount > 0 ? `${totalCount} اعلان جدید` : 'اعلانی وجود ندارد'}
              </p>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {recentNotifications.length > 0 ? (
                <div className="divide-y divide-border">
                  {recentNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{notification.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDistanceToNow(notification.time, {
                              addSuffix: true,
                              locale: faIR,
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    اعلان جدیدی وجود ندارد
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {recentNotifications.length > 0 && (
              <div className="p-3 border-t border-border">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center text-sm text-primary hover:underline"
                >
                  مشاهده همه سفارشات
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
