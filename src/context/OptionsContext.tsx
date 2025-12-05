import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type MilkType = 'dairy' | 'oat' | 'almond';

export interface OptionsConfig {
  milkSurcharges: Record<MilkType, number>; // toman
  addOns: Record<string, { price: number; emoji: string }>; // name -> pricing + emoji
}

const DEFAULT_CONFIG: OptionsConfig = {
  milkSurcharges: {
    dairy: 0,
    oat: 20000,
    almond: 20000,
  },
  addOns: {},
};

const STORAGE_KEY = 'menuBloom_optionsConfig_v1';

interface OptionsContextValue {
  config: OptionsConfig;
  updateConfig: (updater: (prev: OptionsConfig) => OptionsConfig) => void;
  setConfig: (next: OptionsConfig) => void;
}

const OptionsContext = createContext<OptionsContextValue | undefined>(undefined);

export const OptionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfigState] = useState<OptionsConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setConfigState({ ...DEFAULT_CONFIG, ...parsed });
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (_) {}
  }, [config]);

  const updateConfig = (updater: (prev: OptionsConfig) => OptionsConfig) => {
    setConfigState((prev) => updater(prev));
  };

  const setConfig = (next: OptionsConfig) => setConfigState(next);

  const value = useMemo(() => ({ config, updateConfig, setConfig }), [config]);

  return <OptionsContext.Provider value={value}>{children}</OptionsContext.Provider>;
};

export const useOptions = (): OptionsContextValue => {
  const ctx = useContext(OptionsContext);
  if (!ctx) throw new Error('useOptions must be used within OptionsProvider');
  return ctx;
};
