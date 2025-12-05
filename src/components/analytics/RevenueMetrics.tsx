import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatToman } from '@/lib/utils';

interface RevenueMetricsProps {
  metrics: {
    totalRevenue: number;
    orderCount: number;
    avgOrderValue: number;
    comparison: { revenueChangePct: number; orderCountChangePct: number; aovChangePct: number };
  } | null;
}

export const RevenueMetrics = ({ metrics }: RevenueMetricsProps) => {
  if (!metrics) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>درآمد</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-bold">
          {formatToman(metrics.totalRevenue)}
          <div className={`text-sm mt-2 ${metrics.comparison.revenueChangePct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {metrics.comparison.revenueChangePct}% نسبت به قبل
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>سفارشات</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-bold">
          {metrics.orderCount}
          <div className={`text-sm mt-2 ${metrics.comparison.orderCountChangePct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {metrics.comparison.orderCountChangePct}% نسبت به قبل
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>میانگین ارزش سفارش</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-bold">
          {formatToman(metrics.avgOrderValue)}
          <div className={`text-sm mt-2 ${metrics.comparison.aovChangePct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {metrics.comparison.aovChangePct}% نسبت به قبل
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
