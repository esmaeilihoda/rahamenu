import { useState, useEffect } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { Order, OrderStatus } from '@/lib/api/orders.api';
import { OrderCard } from './OrderCard';
import { OrderDetailModal } from './OrderDetailModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Search, Wifi, WifiOff, Volume2, VolumeX } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSocket } from '@/hooks/useSocket';

export const OrderList = () => {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');
  const [searchTable, setSearchTable] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { orders, isLoading, error, refetch, getOrderCounts, getOrdersByStatus } = useOrders();
  const { isConnected } = useSocket();

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 10000);

    return () => clearInterval(interval);
  }, [refetch]);

  // Get order counts
  const counts = getOrderCounts();

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    // Filter by status
    if (selectedStatus !== 'all' && order.status !== selectedStatus) {
      return false;
    }

    // Filter by table number
    if (searchTable && !order.tableNumber.toString().includes(searchTable)) {
      return false;
    }

    return true;
  });

  // Sort by creation time (newest first)
  const sortedOrders = [...filteredOrders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header with filters and actions */}
      <div className="flex flex-col sm:flex-row-reverse justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">سفارشات</h2>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            <span className="text-sm text-muted-foreground">
              {isConnected ? 'زنده' : 'آفلاین'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'غیرفعال کردن صدا' : 'فعال کردن صدا'}
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </Button>

          {/* Table search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="جستجوی میز..."
              value={searchTable}
              onChange={(e) => setSearchTable(e.target.value)}
              className="pl-9 w-40"
            />
          </div>

          {/* Refresh button */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Status tabs */}
      <Tabs value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as OrderStatus | 'all')} dir="rtl">
        <TabsList className="grid grid-cols-6 w-full max-w-2xl" dir="rtl">
          <TabsTrigger value="all" className="relative">
            همه
            {counts.all > 0 && (
              <Badge variant="secondary" className="ml-2">
                {counts.all}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending" className="relative">
            در انتظار
            {counts.pending > 0 && (
              <Badge variant="destructive" className="ml-2">
                {counts.pending}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="confirmed">
            تایید شده
            {counts.confirmed > 0 && (
              <Badge variant="secondary" className="ml-2">
                {counts.confirmed}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="preparing">
            در حال آماده سازی
            {counts.preparing > 0 && (
              <Badge variant="secondary" className="ml-2">
                {counts.preparing}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="ready">
            آماده
            {counts.ready > 0 && (
              <Badge variant="default" className="ml-2">
                {counts.ready}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="served">سرو شده</TabsTrigger>
        </TabsList>

        {/* Orders grid */}
        <TabsContent value={selectedStatus} className="mt-6" dir="rtl">
          {sortedOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">سفارشی یافت نشد</p>
              <p className="text-sm text-muted-foreground mt-2">
                {searchTable
                  ? `سفارشی برای میز ${searchTable} یافت نشد`
                  : selectedStatus === 'all'
                  ? 'سفارشات اینجا نمایش داده می‌شوند'
                  : `سفارش ${selectedStatus === 'pending' ? 'در انتظار' : selectedStatus === 'confirmed' ? 'تایید شده' : selectedStatus === 'preparing' ? 'در حال آماده‌سازی' : selectedStatus === 'ready' ? 'آماده' : 'سرو شده'}ی وجود ندارد`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" dir="rtl">
              {sortedOrders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onClick={() => setSelectedOrder(order)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Order detail modal */}
      <OrderDetailModal
        order={selectedOrder}
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      />
    </div>
  );
};
