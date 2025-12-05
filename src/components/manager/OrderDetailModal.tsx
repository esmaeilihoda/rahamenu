import { Order } from '@/lib/api/orders.api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { OrderStatusBadge } from './OrderStatusBadge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Printer, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useOptions } from '@/context/OptionsContext';

interface OrderDetailModalProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const OrderDetailModal = ({ order, open, onOpenChange }: OrderDetailModalProps) => {
  if (!order) return null;
  const { config } = useOptions();

  const handlePrint = () => {
    const toPersianNum = (n: number) => n.toString().replace(/\d/g, (d) => String.fromCharCode(1776 + parseInt(d)));
    const formatToman = (amount: number) => `${toPersianNum(Math.floor(amount))} تومان`;
    const statusFa: Record<string, string> = {
      pending: 'در انتظار',
      confirmed: 'تایید شده',
      preparing: 'در حال آماده‌سازی',
      ready: 'آماده',
      served: 'سرو شده',
      cancelled: 'لغو شده'
    };
    // Compute grand total including surcharges
    const grandTotal = order.items.reduce((acc, item) => {
      const milkType = (item.customizations as any)?.milk as string | undefined;
      const milkExtra = milkType ? (config.milkSurcharges as any)[milkType] ?? 0 : 0;
      const subtotal = Math.floor(((item.price || 0) + milkExtra) * item.quantity);
      return acc + subtotal;
    }, 0);

    // Create printable content
    const printContent = `
      <html>
        <head>
          <title>سفارش #${toPersianNum(parseInt(order._id.slice(-6), 16))}</title>
          <style>
            body { font-family: 'Tahoma', 'Arial', sans-serif; padding: 20px; direction: rtl; text-align: right; }
            h1 { text-align: center; }
            .header { margin-bottom: 20px; }
            .items { margin: 20px 0; }
            .item { display: flex; justify-content: space-between; margin: 10px 0; }
            .total { font-size: 18px; font-weight: bold; text-align: left; margin-top: 20px; }
            .divider { border-top: 2px dashed #000; margin: 15px 0; }
          </style>
        </head>
        <body>
          <h1>رسید سفارش</h1>
          <div class="header">
            <p><strong>شماره سفارش:</strong> #${toPersianNum(parseInt(order._id.slice(-6), 16))}</p>
            <p><strong>میز:</strong> ${toPersianNum(order.tableNumber)}</p>
            <p><strong>زمان:</strong> ${new Date(order.createdAt).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            <p><strong>وضعیت:</strong> ${statusFa[order.status] || order.status}</p>
          </div>
          <div class="divider"></div>
          <div class="items">
            ${order.items
              .map((item) => {
                const milkExtra = item.customizations && (item.customizations as any).milk && (((item.customizations as any).milk === 'oat') || ((item.customizations as any).milk === 'almond')) ? 20000 : 0;
                const subtotal = Math.floor((item.price + milkExtra) * item.quantity);
                const milkLabel = (item.customizations as any)?.milk === 'oat' ? 'شیر جو' : (item.customizations as any)?.milk === 'almond' ? 'شیر بادام' : (item.customizations as any)?.milk === 'dairy' ? 'شیر معمولی' : '';
                const customText = item.customizations && typeof item.customizations === 'object'
                  ? Object.entries(item.customizations).filter(([k,v]) => v).map(([k,v]) => Array.isArray(v) ? v.join('، ') : v).join('، ')
                  : '';
                return `
              <div class="item">
                <span>${toPersianNum(item.quantity)}× ${item.name}${milkLabel ? ` — ${milkLabel}${milkExtra ? ` (+${toPersianNum(20000)} تومان)` : ''}` : ''}</span>
                <span>${formatToman(subtotal)}</span>
              </div>
              ${customText ? `<div style="margin-right: 20px; font-size: 12px;">* ${customText}</div>` : ''}
              ${item.notes ? `<div style="margin-right: 20px; font-size: 12px; font-style: italic;">یادداشت: ${item.notes}</div>` : ''}
            `;
              })
              .join('')}
          </div>
          <div class="divider"></div>
          ${order.customerNotes ? `<p><strong>یادداشت مشتری:</strong> ${order.customerNotes}</p><div class="divider"></div>` : ''}
          <div class="total">جمع کل: ${formatToman(grandTotal)}</div>
        </body>
      </html>
    `;

    // Open print window
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader dir="rtl">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 text-right">
              <DialogTitle className="text-2xl">
                سفارش #{parseInt(order._id.slice(-6), 16).toString().replace(/\d/g, (d) => String.fromCharCode(1776 + parseInt(d)))}
              </DialogTitle>
              <DialogDescription dir="rtl" className="text-right">
                میز {order.tableNumber.toString().replace(/\d/g, (d) => String.fromCharCode(1776 + parseInt(d)))} • {new Date(order.createdAt).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </DialogDescription>
            </div>
            <div className="flex-shrink-0">
              <OrderStatusBadge status={order.status} />
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6" dir="rtl">
          {/* Timing Information */}
          <div className="flex items-center gap-4 text-sm flex-col sm:flex-row" dir="rtl">
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {new Date(order.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-muted-foreground">:ایجاد شده</span>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <Separator orientation="vertical" className="h-4 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {new Date(order.updatedAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-muted-foreground">:آخرین به‌روزرسانی</span>
            </div>
          </div>

          <Separator />

          {/* Order Items */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">آیتم‌های سفارش</h3>
            <div className="space-y-3">
              {order.items.map((item, index) => {
                const milkExtra = item.customizations?.milk ? (config.milkSurcharges as any)[item.customizations.milk] ?? 0 : 0;
                const itemSubtotal = Math.floor((item.price + milkExtra) * item.quantity);
                const qtyFa = item.quantity.toString().replace(/\d/g, (d) => String.fromCharCode(1776 + parseInt(d)));
                const tomanFa = itemSubtotal.toString().replace(/\d/g, (d) => String.fromCharCode(1776 + parseInt(d)));
                const sweetnessFa = (item.customizations?.sweetness ?? undefined) !== undefined ? (item.customizations!.sweetness as number).toString().replace(/\d/g, (d) => String.fromCharCode(1776 + parseInt(d))) : undefined;
                const milkLabel = item.customizations?.milk === 'oat' ? 'شیر جو' : item.customizations?.milk === 'almond' ? 'شیر بادام' : item.customizations?.milk === 'dairy' ? 'شیر معمولی' : undefined;
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-start flex-row-reverse gap-2" dir="rtl">
                      <div className="flex-1">
                        <p className="font-medium">
                          {qtyFa}× {item.name}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-1" dir="rtl">
                          {milkLabel && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border bg-muted/60">
                              {milkLabel}
                              {milkExtra > 0 && <em className="not-italic text-[10px] text-muted-foreground">+{milkExtra.toString().replace(/\d/g, (d) => String.fromCharCode(1776 + parseInt(d)))} تومان</em>}
                            </span>
                          )}
                          {sweetnessFa && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs border bg-muted/60">
                              شیرینی: {sweetnessFa}٪
                            </span>
                          )}
                          {Array.isArray(item.customizations?.addOns) && item.customizations!.addOns!.length > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs border bg-muted/60">
                              افزودنی: {item.customizations!.addOns!.join('، ')}
                            </span>
                          )}
                        </div>
                        {item.notes && (
                          <p className="text-sm italic text-muted-foreground mt-1">
                            یادداشت: {item.notes}
                          </p>
                        )}
                      </div>
                      <span className="font-medium whitespace-nowrap flex-shrink-0">
                        {tomanFa} تومان
                      </span>
                    </div>
                    {index < order.items.length - 1 && <Separator className="mt-2" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer Notes */}
          {order.customerNotes && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">یادداشت مشتری</h3>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm">{order.customerNotes}</p>
                </div>
              </div>
            </>
          )}

          {/* Cancellation Reason */}
          {order.status === 'cancelled' && order.cancellationReason && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold text-lg text-destructive">
                  دلیل لغو
                </h3>
                <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
                  <p className="text-sm">{order.cancellationReason}</p>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Total */}
          <div className="flex justify-between items-center text-xl font-bold flex-row-reverse gap-2" dir="rtl">
            <span>{order.items.reduce((acc, item) => {
              const milkExtra = item.customizations?.milk ? (config.milkSurcharges as any)[item.customizations.milk] ?? 0 : 0;
              const subtotal = Math.floor(((item.price || 0) + milkExtra) * item.quantity);
              return acc + subtotal;
            }, 0).toString().replace(/\d/g, (d) => String.fromCharCode(1776 + parseInt(d)))} تومان</span>
            <span>جمع کل</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2" dir="rtl">
            <Button
              onClick={handlePrint}
              variant="outline"
              className="flex-1"
            >
              <Printer className="h-4 w-4 ml-2" />
              چاپ سفارش
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
