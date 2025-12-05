import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatToman } from '@/lib/utils';

interface PopularItemsCardProps {
  items: Array<{ name: string; quantitySold: number; revenue: number; category?: string }>;
}

export const PopularItemsCard = ({ items }: PopularItemsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>محبوب‌ترین آیتم‌ها</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.slice(0, 10).map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <div className="flex items-center gap-3">
                <Badge variant="secondary">#{idx + 1}</Badge>
                <div>
                  <div className="font-medium">{item.name}</div>
                  {item.category && (
                    <div className="text-xs text-muted-foreground">{item.category}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge>تعداد: {item.quantitySold}</Badge>
                <Badge variant="outline">{formatToman(item.revenue)}</Badge>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-center text-muted-foreground py-8">داده‌ای برای این بازه زمانی وجود ندارد</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
