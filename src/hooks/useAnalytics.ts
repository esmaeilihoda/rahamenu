import { useEffect, useState, useCallback } from 'react';
import apiClient from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export type RangeKey = '7d' | '30d' | '90d';

export const useAnalytics = (range: RangeKey = '7d') => {
  const { restaurantId } = useAuth();
  const [metrics, setMetrics] = useState<any | null>(null);
  const [popularItems, setPopularItems] = useState<any[]>([]);
  const [peakHours, setPeakHours] = useState<any[]>([]);
  const [tableMetrics, setTableMetrics] = useState<any | null>(null);
  const [vibes, setVibes] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    if (!restaurantId) return;
    setIsLoading(true);
    try {
      const [salesRes, popularRes, peakRes, tableRes, vibeRes] = await Promise.all([
        apiClient.get(`/analytics/sales/${restaurantId}?range=${range}`),
        apiClient.get(`/analytics/popular-items/${restaurantId}?range=${range}`),
        apiClient.get(`/analytics/peak-hours/${restaurantId}?range=${range}`),
        apiClient.get(`/analytics/table-metrics/${restaurantId}?range=${range}`),
        apiClient.get(`/analytics/vibes/${restaurantId}?range=${range}`),
      ]);

      setMetrics(salesRes.data.data);
      setPopularItems(popularRes.data.data);
      setPeakHours(peakRes.data.data);
      setTableMetrics(tableRes.data.data);
      setVibes(vibeRes.data.data);
    } finally {
      setIsLoading(false);
    }
  }, [restaurantId, range]);

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 5 * 60 * 1000); // auto-refresh 5 minutes
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  return { metrics, popularItems, peakHours, tableMetrics, vibes, isLoading, refetch: fetchAnalytics };
};
