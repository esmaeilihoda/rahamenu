import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Smartphone, LayoutDashboard, Coffee } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', damping: 15 }}
          >
            <Coffee className="w-10 h-10 text-primary" />
          </motion.div>
          
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-4 text-gradient">
            منوی زنده
          </h1>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto">
            یک تجربه دیجیتال همه‌جانبه برای کافه مدرن.
            نمای دلخواهتان را انتخاب کنید.
          </p>
        </motion.div>

        {/* View Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Customer View */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Link to="/customer">
              <motion.div
                className="group glass-card p-8 rounded-3xl h-full cursor-pointer overflow-hidden relative"
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Smartphone className="w-8 h-8 text-primary-foreground" />
                  </div>
                  
                  <h2 className="font-serif text-3xl font-semibold mb-3">
                    نمای مشتری
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    منو را به عنوان مهمان میز ۵ تجربه کنید.
                    محصولات را مرور کنید، سفارش را شخصی‌سازی کنید و درخواست خدمات دهید.
                  </p>
                  
                  <div className="flex items-center gap-2 text-primary font-medium">
                    <span>ورود به عنوان مشتری</span>
                    <motion.span
                      animate={{ x: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      ←
                    </motion.span>
                  </div>
                  
                  <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="px-3 py-1 rounded-full bg-muted">موبایل</span>
                    <span className="px-3 py-1 rounded-full bg-muted">میز ۵</span>
                  </div>
                </div>
              </motion.div>
            </Link>
          </motion.div>

          {/* Manager View */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Link to="/manager">
              <motion.div
                className="group glass-card p-8 rounded-3xl h-full cursor-pointer overflow-hidden relative"
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-coffee/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-coffee flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <LayoutDashboard className="w-8 h-8 text-foreground" />
                  </div>
                  
                  <h2 className="font-serif text-3xl font-semibold mb-3">
                    داشبورد مدیریت
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    مرکز کنترل کافه شما. میزها را رصد کنید،
                    موجودی را مدیریت کنید و کد QR بسازید.
                  </p>
                  
                  <div className="flex items-center gap-2 text-coffee-light font-medium">
                    <span>ورود به عنوان مدیر</span>
                    <motion.span
                      animate={{ x: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      ←
                    </motion.span>
                  </div>
                  
                  <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="px-3 py-1 rounded-full bg-muted">دسکتاپ</span>
                    <span className="px-3 py-1 rounded-full bg-muted flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-status-alert animate-pulse" />
                      ۲ هشدار
                    </span>
                  </div>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.p
          className="text-center text-muted-foreground text-sm mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          ساخته شده با React، Tailwind CSS و Framer Motion
        </motion.p>
      </div>
    </div>
  );
};

export default Index;
