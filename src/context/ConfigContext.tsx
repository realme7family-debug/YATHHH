import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { birthdayConfig, PhotoItem, StatItem } from '../config/birthdayConfig';

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
      },
      photos: Array.isArray(data.photos) ? data.photos : birthdayConfig.photos,
      quotes: Array.isArray(data.quotes) ? data.quotes : birthdayConfig.quotes,
      stats: Array.isArray(data.stats) ? data.stats : birthdayConfig.stats,
    };
  };

  /**
   * Refetch latest config from Production Database API
   */
  const refetchConfig = useCallback(async () => {
    try {
      // Prevent browser & CDN caching by attaching a unique timestamp parameter
      const res = await fetch(`/api/config?t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
        cache: 'no-store',
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const json = await res.json();
      if (json.success && json.data) {
        setConfig(formatConfig(json.data));
        setError(null);
      }
    } catch (e: any) {
      console.error('Failed to fetch config from Production Database API:', e);
      setError(e.message || 'Error syncing with production database');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch on mount & background auto-sync polling across devices
  useEffect(() => {
    refetchConfig();

    // Polling interval every 3 seconds for live near-instant global synchronization across all devices
    const intervalId = setInterval(() => {
      refetchConfig();
    }, 3000);

    // Immediate refetch when window or tab regains focus
    const handleFocus = () => {
      refetchConfig();
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        refetchConfig();
      }
    });

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, [refetchConfig]);

  /**
   * Save updated configuration to Production Database
   */
  const updateConfig = async (newConfig: BirthdayConfigType): Promise<boolean> => {
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
        cache: 'no-store',
        body: JSON.stringify(newConfig),
      });

      if (!res.ok) {
        throw new Error(`Database save failed with status ${res.status}`);
      }

      const json = await res.json();
      if (json.success && json.data) {
        const updatedDoc = formatConfig(json.data);
        setConfig(updatedDoc);
        // Force a secondary refetch to guarantee absolute production database alignment
        await refetchConfig();
        return true;
      } else {
        throw new Error(json.error || 'Database save returned unsuccessful response');
      }
    } catch (e: any) {
      console.error('Failed to save config to Production Database:', e);
      setError(e.message || 'Failed to save changes to production database');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Reset configuration in Production Database to initial defaults
   */
  const resetConfig = async (): Promise<boolean> => {
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/config', {
        method: 'DELETE',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
        cache: 'no-store',
      });

      if (!res.ok) {
        throw new Error(`Database reset failed with status ${res.status}`);
      }

      const json = await res.json();
      if (json.success && json.data) {
        const resetDoc = formatConfig(json.data);
        setConfig(resetDoc);
        await refetchConfig();
        return true;
      }
      return false;
    } catch (e: any) {
      console.error('Failed to reset config in Production Database:', e);
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
