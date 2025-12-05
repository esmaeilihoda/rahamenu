import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RestaurantList } from '@/components/admin/RestaurantList';
import { RestaurantForm } from '@/components/admin/RestaurantForm';

const AdminPanel = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <Button onClick={() => setShowForm(true)}>New Restaurant</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Restaurants</CardTitle>
        </CardHeader>
        <CardContent>
          <RestaurantList />
        </CardContent>
      </Card>
      {showForm && (
        <RestaurantForm onClose={() => setShowForm(false)} />
      )}
    </div>
  );
};

export default AdminPanel;
