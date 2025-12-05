import { useState, useCallback } from 'react';
import { vibesAPI, Vibe } from '@/lib/api/vibes.api';
import { useToast } from './use-toast';

export const useVibes = () => {
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchVibes = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await vibesAPI.listVibes();
      setVibes(data);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'خطا',
        description: error.response?.data?.error || 'خطا در دریافت vibes',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const createVibe = useCallback(async (payload: { key: string; label: string; emoji?: string }) => {
    try {
      const newVibe = await vibesAPI.createVibe(payload);
      setVibes(prev => [...prev, newVibe]);
      toast({
        title: '✅ Vibe اضافه شد',
      });
      return newVibe;
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'خطا',
        description: error.response?.data?.error || 'خطا در ایجاد vibe',
      });
      throw error;
    }
  }, [toast]);

  const updateVibe = useCallback(async (id: string, payload: Partial<{ key: string; label: string; emoji?: string; active: boolean }>) => {
    try {
      const updatedVibe = await vibesAPI.updateVibe(id, payload);
      setVibes(prev => prev.map(v => v._id === id ? updatedVibe : v));
      toast({
        title: '✅ Vibe به‌روزرسانی شد',
      });
      return updatedVibe;
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'خطا',
        description: error.response?.data?.error || 'خطا در به‌روزرسانی vibe',
      });
      throw error;
    }
  }, [toast]);

  const deleteVibe = useCallback(async (id: string) => {
    try {
      await vibesAPI.deleteVibe(id);
      setVibes(prev => prev.filter(v => v._id !== id));
      toast({
        title: '✅ Vibe حذف شد',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'خطا',
        description: error.response?.data?.error || 'خطا در حذف vibe',
      });
      throw error;
    }
  }, [toast]);

  return {
    vibes,
    isLoading,
    fetchVibes,
    createVibe,
    updateVibe,
    deleteVibe,
  };
};
