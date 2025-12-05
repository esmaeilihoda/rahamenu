# مستندات سیستم آنالیتیکس

## وضعیت کلی
سیستم آنالیتیکس به طور کامل به فارسی ترجمه شده و برای نمایش قیمت‌ها از تومان استفاده می‌کند.

---

## ✅ اجزای فعال و کار می‌کنند

### 1. RevenueMetrics (معیارهای درآمد)
- **محل**: `src/components/analytics/RevenueMetrics.tsx`
- **وضعیت**: ✅ کاملاً فعال و فارسی
- **عملکرد**:
  - نمایش کل درآمد با فرمت تومان
  - تعداد سفارشات
  - میانگین ارزش هر سفارش
  - درصد تغییر نسبت به دوره قبل (با رنگ سبز برای افزایش و قرمز برای کاهش)
- **منبع داده**: دریافت از API آنالیتیکس بکند (`/api/v1/analytics/sales`)
- **مشکلات**: هیچ

### 2. SalesChart (نمودار فروش)
- **محل**: `src/components/analytics/SalesChart.tsx`
- **وضعیت**: ✅ فعال با داده‌های موک (Mock)
- **عملکرد**:
  - نمودار خطی/میله‌ای برای نمایش روند فروش
  - سه حالت: درآمد، سفارشات، میانگین ارزش
  - دکمه‌های تغییر نمایش به فارسی
- **⚠️ محدودیت**: 
  - **مشکل**: در حال حاضر از داده‌های تصادفی استفاده می‌کند (خط 20-28)
  - **دلیل**: هیچ API بکند برای داده‌های روزانه/تاریخی وجود ندارد
  - **راه حل**: باید endpoint جدید در بکند اضافه شود:
    ```typescript
    // پیشنهادی: GET /api/v1/analytics/sales/daily?restaurantId=...&startDate=...&endDate=...
    // خروجی: [{ date: '2024-01-01', revenue: 1000000, orders: 25, aov: 40000 }, ...]
    ```
  - **وضعیت فعلی**: نمودار نمایش داده می‌شود اما داده‌ها واقعی نیستند

### 3. PopularItemsCard (محبوب‌ترین آیتم‌ها)
- **محل**: `src/components/analytics/PopularItemsCard.tsx`
- **وضعیت**: ✅ کاملاً فعال و فارسی
- **عملکرد**:
  - نمایش 10 آیتم پرفروش
  - رتبه‌بندی از 1 تا 10
  - تعداد فروش و درآمد هر آیتم
  - نمایش دسته‌بندی (اگر موجود باشد)
- **منبع داده**: دریافت از `/api/v1/analytics/popular-items`
- **مشکلات**: هیچ

### 4. PeakHoursChart (نمودار ساعات شلوغی)
- **محل**: `src/components/analytics/PeakHoursChart.tsx`
- **وضعیت**: ✅ کاملاً فعال و فارسی
- **عملکرد**:
  - نمودار میله‌ای تعداد سفارشات در هر ساعت
  - نمایش ساعات 0-23
  - شناسایی ساعات اوج فروش
- **منبع داده**: دریافت از `/api/v1/analytics/peak-hours`
- **مشکلات**: هیچ

### 5. TableTurnoverStats (آمار میزها)
- **محل**: `src/components/analytics/TableTurnoverStats.tsx`
- **وضعیت**: ✅ کاملاً فعال و فارسی
- **عملکرد**:
  - نرخ استفاده از میزها (به درصد)
  - شماره پرکاربردترین میز
  - شماره کم‌کاربردترین میز
- **منبع داده**: دریافت از `/api/v1/analytics/table-metrics`
- **مشکلات**: هیچ

### 6. AnalyticsDashboard (داشبورد اصلی)
- **محل**: `src/pages/AnalyticsDashboard.tsx`
- **وضعیت**: ✅ کاملاً فعال و فارسی
- **عملکرد**:
  - انتخاب بازه زمانی (7، 30، 90 روز)
  - دکمه بروزرسانی
  - دکمه خروجی PDF
  - نمایش تمام کامپوننت‌های آنالیتیکس
