import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TableTurnoverStatsProps {
  metrics: { utilizationRate: number; mostUsedTable: number | null; leastUsedTable: number | null } | null;
}

export const TableTurnoverStats = ({ metrics }: TableTurnoverStatsProps) => {
  if (!metrics) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>آمار میزها</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">نرخ استفاده</div>
            <div className="text-3xl font-bold">{Math.round(metrics.utilizationRate * 100)}%</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">پرکاربردترین میز</div>
            <div className="text-3xl font-bold">{metrics.mostUsedTable ?? '-'}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">کم‌کاربردترین میز</div>
            <div className="text-3xl font-bold">{metrics.leastUsedTable ?? '-'}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
