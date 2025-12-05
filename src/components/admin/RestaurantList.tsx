import { useState } from 'react';
import { Table } from '@/components/ui/table';

export const RestaurantList = () => {
  const [rows] = useState([
    { name: 'Bloom Cafe', slug: 'bloom', status: 'active', plan: 'basic' },
    { name: 'Sunset Diner', slug: 'sunset', status: 'suspended', plan: 'free' },
  ]);

  return (
    <div className="overflow-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left">
            <th className="p-2">Name</th>
            <th className="p-2">Slug</th>
            <th className="p-2">Plan</th>
            <th className="p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx} className="border-t">
              <td className="p-2">{r.name}</td>
              <td className="p-2">{r.slug}</td>
              <td className="p-2">{r.plan}</td>
              <td className="p-2">{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
