import React, { createContext, useContext, useEffect, useState } from 'react';
import apiClient from '@/lib/api';

export interface Restaurant {
  _id: string;
  name: string;
  slug: string;
  branding?: { primaryColor?: string; logo?: string };
}

interface RestaurantContextType {
  restaurant: Restaurant | null;
  setRestaurant: (r: Restaurant | null) => void;
  isLoading: boolean;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const RestaurantProvider = ({ children }: { children: React.ReactNode }) => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const slug = window.location.pathname.split('/')[1];
    const stored = localStorage.getItem('restaurant');
    if (stored) {
      setRestaurant(JSON.parse(stored));
      setIsLoading(false);
      return;
    }
    // On manager page, don't set restaurant_id - let AuthContext's restaurantId from login be used
    // On customer pages, store slug for fallback
    if (slug && slug !== 'manager') {
      try {
        localStorage.setItem('restaurant_id', slug);
      } catch {}
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (restaurant?.branding?.primaryColor) {
      document.documentElement.style.setProperty('--primary', restaurant.branding.primaryColor);
    }
    if (restaurant) {
      localStorage.setItem('restaurant', JSON.stringify(restaurant));
    }
  }, [restaurant]);

  return (
    <RestaurantContext.Provider value={{ restaurant, setRestaurant, isLoading }}>
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const ctx = useContext(RestaurantContext);
  if (!ctx) throw new Error('useRestaurant must be used within RestaurantProvider');
  return ctx;
};

export const getRestaurantId = () => {
  try {
    const stored = localStorage.getItem('restaurant');
    if (!stored) return null;
    const r = JSON.parse(stored);
    return r?._id || null;
  } catch {
    return null;
  }
};
