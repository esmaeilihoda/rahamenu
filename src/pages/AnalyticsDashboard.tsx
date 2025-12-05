import { useState } from 'react';
import { useAnalytics, RangeKey } from '@/hooks/useAnalytics';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from 'next-themes';
import { RevenueMetrics } from '@/components/analytics/RevenueMetrics';
import { SalesChart } from '@/components/analytics/SalesChart';
import { PopularItemsCard } from '@/components/analytics/PopularItemsCard';
import { PeakHoursChart } from '@/components/analytics/PeakHoursChart';
import { TableTurnoverStats } from '@/components/analytics/TableTurnoverStats';
import { VibeAnalyticsCard } from '@/components/analytics/VibeAnalyticsCard';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, FileDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
// Use Persian DatePicker
import { isoToJalaliValue, jalaliValueToIso } from '@/lib/jalali';
import { JalaliCalendarPicker } from '@/components/ui/jalali-calendar';
import { Button as UIButton } from '@/components/ui/button';
import { useMemo, useState as useReactState } from 'react';

const AnalyticsDashboard = () => {
  const { theme, systemTheme } = useTheme();
  const isDark = (theme === 'dark') || (theme === 'system' && systemTheme === 'dark');
  const [range, setRange] = useState<RangeKey>('7d');
  const [customStart, setCustomStart] = useReactState<string>('');
  const [customEnd, setCustomEnd] = useReactState<string>('');
  const { user } = useAuth();
  const { metrics, popularItems, peakHours, tableMetrics, vibes, isLoading, refetch } = useAnalytics(range);

  const exportPDF = () => {
    window.print(); // simple browser print to PDF
  };

  const exportDailyCSV = async () => {
    if (!user?.restaurantId) return;
    const start = (customStart ? new Date(customStart) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).toISOString();
    const end = (customEnd ? new Date(customEnd) : new Date()).toISOString();
    const res = await fetch(`/api/v1/analytics/sales/daily/${user.restaurantId}?startDate=${start}&endDate=${end}`, { credentials: 'include' });
    const data = await res.json();
    const rows = (data.data || []) as Array<{ date: string; revenue: number; orders: number; aov: number }>;
    const header = 'date,revenue,orders,aov\n';
    const body = rows.map(r => `${r.date},${r.revenue},${r.orders},${r.aov}`).join('\n');
    const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'daily_sales.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportDailyXLSX = async () => {
    if (!user?.restaurantId) return;
    const start = (customStart ? new Date(customStart) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).toISOString();
    const end = (customEnd ? new Date(customEnd) : new Date()).toISOString();
    const res = await fetch(`/api/v1/analytics/sales/daily/${user.restaurantId}?startDate=${start}&endDate=${end}`, { credentials: 'include' });
    const data = await res.json();
    const rows = (data.data || []) as Array<{ date: string; revenue: number; orders: number; aov: number }>;
    try {
      // @ts-ignore - xlsx is optional and loaded dynamically
      const { utils, writeFile } = await import('xlsx');
      const worksheet = utils.json_to_sheet(rows);
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, 'Daily Sales');
      writeFile(workbook, 'daily_sales.xlsx');
    } catch (e) {
      // Fallback to CSV if xlsx is not installed
      const header = 'date,revenue,orders,aov\n';
      const body = rows.map(r => `${r.date},${r.revenue},${r.orders},${r.aov}`).join('\n');
      const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'daily_sales.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Using accurate Jalali↔Gregorian conversion from '@/lib/jalali'
  // Removed temporary JalaliPicker (now using JalaliCalendarPicker component)

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-row-reverse" dir="rtl">
        <div className="flex items-center gap-2 flex-row-reverse" dir="rtl">
          <CalendarIcon className="h-5 w-5" />
          <div className="inline-flex rounded-xl shadow-sm overflow-hidden border bg-white">
            {([
              { key: '7d', label: '۷ روز' },
              { key: '30d', label: '۳۰ روز' },
              { key: '90d', label: '۹۰ روز' },
            ] as Array<{key: RangeKey; label: string}>).map((item, idx) => {
              const active = range === item.key;
              return (
                <button
                  key={item.key}
                  className={`px-3 py-1.5 text-sm font-medium ${active ? 'bg-[#2563eb] text-white' : 'bg-white text-gray-800 hover:bg-[#e6f0ff]'} ${idx>0?'border-l':''}`}
                  onClick={() => setRange(item.key)}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <UIButton variant="outline">تاریخ شروع</UIButton>
            </PopoverTrigger>
            <PopoverContent className="p-2">
              <JalaliCalendarPicker
                valueIso={customStart || ''}
                onChangeIso={(iso) => setCustomStart(iso)}
                accentColor="#2563eb"
                hoverColor="#93c5fd"
                isDark={isDark}
              />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <UIButton variant="outline">تاریخ پایان</UIButton>
            </PopoverTrigger>
            <PopoverContent className="p-2">
              <JalaliCalendarPicker
                valueIso={customEnd || ''}
                onChangeIso={(iso) => setCustomEnd(iso)}
                accentColor="#2563eb"
                hoverColor="#93c5fd"
                isDark={isDark}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex items-center gap-2 flex-row-reverse" dir="rtl">
          <Button onClick={exportPDF} className="gap-2"><FileDown className="h-4 w-4" /> خروجی PDF</Button>
          <Button onClick={exportDailyCSV} className="gap-2"><FileDown className="h-4 w-4" /> خروجی CSV روزانه</Button>
          <Button onClick={exportDailyXLSX} className="gap-2"><FileDown className="h-4 w-4" /> خروجی XLSX روزانه</Button>
        </div>
      </div>

      {/* Metric cards */}
      <RevenueMetrics metrics={metrics} />

      {/* Sales chart */}
      <SalesChart 
        restaurantId={user?.restaurantId || ''} 
        dateRange={{ 
          start: customStart ? new Date(customStart) : new Date(Date.now() - (range === '7d' ? 7 : range === '30d' ? 30 : 90) * 24 * 60 * 60 * 1000), 
          end: customEnd ? new Date(customEnd) : new Date() 
        }} 
        granularity={range === '7d' ? 'daily' : range === '30d' ? 'weekly' : 'monthly'}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PopularItemsCard items={popularItems} />
        <PeakHoursChart hours={peakHours} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TableTurnoverStats metrics={tableMetrics} />
        <VibeAnalyticsCard vibes={vibes} />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
