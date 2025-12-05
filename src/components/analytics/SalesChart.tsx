import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';
import apiClient from '@/lib/api';

interface DateRange { start: Date; end: Date }
interface SalesChartProps {
  restaurantId: string;
  dateRange: DateRange;
  granularity?: 'daily' | 'weekly' | 'monthly';
}

export const SalesChart = ({ restaurantId, dateRange, granularity = 'daily' }: SalesChartProps) => {
  const [data, setData] = useState<any[]>([]);
  const [mode, setMode] = useState<'revenue' | 'orders' | 'aov'>('revenue');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDaily = async () => {
      if (!restaurantId) return;
      setIsLoading(true);
      try {
        const startDate = dateRange.start.toISOString();
        const endDate = dateRange.end.toISOString();
        const endpoint = granularity === 'daily' ? 'daily' : granularity;
        const url = granularity === 'daily'
          ? `/analytics/sales/${endpoint}/${restaurantId}?startDate=${startDate}&endDate=${endDate}`
          : `/analytics/sales/${endpoint}/${restaurantId}`; // weekly/monthly use server-side range
        const res = await apiClient.get(url);
        const payload: Array<any> = res.data.data || [];
        const points = payload.map(p => ({
          date: p.date || p.label,
          revenue: p.revenue,
          orders: p.orders,
          aov: p.aov,
        }));
        setData(points);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDaily();
  }, [restaurantId, dateRange, granularity]);

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>فروش</CardTitle>
        <div className="flex gap-2">
          <button className={`px-2 py-1 rounded ${mode==='revenue'?'bg-muted':''}`} onClick={() => setMode('revenue')}>درآمد</button>
          <button className={`px-2 py-1 rounded ${mode==='orders'?'bg-muted':''}`} onClick={() => setMode('orders')}>سفارشات</button>
          <button className={`px-2 py-1 rounded ${mode==='aov'?'bg-muted':''}`} onClick={() => setMode('aov')}>میانگین ارزش</button>
        </div>
      </CardHeader>
      <CardContent style={{ height: 320 }}>
        {isLoading ? (
          <Skeleton className="w-full h-[280px]" />
        ) : (
          <ResponsiveContainer>
            {mode === 'orders' ? (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#6366F1" />
              </BarChart>
            ) : (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey={mode} stroke="#22C55E" strokeWidth={2} dot={false} />
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
