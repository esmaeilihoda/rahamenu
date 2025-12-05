import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface VibeBreakdownItem {
  vibe: string;
  count: number;
}

interface VibeAnalyticsProps {
  vibes: {
    mostPopularVibe: string | null;
    vibeBreakdown: VibeBreakdownItem[];
  } | null;
}

const COLORS = ['#6366F1', '#22C55E', '#F59E0B', '#EF4444', '#06B6D4', '#A78BFA', '#84CC16'];

export const VibeAnalyticsCard = ({ vibes }: VibeAnalyticsProps) => {
  const data = (vibes?.vibeBreakdown || []).map((v, idx) => ({ name: v.vibe, value: v.count, color: COLORS[idx % COLORS.length] }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>آنالیتیکس حس و حال</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {vibes?.mostPopularVibe ? (
          <div className="text-sm text-muted-foreground">
            محبوب‌ترین حس و حال: <span className="font-medium">{vibes.mostPopularVibe}</span>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">اطلاعاتی برای محبوب‌ترین حس و حال موجود نیست</div>
        )}

        {data.length > 0 ? (
          <div style={{ height: 320 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" outerRadius={100} label>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">داده‌ای برای این بازه زمانی وجود ندارد</div>
        )}
      </CardContent>
    </Card>
  );
};
