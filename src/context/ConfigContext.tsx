import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { birthdayConfig } from '../config/birthdayConfig';
import { getDatabaseConfig, saveDatabaseConfig, resetDatabaseConfig } from '../lib/db';

export type BirthdayConfigType = typeof birthdayConfig;

interface ConfigContextType {
  config: BirthdayConfigType;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  updateConfig: (newConfig: BirthdayConfigType) => Promise<boolean>;
  resetConfig: () => Promise<boolean>;
  refetchConfig: () => Promise<void>;
  exportConfig: () => void;
  exportTSConfig: () => void;
  importConfig: (jsonString: string) => Promise<boolean>;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<BirthdayConfigType>(birthdayConfig);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to merge loaded database config with default schema structure
  const formatConfig = (data: any): BirthdayConfigType => {
    if (!data || typeof data !== 'object') return birthdayConfig;
    return {
      ...birthdayConfig,
      ...data,
      letter: {
        ...birthdayConfig.letter,
        ...(data.letter || {}),
        paragraphs: Array.isArray(data.letter?.paragraphs)
          ? data.letter.paragraphs
          : birthdayConfig.letter.paragraphs,
      },
      photos: Array.isArray(data.photos) ? data.photos : birthdayConfig.photos,
      quotes: Array.isArray(data.quotes) ? data.quotes : birthdayConfig.quotes,
      stats: Array.isArray(data.stats) ? data.stats : birthdayConfig.stats,
    };
  };

  /**
   * Refetch latest config from Supabase / Database (loaded ONCE)
   */
  const refetchConfig = useCallback(async () => {
    setIsLoading(true);
    try {
      const dbData = await getDatabaseConfig();
      if (dbData) {
        const formatted = formatConfig(dbData);
        setConfig(formatted);
        setError(null);
      }
    } catch (e: any) {
      console.error('Failed to fetch config from database:', e);
      setError(e.message || 'Error syncing with database');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch data ONCE on mount. No polling intervals or auto-refetch loops that reset form state!
  useEffect(() => {
    refetchConfig();
  }, [refetchConfig]);

  /**
   * Save updated configuration to Database / Supabase
   */
  const updateConfig = async (newConfig: BirthdayConfigType): Promise<boolean> => {
    setIsSaving(true);
    setError(null);
    try {
      const savedDoc = await saveDatabaseConfig(newConfig);
      const updatedDoc = formatConfig(savedDoc || newConfig);
      setConfig(updatedDoc);
      return true;
    } catch (e: any) {
      console.warn('Network save warning, retaining updated context state:', e);
      setConfig(formatConfig(newConfig));
      return true;
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Reset configuration to initial defaults
   */
  const resetConfig = async (): Promise<boolean> => {
    setIsSaving(true);
    setError(null);
    try {
      const resetDoc = await resetDatabaseConfig();
      const formatted = formatConfig(resetDoc);
      setConfig(formatted);
      return true;
    } catch (e: any) {
      console.error('Failed to reset database:', e);
      setError(e.message || 'Failed to reset database');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const exportConfig = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `birthday_config_${config.name.toLowerCase().replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportTSConfig = () => {
    const tsContent = `export interface PhotoItem {
  id: string;
  url: string;
  caption: string;
  location?: string;
  memoryTitle?: string;
  secretNote?: string;
}

export interface StatItem {
  number: string;
  label: string;
}

export const birthdayConfig = ${JSON.stringify(config, null, 2)};
`;
    const blob = new Blob([tsContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", url);
    downloadAnchor.setAttribute("download", "birthdayConfig.ts");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
  };

  const importConfig = async (jsonString: string): Promise<boolean> => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && typeof parsed === 'object' && parsed.name) {
        return await updateConfig(parsed);
      }
    } catch (e) {
      console.error('Invalid JSON config:', e);
    }
    return false;
  };

  return (
    <ConfigContext.Provider value={{
      config,
      isLoading,
      isSaving,
      error,
      updateConfig,
      resetConfig,
      refetchConfig,
      exportConfig,
      exportTSConfig,
      importConfig
    }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};
