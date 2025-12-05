import { useState } from 'react';
import { Order } from '@/lib/api/orders.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OrderStatusBadge } from './OrderStatusBadge';
import { useOrderMutations } from '@/hooks/useOrderMutations';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, ChefHat, Bell, Check, Loader2 } from 'lucide-react';
import { paymentAPI } from '@/lib/api/payment.api';
import { formatToman, formatTimeDistancePersian } from '@/lib/utils';
import { useOptions } from '@/context/OptionsContext';

interface OrderCardProps {
  order: Order;
  onClick: () => void;
}

export const OrderCard = ({ order, onClick }: OrderCardProps) => {
  const { config } = useOptions();
  const { advanceOrderStatus, cancelOrder, isUpdating } = useOrderMutations();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isAdvancing, setIsAdvancing] = useState(false);

  // Calculate time elapsed
  const timeElapsed = formatTimeDistancePersian(order.createdAt);
  const minutesElapsed = Math.floor(
    (Date.now() - new Date(order.createdAt).getTime()) / 1000 / 60
  );
  const isUrgent = minutesElapsed > 15 && order.status !== 'served';

  // Handle status advancement
  const handleAdvance = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdvancing(true);
    await advanceOrderStatus(order._id, order.status);
    setIsAdvancing(false);
  };

  // Handle order cancellation
  const handleCancel = async () => {
    if (!cancelReason.trim()) return;
    
    const success = await cancelOrder(order._id, cancelReason);
    if (success) {
      setShowCancelDialog(false);
      setCancelReason('');
    }
  };

  // Get action buttons based on status
  const getActionButtons = () => {
    if (order.status === 'served' || order.status === 'cancelled') {
      return null;
    }

    const buttons: Record<string, { label: string; icon: React.ReactNode }> = {
      pending: { label: 'تایید سفارش', icon: <CheckCircle2 className="h-4 w-4" /> },
      confirmed: { label: 'شروع آماده‌سازی', icon: <ChefHat className="h-4 w-4" /> },
      preparing: { label: 'آماده شد', icon: <Bell className="h-4 w-4" /> },
      ready: { label: 'سرو شد', icon: <Check className="h-4 w-4" /> },
    };

    const button = buttons[order.status];
    if (!button) return null;

    const showConfirmPayment = order.payment && order.payment.method === 'counter' && order.paymentStatus === 'pending_payment';
    return (
      <div className="flex gap-2" dir="rtl">
        <Button
          onClick={handleAdvance}
          disabled={isUpdating || isAdvancing}
          className="flex-1"
        >
          {isAdvancing ? (
            <Loader2 className="h-4 w-4 animate-spin ml-2" />
          ) : (
            <span className="flex items-center gap-2">
              {button.icon}
              {button.label}
            </span>
          )}
        </Button>

        {showConfirmPayment && (
          <Button
            variant="outline"
            onClick={async (e) => {
              e.stopPropagation();
              try {
                await paymentAPI.confirmCounterPayment(order._id);
              } catch (err) {
                // Optionally surface toast in parent list
              }
            }}
            disabled={isUpdating}
          >
            تایید پرداخت
          </Button>
        )}
        
        {(order.status === 'pending' || order.status === 'confirmed') && (
          <Button
            variant="destructive"
            onClick={(e) => {
              e.stopPropagation();
              setShowCancelDialog(true);
            }}
            disabled={isUpdating}
          >
            <XCircle className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  };

  // Compute milk surcharge per item
  const getMilkSurcharge = (milk?: string) => {
    if (!milk) return 0;
    const val = config.milkSurcharges[milk as keyof typeof config.milkSurcharges];
    return typeof val === 'number' ? val : 0;
  };

  // Compute item subtotal including surcharges
  const getItemSubtotal = (item: Order['items'][number]) => {
    const base = (item.price || 0) * item.quantity;
    const milkExtra = getMilkSurcharge(item.customizations?.milk) * item.quantity;
    return base + milkExtra;
  };

  // Compute displayed total including surcharges (defensive if backend total excludes extras)
  const computedTotal = order.items.reduce((acc, item) => acc + getItemSubtotal(item), 0);
  const displayTotal = computedTotal || order.totalAmount;

  return (
    <>
      <Card
        onClick={onClick}
        className={`cursor-pointer transition-all hover:shadow-lg ${
          isUrgent ? 'border-red-500 border-2' : ''
        }`}
        dir="rtl"
      >
        <CardHeader className="pb-3" dir="rtl">
          <div className="flex items-start justify-between flex-row-reverse gap-2">
            <div className="flex-shrink-0">
              <OrderStatusBadge status={order.status} />
            </div>
            <div className="flex-1">
              <CardTitle className="text-3xl font-bold">
                میز {order.tableNumber}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{timeElapsed}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4" dir="rtl">
          {/* Order Items */}
          <div className="space-y-2" dir="rtl">
            {order.items.slice(0, 3).map((item, index) => (
              <div key={index} className="flex justify-between text-sm flex-row-reverse gap-2" dir="rtl">
                <span className="flex-1">
                  {item.quantity}x {item.name}
                  {/* Customization badges */}
                  {(item.customizations?.milk || 
                    typeof item.customizations?.sweetness === 'number' || 
                    (item.customizations?.addOns && item.customizations.addOns.length > 0) ||
                    getMilkSurcharge(item.customizations?.milk) > 0) && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {item.customizations?.milk && (
                        <span className="inline-block text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                          شیر: {item.customizations.milk === 'oat' ? 'جو دوسر' : item.customizations.milk === 'almond' ? 'بادام' : item.customizations.milk}
                        </span>
                      )}
                      {typeof item.customizations?.sweetness === 'number' && (
                        <span className="inline-block text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                          شیرینی: {item.customizations.sweetness}
                        </span>
                      )}
                      {item.customizations?.addOns && item.customizations.addOns.length > 0 && (
                        <span className="inline-block text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                          افزودنی: {item.customizations.addOns.join('، ')}
                        </span>
                      )}
                      {/* Surcharge badge */}
                      {getMilkSurcharge(item.customizations?.milk) > 0 && (
                        <span className="inline-block text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                          + {formatToman(getMilkSurcharge(item.customizations?.milk))} شیر
                        </span>
                      )}
                    </div>
                  )}
                </span>
                <span className="font-medium whitespace-nowrap flex-shrink-0">{formatToman(getItemSubtotal(item))}</span>
              </div>
            ))}
            {order.items.length > 3 && (
              <p className="text-xs text-muted-foreground">
                {order.items.length - 3}+ مورد دیگر
              </p>
            )}
          </div>

          {/* Customer Notes */}
          {order.customerNotes && (
            <div className="bg-muted p-2 rounded text-sm">
              <p className="text-muted-foreground text-xs">یادداشت:</p>
              <p>{order.customerNotes}</p>
            </div>
          )}

          {/* Total */}
          <div className="flex justify-between items-center pt-2 border-t flex-row-reverse" dir="rtl">
            <span className="text-xl font-bold">{formatToman(displayTotal)}</span>
            <span className="font-semibold">جمع کل</span>
          </div>

          {/* Action Buttons */}
          {getActionButtons()}

          {/* Urgency Indicator */}
          {isUrgent && (
            <p className="text-xs text-red-500 font-medium text-center">
              ⚠️ سفارش بیش از ۱۵ دقیقه در انتظار است
            </p>
          )}
        </CardContent>
      </Card>

      {/* Cancel Order Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>لغو سفارش</AlertDialogTitle>
            <AlertDialogDescription>
              لطفاً دلیل لغو سفارش را مشخص کنید. مشتری ممکن است مطلع شود.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2">
            <Label htmlFor="cancelReason">دلیل لغو</Label>
            <Input
              id="cancelReason"
              placeholder="مثلاً: موجود نیست، درخواست مشتری..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>

          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel onClick={() => setCancelReason('')}>
              نگه داشتن سفارش
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={!cancelReason.trim() || isUpdating}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin ml-2" />
              ) : null}
              لغو سفارش
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
