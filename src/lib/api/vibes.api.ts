import apiClient from '@/lib/api';

export interface Vibe {
  _id: string;
  restaurantId: string;
  key: string;
  label: string;
  emoji?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export const vibesAPI = {
  // Get all vibes for the restaurant
  async listVibes(): Promise<Vibe[]> {
    const { data } = await apiClient.get('/vibes');
    return data.data || [];
  },

  // Create a new vibe
  async createVibe(payload: { key: string; label: string; emoji?: string }): Promise<Vibe> {
    const { data } = await apiClient.post('/vibes', payload);
    return data.data;
  },

  // Update a vibe
  async updateVibe(id: string, payload: Partial<{ key: string; label: string; emoji?: string; active: boolean }>): Promise<Vibe> {
    const { data } = await apiClient.patch(`/vibes/${id}`, payload);
    return data.data;
  },

  // Delete a vibe
  async deleteVibe(id: string): Promise<void> {
    await apiClient.delete(`/vibes/${id}`);
  },
};
