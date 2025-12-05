// Shared TypeScript types and interfaces

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  limit?: number;
  skip?: number;
  page?: number;
}

export interface PaginationMeta {
  total: number;
  limit: number;
  skip: number;
  hasMore: boolean;
}

export interface QueryFilters {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: Date;
  endDate?: Date;
}

// Order status types
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled';

// Table status types
export type TableStatus = 'empty' | 'browsing' | 'ordered' | 'alert';

// User roles
export type UserRole = 'admin' | 'manager' | 'staff';

// Menu categories
export type MenuCategory = 'coffee' | 'tea' | 'pastry' | 'cold';

// Vibes
export type Vibe = 'energy' | 'relaxing' | 'cold' | 'hungry';
