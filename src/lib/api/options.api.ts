import apiClient from '@/lib/api';
import { OptionsConfig } from '@/context/OptionsContext';

const STORAGE_KEY = 'menuBloom_optionsConfig_v1';

export const optionsAPI = {
  async load(): Promise<OptionsConfig | null> {
    try {
      // Try server first
      const { data } = await apiClient.get('/options');
      if (data?.data) return data.data as OptionsConfig;
    } catch (_) {
      // fall back
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as OptionsConfig) : null;
    } catch (_) {
      return null;
    }
  },

  async save(config: OptionsConfig): Promise<void> {
    try {
      // Try server first
      await apiClient.put('/options', config);
    } catch (_) {
      // fall back to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      } catch (_) {}
    }
  },
};
