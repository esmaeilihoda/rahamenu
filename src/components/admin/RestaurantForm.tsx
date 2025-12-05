import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const RestaurantForm = ({ onClose }: { onClose: () => void }) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  const onSubmit = () => {
    // TODO: call API to create restaurant
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Restaurant</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
          <Button onClick={onSubmit}>Create</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
