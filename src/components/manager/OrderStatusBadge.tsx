import { Badge } from '@/components/ui/badge';
import { OrderStatus } from '@/lib/api/orders.api';
import { Clock, CheckCircle2, ChefHat, Bell, Check, XCircle } from 'lucide-react';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export const OrderStatusBadge = ({ status, className = '' }: OrderStatusBadgeProps) => {
  const statusConfig: Record<
    OrderStatus,
    { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }
  > = {
    pending: {
      label: 'Pending',
      variant: 'outline',
      icon: <Clock className="h-3 w-3" />,
    },
    confirmed: {
      label: 'Confirmed',
      variant: 'secondary',
      icon: <CheckCircle2 className="h-3 w-3" />,
    },
    preparing: {
      label: 'Preparing',
      variant: 'default',
      icon: <ChefHat className="h-3 w-3" />,
    },
    ready: {
      label: 'Ready',
      variant: 'default',
      icon: <Bell className="h-3 w-3" />,
    },
    served: {
      label: 'Served',
      variant: 'secondary',
      icon: <Check className="h-3 w-3" />,
    },
    cancelled: {
      label: 'Cancelled',
      variant: 'destructive',
      icon: <XCircle className="h-3 w-3" />,
    },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={`flex items-center gap-1 ${className}`}>
      {config.icon}
      <span>{config.label}</span>
    </Badge>
  );
};
