import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface PeakHoursChartProps {
  hours: Array<{ _id: number; orderCount: number }>;
}

export const PeakHoursChart = ({ hours }: PeakHoursChartProps) => {
  const data = hours.map((h) => ({ hour: `${h._id}:00`, orders: h.orderCount }));
  return (
    <Card>
      <CardHeader>
        <CardTitle>ساعات شلوغی</CardTitle>
      </CardHeader>
      <CardContent style={{ height: 320 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="orders" fill="#F59E0B" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
