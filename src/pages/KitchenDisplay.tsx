import { useEffect } from 'react';
import { useKitchenOrders } from '@/hooks/useKitchenOrders';
import { KitchenOrderQueue } from '@/components/kitchen/KitchenOrderQueue';
import { KitchenSettings } from '@/components/kitchen/KitchenSettings';
import { useOrderMutations } from '@/hooks/useOrderMutations';

const requestFullscreen = () => {
  const el = document.documentElement as any;
  if (el.requestFullscreen) el.requestFullscreen();
  else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  else if (el.msRequestFullscreen) el.msRequestFullscreen();
};

const KitchenDisplay = () => {
  const { columns, isLoading } = useKitchenOrders();
  const { advanceOrderStatus } = useOrderMutations();

  useEffect(() => {
    document.body.classList.add('dark');
    return () => document.body.classList.remove('dark');
  }, []);

  const onAdvance = async (orderId: string, currentStatus: any) => {
    await advanceOrderStatus(orderId, currentStatus);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 flex items-center justify-between p-4 border-b border-border bg-background/80 backdrop-blur">
        <h1 className="text-3xl font-bold">Kitchen Display</h1>
        <KitchenSettings onToggleFullscreen={requestFullscreen} />
      </header>

      {isLoading ? (
        <div className="p-6 text-center text-xl">Loading orders...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
          <KitchenOrderQueue title="New Orders" orders={columns.new} onAdvance={onAdvance} />
          <KitchenOrderQueue title="In Progress" orders={columns.progress} onAdvance={onAdvance} />
          <KitchenOrderQueue title="Ready" orders={columns.ready} onAdvance={onAdvance} />
        </div>
      )}
    </div>
  );
};

export default KitchenDisplay;
