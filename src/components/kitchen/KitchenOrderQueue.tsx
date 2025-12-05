import { KitchenOrderCard } from './KitchenOrderCard';
import { Order, OrderStatus } from '@/lib/api/orders.api';

interface KitchenOrderQueueProps {
  title: string;
  orders: Order[];
  onAdvance: (orderId: string, currentStatus: OrderStatus) => void;
}

export const KitchenOrderQueue = ({ title, orders, onAdvance }: KitchenOrderQueueProps) => {
  return (
    <div className="flex-1 min-w-[320px] max-w-[600px]">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border px-4 py-3">
        <h3 className="text-2xl font-bold">{title}</h3>
      </div>
      <div className="space-y-4 p-4 overflow-y-auto max-h-[calc(100vh-64px)]">
        {orders.map((order) => (
          <KitchenOrderCard
            key={order._id}
            order={order}
            onStatusChange={(next) => onAdvance(order._id, order.status)}
            onAlert={(issue) => {
              // TODO: emit kitchen issue via socket
              console.warn('Kitchen issue:', issue, order._id);
            }}
          />
        ))}
        {orders.length === 0 && (
          <div className="text-center text-muted-foreground py-12 text-xl">No orders</div>
        )}
      </div>
    </div>
  );
};
