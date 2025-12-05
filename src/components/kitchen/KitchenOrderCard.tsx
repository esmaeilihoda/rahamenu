import { Order, OrderStatus } from '@/lib/api/orders.api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PrepTimer } from './PrepTimer';
import { formatDistanceToNow } from 'date-fns';

interface KitchenOrderCardProps {
  order: Order;
  onStatusChange: (status: OrderStatus) => void;
  onAlert: (issue: string) => void;
}

export const KitchenOrderCard = ({ order, onStatusChange, onAlert }: KitchenOrderCardProps) => {
  const minutesElapsed = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000);
  const urgencyColor = minutesElapsed < 10 ? 'border-green-500' : minutesElapsed < 15 ? 'border-yellow-500' : 'border-red-500';

  const handleAdvance = () => {
    const next: Record<OrderStatus, OrderStatus | null> = {
      pending: null,
      confirmed: 'preparing',
      preparing: 'ready',
      ready: null,
      served: null,
      cancelled: null,
    };
    const nextStatus = next[order.status];
    if (nextStatus) onStatusChange(nextStatus);
  };

  return (
    <Card
      className={`p-6 bg-background/70 border-4 ${urgencyColor} min-h-[200px] cursor-pointer select-none`}
      onClick={handleAdvance}
      onContextMenu={(e) => {
        e.preventDefault();
        onAlert('Issue reported by kitchen');
      }}
    >
      <div className="flex items-start justify-between">
        <div className="text-5xl font-extrabold">Table {order.tableNumber}</div>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          {order.status.toUpperCase()}
        </Badge>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        {order.items.map((item, idx) => (
          <div key={idx} className="text-xl">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{item.quantity}x</span>
              <span className="font-semibold">{item.name}</span>
            </div>
            {item.customizations && item.customizations.length > 0 && (
              <div className="mt-1 text-yellow-400 text-lg">
                * {item.customizations.join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>

      {order.customerNotes && (
        <div className="mt-4 bg-yellow-100 text-yellow-900 p-3 rounded text-xl">
          Note: {order.customerNotes}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <PrepTimer startTime={new Date(order.createdAt)} targetMinutes={10} />
        <div className="text-muted-foreground text-lg">
          {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
        </div>
      </div>
    </Card>
  );
};
