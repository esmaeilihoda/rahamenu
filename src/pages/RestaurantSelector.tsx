import { useEffect, useState } from 'react';
import { useRestaurant } from '@/context/RestaurantContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const mockRestaurants = [
  { _id: 'r1', name: 'Bloom Cafe', slug: 'bloom', branding: { primaryColor: '#22c55e' } },
  { _id: 'r2', name: 'Sunset Diner', slug: 'sunset' },
];

const RestaurantSelector = () => {
  const { setRestaurant } = useRestaurant();
  const [query, setQuery] = useState('');
  const filtered = mockRestaurants.filter((r) => r.name.toLowerCase().includes(query.toLowerCase()));

  const selectRestaurant = (r: any) => {
    setRestaurant(r);
    localStorage.setItem('restaurant', JSON.stringify(r));
    window.location.href = `/${r.slug}/customer`;
  };

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">Select a Restaurant</h1>
      <Input placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((r) => (
          <Card key={r._id} className="cursor-pointer" onClick={() => selectRestaurant(r)}>
            <CardHeader>
              <CardTitle>{r.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">/{r.slug}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RestaurantSelector;
