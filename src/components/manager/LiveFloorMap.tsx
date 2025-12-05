import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, Bell, Check, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { TableData, initialTables } from '@/data/menuData';
import { useToast } from '@/hooks/use-toast';
import { useTableUpdates } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/lib/api';

const LiveFloorMap = () => {
  const [tables, setTables] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();
  const { restaurantId } = useAuth();

  // Fetch initial table data from API
  useEffect(() => {
    const fetchTables = async () => {
      if (!restaurantId) return;

      try {
        setIsLoading(true);
        const { data } = await apiClient.get(`/tables`);
        console.log('📋 Fetched tables:', data.data);
        setTables(data.data || []);
      } catch (error: any) {
        console.error('Failed to fetch tables:', error);
        toast({
          title: 'خطا در بارگذاری میزها',
          description: error.response?.data?.error || 'لطفا دوباره تلاش کنید',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTables();
  }, [restaurantId, toast]);

  // Subscribe to real-time table updates
  const { isConnected: socketConnected } = useTableUpdates((data) => {
    console.log('📡 Table update received:', data);

    if (data.table) {
      // Update specific table by matching _id or tableNumber
      setTables((prev) =>
        prev.map((table) =>
          (table._id === data.table._id || table.tableNumber === data.table.tableNumber)
            ? { ...table, ...data.table }
            : table
        )
      );
    }

    if (data.tableNumber) {
      // Handle alert notifications
      if (data.message) {
        toast({
          title: '🔔 درخواست کمک',
          description: data.message,
        });
      }
      
      // Update table status to alert if not already in tables
      setTables((prev) => {
        const existingTable = prev.find(t => t.tableNumber === data.tableNumber);
        if (existingTable && existingTable.status !== 'alert') {
          return prev.map(t => 
            t.tableNumber === data.tableNumber 
              ? { ...t, status: 'alert', lastActivity: new Date() }
              : t
          );
        }
        return prev;
      });
    }
  });

  useEffect(() => {
    setIsConnected(socketConnected);
  }, [socketConnected]);

  const getStatusInfo = (status: TableData['status']) => {
    switch (status) {
      case 'empty':
        return { color: 'status-empty', label: 'خالی' };
      case 'browsing':
        return { color: 'status-browsing', label: 'در حال مرور' };
      case 'ordered':
        return { color: 'status-ordered', label: 'سفارش داده' };
      case 'alert':
        return { color: 'status-alert', label: 'نیاز به توجه' };
    }
  };

  const handleResolveAlert = async (tableMongoId: string, tableNumber: number) => {
    console.log('🔔 Resolving alert for table:', tableNumber, 'ID:', tableMongoId);
    try {
      // Call backend to update table status
      await apiClient.patch(`/tables/${tableMongoId}/status`, {
        status: 'ordered',
        alertType: undefined,
      });
      console.log('✅ Alert resolved successfully');
      
      // Update local state
      setTables(prev => prev.map(table => 
        table._id === tableMongoId ? { ...table, status: 'ordered', alertType: undefined } : table
      ));
      
      toast({
        title: `میز ${tableNumber} رسیدگی شد`,
        description: "هشدار برطرف شد.",
      });
    } catch (error: any) {
      console.error('Failed to resolve alert:', error);
      toast({
        title: 'خطا در رسیدگی به هشدار',
        description: error.response?.data?.error || 'لطفا دوباره تلاش کنید',
        variant: 'destructive',
      });
    }
  };

  const handleMarkEmpty = async (tableMongoId: string, tableNumber: number) => {
    console.log('💵 Marking table as empty (paid and left):', tableNumber);
    try {
      await apiClient.patch(`/tables/${tableMongoId}/status`, {
        status: 'empty',
        guests: undefined,
        alertType: undefined,
      });
      
      setTables(prev => prev.map(table => 
        table._id === tableMongoId ? { ...table, status: 'empty', guests: undefined, alertType: undefined } : table
      ));
      
      toast({
        title: `میز ${tableNumber} خالی شد`,
        description: "میز آماده میهمان جدید است.",
      });
    } catch (error: any) {
      console.error('Failed to mark table as empty:', error);
      toast({
        title: 'خطا در تغییر وضعیت میز',
        description: error.response?.data?.error || 'لطفا دوباره تلاش کنید',
        variant: 'destructive',
      });
    }
  };

  const alertCount = tables.filter(t => t.status === 'alert').length;

  return (
    <div dir="rtl">
      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4 mb-8" dir="rtl">
        {[
          { label: 'خالی', count: tables.filter(t => t.status === 'empty').length, color: 'bg-status-empty' },
          { label: 'در حال مرور', count: tables.filter(t => t.status === 'browsing').length, color: 'bg-status-browsing' },
          { label: 'سفارش داده', count: tables.filter(t => t.status === 'ordered').length, color: 'bg-status-ordered' },
          { label: 'هشدار', count: alertCount, color: 'bg-status-alert' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            className="glass-card p-4 rounded-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${stat.color}`} />
              <span className="text-muted-foreground text-sm">{stat.label}</span>
            </div>
            <p className="text-3xl font-bold mt-2">{stat.count}</p>
          </motion.div>
        ))}
      </div>

      {/* Floor Map Grid */}
      <div className="glass-card p-6 rounded-2xl" dir="rtl">
        <div className="flex items-center justify-between mb-6 flex-row-reverse" dir="rtl">
          <h3 className="font-serif text-xl flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-alert opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-status-alert"></span>
            </span>
            نمای زنده سالن
          </h3>

          {/* Connection Status Indicator */}
          <div className="flex items-center gap-2 text-sm">
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-green-500" />
                <span className="text-green-500">متصل</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-destructive" />
                <span className="text-destructive">قطع ارتباط</span>
              </>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="mr-3 text-muted-foreground">در حال بارگذاری...</span>
          </div>
        ) : null}

        <div className="grid grid-cols-4 gap-4" dir="rtl">
          {tables.map((table, index) => {
            const { color } = getStatusInfo(table.status);
            const isAlert = table.status === 'alert';
            
            return (
              <motion.div
                key={table._id || table.tableNumber}
                className={`relative aspect-square rounded-2xl ${color} p-4 transition-all hover:scale-105 ${
                  isAlert ? 'cursor-pointer ring-2 ring-red-500 ring-offset-2' : 'cursor-default'
                }`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  console.log('🖱️ Clicked table:', table.tableNumber, 'Status:', table.status, 'ID:', table._id);
                  if (isAlert && table._id) {
                    handleResolveAlert(table._id, table.tableNumber);
                  }
                }}
              >
                <div className="h-full flex flex-col justify-between text-foreground">
                  <div className="flex justify-between items-start">
                    <span className="text-2xl font-bold">{table.tableNumber}</span>
                    {table.status === 'alert' && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                      >
                        <Bell className="w-5 h-5" />
                      </motion.div>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    {table.guests && (
                      <div className="flex items-center gap-1 text-sm">
                        <Users className="w-3 h-3" />
                        <span>{table.guests}</span>
                      </div>
                    )}
                    {table.lastActivity && (
                      <div className="flex items-center gap-1 text-xs opacity-80">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(table.lastActivity).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    )}
                    {table.status === 'alert' && (
                      <div className="flex flex-col gap-1 mt-2">
                        <div className="flex items-center gap-1 text-xs bg-foreground/20 rounded-full px-2 py-1">
                          <Bell className="w-3 h-3" />
                          <span>
                            {table.alertType === 'water' && 'نیاز به آب'}
                            {table.alertType === 'bill' && 'درخواست صورتحساب'}
                            {(!table.alertType || table.alertType === 'waiter') && 'صدا زدن گارسون'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs bg-green-500/20 rounded-full px-2 py-1">
                          <Check className="w-3 h-3" />
                          <span>کلیک برای رسیدگی</span>
                        </div>
                      </div>
                    )}
                    {(table.status === 'ordered' || table.status === 'browsing') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkEmpty(table._id, table.tableNumber);
                        }}
                        className="w-full mt-2 flex items-center justify-center gap-1 text-xs bg-blue-500/20 hover:bg-blue-500/30 rounded-full px-2 py-1 transition-colors"
                      >
                        <Check className="w-3 h-3" />
                        <span>پرداخت و خروج</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LiveFloorMap;
