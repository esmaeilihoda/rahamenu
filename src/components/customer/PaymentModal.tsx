import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CreditCard, Banknote, Loader2 } from 'lucide-react';
import { paymentAPI } from '@/lib/api/payment.api';
import { toast } from 'sonner';
import { formatToman } from '@/lib/utils';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  totalAmount: number;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, orderId, totalAmount }) => {
  const [selectedMethod, setSelectedMethod] = useState<'online' | 'counter' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const formatT = (amount: number) => formatToman(amount);

  const handlePayOnline = async () => {
    try {
      setIsProcessing(true);
      const { gatewayUrl } = await paymentAPI.requestPayment(orderId);
      window.location.href = gatewayUrl;
    } catch (error: any) {
      console.error('Payment request failed:', error);
      toast.error(error.response?.data?.error?.message || 'خطا در برقراری ارتباط با درگاه پرداخت');
      setIsProcessing(false);
    }
  };

  const handlePayAtCounter = async () => {
    try {
      setIsProcessing(true);
      await paymentAPI.markPayAtCounter(orderId);
      toast.success('سفارش شما ثبت شد. لطفاً در پیشخوان پرداخت کنید.');
      onClose();
    } catch (error: any) {
      console.error('Counter payment failed:', error);
      toast.error('خطا در ثبت سفارش');
      setIsProcessing(false);
    }
  };

  const handleProceed = () => {
    if (selectedMethod === 'online') handlePayOnline();
    else if (selectedMethod === 'counter') handlePayAtCounter();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">انتخاب روش پرداخت</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-muted rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">مبلغ قابل پرداخت</p>
            <p className="text-2xl font-bold">{formatT(totalAmount)}</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setSelectedMethod('online')}
              className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${selectedMethod === 'online' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
            >
              <CreditCard className="h-6 w-6 text-primary" />
              <div className="text-right flex-1">
                <p className="font-semibold">پرداخت آنلاین</p>
                <p className="text-sm text-muted-foreground">با کارت بانکی</p>
              </div>
            </button>

            <button
              onClick={() => setSelectedMethod('counter')}
              className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${selectedMethod === 'counter' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
            >
              <Banknote className="h-6 w-6 text-primary" />
              <div className="text-right flex-1">
                <p className="font-semibold">پرداخت در پیشخوان</p>
                <p className="text-sm text-muted-foreground">پرداخت حضوری</p>
              </div>
            </button>
          </div>

          <Button onClick={handleProceed} disabled={!selectedMethod || isProcessing} className="w-full" size="lg">
            {isProcessing ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />در حال پردازش...</>) : ('تایید و ادامه')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