- **🔧 تغییرات اخیر**:
  - ✅ رفع باگ `restaurantId="placeholder"` - حالا از `useAuth` برای دریافت شناسه واقعی استفاده می‌کند
  - ✅ محاسبه صحیح بازه تاریخی برای SalesChart
- **مشکلات**: هیچ

---

## ⚠️ اجزای غیرفعال یا ناقص

### 1. Vibe Analytics (آنالیتیکس حس و حال)
- **محل**: `src/pages/AnalyticsDashboard.tsx` (خط 53)
- **وضعیت**: ❌ غیرفعال - فقط پلیس‌هولدر
- **دلیل**:
  - بکند endpoint دارد: `/api/v1/analytics/vibes`
  - بکند سرویس دارد: `server/src/services/analytics.service.ts` - تابع `getVibeAnalytics()`
  - **اما هیچ کامپوننت UI برای نمایش این داده‌ها وجود ندارد**
- **داده‌های موجود در بکند**:
  ```typescript
  interface VibeAnalytics {
    mostPopularVibe: string | null;  // محبوب‌ترین vibe انتخابی
    vibeBreakdown: Array<{           // توزیع انتخاب vibeها
      vibe: string;
      count: number;
    }>;
  }
  ```
- **راه حل**:
  1. ساخت کامپوننت جدید: `src/components/analytics/VibeAnalyticsCard.tsx`
  2. دریافت داده از hook موجود: `useAnalytics` قبلاً `vibes` را دریافت می‌کند
  3. نمایش نمودار دایره‌ای یا میله‌ای از توزیع vibeها
  4. جایگزینی پلیس‌هولدر در `AnalyticsDashboard.tsx`

### 2. SalesChart - داده‌های تاریخی
- **محل**: `src/components/analytics/SalesChart.tsx`
- **وضعیت**: ⚠️ نیمه‌فعال - UI کار می‌کند اما داده‌ها موک هستند
- **مشکل**:
  - خطوط 20-28: تولید داده‌های تصادفی
  - هیچ API واقعی فراخوانی نمی‌شود
  - بکند endpoint برای داده‌های روزانه ندارد
- **راه حل**:
  1. اضافه کردن endpoint جدید در بکند:
     ```typescript
     // server/src/controllers/analytics.controller.ts
     router.get('/sales/daily', async (req, res) => {
       const { restaurantId, startDate, endDate } = req.query;
       const data = await analyticsService.getDailySalesData(
         restaurantId,
         new Date(startDate),
         new Date(endDate)
       );
       res.json(data);
     });
     ```
  2. اضافه کردن سرویس در `analytics.service.ts`:
     ```typescript
     async getDailySalesData(restaurantId, startDate, endDate) {
       return await Order.aggregate([
         {
           $match: {
             restaurantId: new Types.ObjectId(restaurantId),
             createdAt: { $gte: startDate, $lte: endDate },
             paymentStatus: 'paid'
           }
         },
         {
           $group: {
             _id: {
               $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
             },
             revenue: { $sum: "$totalAmount" },
             orders: { $sum: 1 },
             aov: { $avg: "$totalAmount" }
           }
         },
         { $sort: { _id: 1 } }
       ]);
     }
     ```
  3. فراخوانی API واقعی در `SalesChart.tsx`

---

## 🔧 رفع مشکلات انجام شده

### 1. مشکل restaurantId
- **مشکل قبلی**: `restaurantId="placeholder"` در AnalyticsDashboard
- **دلیل**: فراموشی استفاده از `useAuth` برای دریافت شناسه واقعی
- **راه حل**: اضافه کردن `const { user } = useAuth()` و استفاده از `user?.restaurantId`

### 2. مشکل ObjectId در بکند
- **مشکل قبلی**: آنالیتیکس هیچ داده‌ای نشان نمی‌داد
- **دلیل**: `restaurantId` به صورت string ارسال می‌شد اما در MongoDB به صورت ObjectId ذخیره شده
- **راه حل**: تبدیل `restaurantId` به ObjectId در تمام queryهای aggregation:
  ```typescript
  restaurantId: new Types.ObjectId(restaurantId)
  ```

