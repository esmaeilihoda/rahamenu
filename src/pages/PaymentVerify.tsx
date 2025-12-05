import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { paymentAPI } from '@/lib/api/payment.api';

export const PaymentVerify: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    verifyPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verifyPayment = async () => {
    try {
      const orderId = searchParams.get('orderId');
      const authority = searchParams.get('Authority');
      const statusParam = searchParams.get('Status');

      if (!orderId || !authority || statusParam !== 'OK') {
        setStatus('failed');
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
      const orderData = await paymentAPI.checkPaymentStatus(orderId);
      if (orderData.paymentStatus === 'paid') {
        setStatus('success');
        setOrder(orderData);
      } else {
        setStatus('failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setStatus('failed');
    }
  };

  const formatRial = (amount: number) => new Intl.NumberFormat('fa-IR').format(amount) + ' ریال';

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Card className="p-8 max-w-md w-full text-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">در حال تایید پرداخت...</h2>
          <p className="text-muted-foreground">لطفاً صبر کنید</p>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-background p-4" dir="rtl">
        <Card className="p-8 max-w-md w-full text-center space-y-6">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
          <div>
            <h2 className="text-3xl font-bold text-green-700 mb-2">پرداخت موفق!</h2>
            <p className="text-muted-foreground">سفارش شما با موفقیت ثبت شد</p>
          </div>
          {order && (
            <div className="bg-muted rounded-lg p-4 space-y-2 text-right">
              <div className="flex justify-between"><span className="text-muted-foreground">شماره سفارش:</span><span className="font-mono">#{order._id.slice(-6)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">مبلغ:</span><span className="font-semibold">{formatRial(order.totalAmount)}</span></div>
              {order.payment?.refId && (
                <div className="flex justify-between"><span className="text-muted-foreground">کد پیگیری:</span><span className="font-mono text-sm">{order.payment.refId}</span></div>
              )}
            </div>
          )}
          <div className="space-y-2">
            <Button onClick={() => navigate('/customer')} className="w-full" size="lg">بازگشت به منو</Button>
            {order && (
              <Button onClick={() => navigate(`/order-tracking/${order._id}`)} variant="outline" className="w-full">پیگیری سفارش</Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-background p-4" dir="rtl">
      <Card className="p-8 max-w-md w-full text-center space-y-6">
        <XCircle className="h-20 w-20 text-red-500 mx-auto" />
        <div>
          <h2 className="text-3xl font-bold text-red-700 mb-2">پرداخت ناموفق</h2>
          <p className="text-muted-foreground">متأسفانه پرداخت شما انجام نشد</p>
        </div>
        <div className="bg-muted rounded-lg p-4 text-right">
          <p className="text-sm">ممکن است به دلایل زیر پرداخت ناموفق باشد:</p>
          <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
            <li>لغو پرداخت توسط کاربر</li>
            <li>عدم موجودی کافی</li>
            <li>خطا در اطلاعات کارت</li>
          </ul>
        </div>
        <div className="space-y-2">
          <Button onClick={() => navigate('/customer')} className="w-full" size="lg">بازگشت به منو</Button>
          <Button onClick={() => window.location.reload()} variant="outline" className="w-full">تلاش مجدد</Button>
        </div>
      </Card>
    </div>
  );
};
