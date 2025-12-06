import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Download, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import QRCodeLib from 'qrcode';

const QRGenerator = () => {
  const [tableNumber, setTableNumber] = useState('');
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const { toast } = useToast();

  // Get the production URL - use env var if available, otherwise use window.location.origin
  const getBaseUrl = () => {
    const envUrl = import.meta.env.VITE_PRODUCTION_URL;
    if (envUrl) return envUrl;
    
    // For production (Vercel), use the domain from window.location
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return `${window.location.protocol}//${window.location.host}`;
    }
    // For development, default to localhost
    return 'http://localhost:5173';
  };

  // Generate QR code whenever table number changes
  useEffect(() => {
    if (tableNumber) {
      const baseUrl = getBaseUrl();
      const customerUrl = `${baseUrl}/demo-cafe/customer?table=${tableNumber}`;
      QRCodeLib.toDataURL(customerUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })
        .then(url => setQrCodeUrl(url))
        .catch(err => console.error('QR generation error:', err));
    } else {
      setQrCodeUrl('');
    }
  }, [tableNumber]);

  const handleCopy = () => {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/demo-cafe/customer?table=${tableNumber}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast({
      title: "لینک کپی شد!",
      description: "آدرس منو در کلیپ‌بورد کپی شد.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!qrCodeUrl) return;
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `table-${tableNumber}-qr.png`;
    link.click();
    toast({
      title: "دانلود شد!",
      description: `QR میز ${tableNumber} دانلود شد.`,
    });
  };

  return (
    <div className="max-w-2xl mx-auto" dir="rtl">
      <motion.div
        className="glass-card p-8 rounded-2xl text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        dir="rtl"
      >
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
          <QrCode className="w-8 h-8 text-primary" />
        </div>
        
        <h2 className="font-serif text-2xl mb-2">ساخت کد QR میز</h2>
        <p className="text-muted-foreground mb-8">
          شماره میز را وارد کنید تا کد QR اختصاصی برای مشتریان ساخته شود
        </p>

        {/* Table Number Input */}
        <div className="relative max-w-xs mx-auto mb-8">
          <input
            type="number"
            placeholder="شماره میز"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            className="w-full text-center text-4xl font-bold py-4 rounded-xl bg-muted border-2 border-border focus:border-primary focus:outline-none transition-colors"
            min="1"
            max="99"
          />
        </div>

        {/* QR Code Display */}
        <AnimatePresence>
          {tableNumber && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="space-y-6"
              dir="rtl"
            >
              {/* Real QR Code */}
              <div className="mx-auto bg-white rounded-2xl p-6 inline-block shadow-xl">
                {qrCodeUrl ? (
                  <img 
                    src={qrCodeUrl} 
                    alt={`QR Code for Table ${tableNumber}`}
                    className="w-64 h-64"
                  />
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                )}
                <div className="text-center mt-4 text-black font-bold text-lg">
                  میز {tableNumber}
                </div>
              </div>

              {/* URL Display */}
              <div className="bg-muted rounded-xl p-4 flex items-center gap-4 max-w-md mx-auto">
                <code className="flex-1 text-sm text-muted-foreground truncate" dir="ltr">
                  {getBaseUrl()}/demo-cafe/customer?table={tableNumber}
                </code>
                <button
                  onClick={handleCopy}
                  className="p-2 rounded-lg hover:bg-primary/20 transition-colors"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-status-empty" />
                  ) : (
                    <Copy className="w-5 h-5 text-primary" />
                  )}
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-4 justify-center flex-row-reverse" dir="rtl">
                <motion.button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Download className="w-5 h-5" />
                  دانلود PNG
                </motion.button>
                <motion.button
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-muted text-foreground font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  چاپ QR
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!tableNumber && (
          <div className="text-muted-foreground py-12">
            <QrCode className="w-24 h-24 mx-auto opacity-20 mb-4" />
            <p>شماره میز را در بالا وارد کنید تا کد QR ساخته شود</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default QRGenerator;