### 3. مشکل فرمت قیمت
- **مشکل قبلی**: همه قیمت‌ها با `$` و به دلار نمایش داده می‌شدند
- **راه حل**: استفاده از تابع `formatToman` در تمام کامپوننت‌ها

---

## 📊 معماری سیستم آنالیتیکس

### جریان داده:
```
[Order Model] → [Analytics Service] → [Analytics Controller] → [Analytics API]
                        ↓
                  [Node Cache]
                  (5 minutes TTL)
                        ↓
              [useAnalytics Hook] → [Analytics Components]
```

### Caching:
- **محل**: `server/src/services/analytics.service.ts`
- **مدت زمان**: 5 دقیقه
- **کلیدها**: `analytics:${restaurantId}:${rangeKey}`
- **دلیل**: کاهش بار روی دیتابیس برای queryهای سنگین aggregation

### بازه‌های زمانی پشتیبانی شده:
- `7d`: 7 روز گذشته
- `30d`: 30 روز گذشته
- `90d`: 90 روز گذشته

---

## 🚀 پیشنهادات برای توسعه آینده

### 1. پیاده‌سازی Vibe Analytics UI
**اولویت**: بالا  
**زمان تخمینی**: 2-3 ساعت  
**مراحل**:
- ساخت `VibeAnalyticsCard.tsx`
- نمایش نمودار دایره‌ای با Recharts
- ترجمه نام vibeها به فارسی

### 2. اضافه کردن داده‌های تاریخی واقعی برای SalesChart
**اولویت**: متوسط  
**زمان تخمینی**: 3-4 ساعت  
**مراحل**:
- ساخت endpoint `/sales/daily` در بکند
- پیاده‌سازی aggregation روزانه
- اتصال به SalesChart component

### 3. فیلتر پیشرفته تاریخ
**اولویت**: پایین  
**زمان تخمینی**: 4-5 ساعت  
**ویژگی‌ها**:
- انتخاب بازه دلخواه با تقویم شمسی
- مقایسه دو بازه زمانی
- نمایش روند بلندمدت

### 4. Export به Excel
**اولویت**: پایین  
**زمان تخمینی**: 2-3 ساعت  
**ویژگی‌ها**:
- خروجی تمام داده‌های آنالیتیکس به فرمت XLSX
- شامل نمودارها و جداول

---

## 📝 چک‌لیست تست

### تست‌های عملکردی:
- [x] نمایش صحیح درآمد کل با فرمت تومان
- [x] محاسبه درست میانگین ارزش سفارش
- [x] نمایش صحیح محبوب‌ترین آیتم‌ها
- [x] نمودار ساعات شلوغی با داده واقعی
- [x] آمار میزها (نرخ استفاده، پرکاربردترین میز)
- [x] تغییر بازه زمانی (7/30/90 روز)
- [x] دکمه بروزرسانی
- [x] خروجی PDF (print)
- [ ] نمودار فروش با داده واقعی (فعلاً موک)
- [ ] آنالیتیکس vibe (کامپوننت وجود ندارد)

### تست‌های UI/UX:
- [x] تمام متون به فارسی
- [x] تمام قیمت‌ها به تومان
- [x] نمایش صحیح در موبایل (responsive)
- [x] رنگ‌بندی درست (سبز برای افزایش، قرمز برای کاهش)

---

## 🐛 باگ‌های شناخته شده

### ❌ هیچ باگ فعال وجود ندارد

تمام مشکلات قبلی رفع شده‌اند:
- ✅ مشکل restaurantId حل شد
- ✅ مشکل ObjectId در بکند حل شد
- ✅ مشکل فرمت قیمت حل شد
- ✅ مشکل ترجمه حل شد

---

## 📞 تماس با توسعه‌دهنده

در صورت بروز هر گونه مشکل یا سوال:
- بررسی Console مرورگر برای خطاهای JavaScript
- بررسی Network tab برای خطاهای API
- بررسی لاگ‌های سرور برای خطاهای بکند
- بررسی وضعیت دیتابیس (آیا سفارشات paid وجود دارند؟)

---

**آخرین بروزرسانی**: امروز  
**نسخه**: 1.0.0  
**وضعیت کلی**: ✅ آماده تولید (به جز SalesChart data و Vibe Analytics UI)
