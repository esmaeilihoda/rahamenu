import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, 
  Menu, 
  QrCode, 
  BarChart3,
  LogOut,
  Coffee,
  Bell,
  User,
  ShoppingCart,
  Utensils
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import LiveFloorMap from '@/components/manager/LiveFloorMap';
import { MenuManagement } from '@/components/manager/MenuManagement';
import { TableManagement } from '@/components/manager/TableManagement';
import QRGenerator from '@/components/manager/QRGenerator';
import { OrderList } from '@/components/manager/OrderList';
import { NotificationDropdown } from '@/components/manager/NotificationDropdown';
import { Button } from '@/components/ui/button';
import { useOrders } from '@/hooks/useOrders';
import AnalyticsDashboard from './AnalyticsDashboard';

type TabType = 'floor' | 'orders' | 'analytics' | 'menu' | 'tables' | 'qr';

const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>('floor');
  const { user, logout, restaurantId } = useAuth();
  const navigate = useNavigate();
  const { getOrderCounts } = useOrders();
  
  // Recalculate order counts on every render to reflect socket updates
  const orderCounts = getOrderCounts();

  const handleLogout = () => {
    logout();
    navigate('/manager/login');
  };

  const tabs = [
    { id: 'floor' as TabType, icon: LayoutGrid, label: 'نقشه زنده' },
    { id: 'orders' as TabType, icon: ShoppingCart, label: 'سفارشات', badge: orderCounts.pending },
    { id: 'analytics' as TabType, icon: BarChart3, label: 'آنالیتیکس' },
    { id: 'menu' as TabType, icon: Menu, label: 'مدیریت منو' },
    { id: 'tables' as TabType, icon: Utensils, label: 'مدیریت میزها' },
    { id: 'qr' as TabType, icon: QrCode, label: 'ساخت QR' },
  ];

  const getTabDescription = (tab: TabType) => {
    switch(tab) {
      case 'floor': return 'نمای لحظه‌ای وضعیت میزها';
      case 'orders': return 'مدیریت سفارشات و وضعیت آن‌ها';
      case 'analytics': return 'تحلیل فروش و عملکرد';
      case 'menu': return 'افزودن، ویرایش و حذف آیتم‌های منو';
      case 'tables': return 'افزودن، ویرایش و حذف میزها';
      case 'qr': return 'ساخت کد QR برای میزها';
    }
  };

  return (
    <div className="min-h-screen bg-background flex" dir="rtl">
      {/* Sidebar */}
      <motion.aside
        className="w-64 bg-sidebar border-s border-sidebar-border flex flex-col"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        dir="rtl"
      >
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Coffee className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-serif text-lg font-semibold text-sidebar-foreground">
                کنترل کافه
              </h1>
              <p className="text-xs text-muted-foreground">داشبورد مدیریت</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  activeTab === tab.id
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                }`}
                whileHover={{ x: -4 }}
                whileTap={{ scale: 0.98 }}
                dir="rtl"
              >
                <tab.icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium flex-1 text-right">{tab.label}</span>
                {tab.id === 'orders' && tab.badge && tab.badge > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-500 text-white flex-shrink-0">
                    {tab.badge}
                  </span>
                )}
                {tab.id === 'floor' && (
                  <span className="w-2 h-2 rounded-full bg-status-alert animate-pulse flex-shrink-0" />
                )}
              </motion.button>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border space-y-2">
          {/* User Info */}
          <div className="px-4 py-2 text-sm">
            <div className="flex items-center gap-2 text-sidebar-foreground mb-1">
              <User className="w-4 h-4" />
              <span className="font-medium">{user?.name}</span>
            </div>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
            <p className="text-xs text-muted-foreground mt-1">
              نقش: {user?.role === 'admin' ? 'مدیر کل' : user?.role === 'manager' ? 'مدیر' : 'کارمند'}
            </p>
          </div>

          {/* Logout Button */}
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start gap-3 px-4 py-3 h-auto text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">خروج از حساب</span>
          </Button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <motion.header
          className="sticky top-0 z-20 glass border-b border-border"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          dir="rtl"
        >
          <div className="flex items-center justify-between px-8 py-4 flex-row-reverse" dir="rtl">
            <div>
              <h2 className="font-serif text-2xl font-semibold">
                {tabs.find(t => t.id === activeTab)?.label}
              </h2>
              <p className="text-muted-foreground text-sm">
                {getTabDescription(activeTab)}
              </p>
            </div>

            <div className="flex items-center gap-4 flex-row-reverse">
              <NotificationDropdown />

              <button
                onClick={() => navigate('/manager/profile')}
                className="flex items-center gap-3 ps-4 border-s border-border hover:bg-muted/50 rounded-lg p-2 transition-colors flex-row-reverse"
                dir="rtl"
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="text-sm text-right">
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-muted-foreground">
                    {user?.role === 'admin' ? 'مدیر کل' : user?.role === 'manager' ? 'مدیر' : 'کارمند'}
                  </p>
                </div>
              </button>
            </div>
          </div>
        </motion.header>

        {/* Content */}
        <div className="p-8" dir="rtl">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            dir="rtl"
          >
            {activeTab === 'floor' && <LiveFloorMap />}
            {activeTab === 'orders' && <OrderList />}
            {activeTab === 'analytics' && <AnalyticsDashboard />}
            {activeTab === 'menu' && <MenuManagement />}
            {activeTab === 'tables' && <TableManagement />}
            {activeTab === 'qr' && <QRGenerator />}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default ManagerDashboard;
