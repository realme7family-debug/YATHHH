import { birthdayConfig, BirthdayConfigType } from '../config/birthdayConfig';

// Supabase API Credentials
const SUPABASE_BASE_URL = 'https://njfafjfosrdahwamncus.supabase.co/rest/v1';
const SUPABASE_API_KEY = 'sb_publishable_iV1GPV3oNzXmgLJbyY4WQw_aN0A_ZiX';
const TABLE_NAME = 'config';
const DOC_ID = 'production_config';

const LOCAL_STORAGE_KEY = 'yaathh_birthday_config_v1';

// Headers for Supabase REST API
const getSupabaseHeaders = () => ({
  'apikey': SUPABASE_API_KEY,
  'Authorization': `Bearer ${SUPABASE_API_KEY}`,
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
});

// Helper to merge loaded raw data into complete BirthdayConfigType schema
function mergeConfigSchema(rawData: any): BirthdayConfigType {
  if (!rawData || typeof rawData !== 'object') {
    return { ...birthdayConfig };
  }
  return {
    ...birthdayConfig,
    ...rawData,
    letter: {
      ...birthdayConfig.letter,
      ...(rawData.letter || {}),
      paragraphs: Array.isArray(rawData.letter?.paragraphs) 
        ? rawData.letter.paragraphs 
        : birthdayConfig.letter.paragraphs,
    },
    photos: Array.isArray(rawData.photos) ? rawData.photos : birthdayConfig.photos,
    quotes: Array.isArray(rawData.quotes) ? rawData.quotes : birthdayConfig.quotes,
    stats: Array.isArray(rawData.stats) ? rawData.stats : birthdayConfig.stats,
  };
}

/**
 * Fetch latest config from Supabase Database (with local storage backup)
 */
export async function getDatabaseConfig(): Promise<BirthdayConfigType> {
  // 1. Try Supabase REST Endpoint first
  try {
    const res = await fetch(`${SUPABASE_BASE_URL}/${TABLE_NAME}?id=eq.${DOC_ID}&select=*&t=${Date.now()}`, {
      method: 'GET',
      headers: getSupabaseHeaders(),
      cache: 'no-store',
    });

    if (res.ok) {
      const rows = await res.json();
      if (Array.isArray(rows) && rows.length > 0) {
        const row = rows[0];
        const data = row.data || row.config || row;
        if (data && typeof data === 'object') {
          const merged = mergeConfigSchema(data);
          // Sync to localStorage backup
          try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged)); } catch (e) {}
          return merged;
        }
      }
    }
  } catch (err) {
    console.warn('Supabase DB fetch warning, attempting fallback storage:', err);
  }

  // 2. LocalStorage backup
  try {
    const local = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (local) {
      const parsed = JSON.parse(local);
      if (parsed && typeof parsed === 'object') {
        return mergeConfigSchema(parsed);
      }
    }
  } catch (e) {}

  // 3. Initial Default Schema
  return { ...birthdayConfig };
}

/**
 * Save updated config to Supabase Database (and sync local storage)
 */
export async function saveDatabaseConfig(newConfig: BirthdayConfigType): Promise<BirthdayConfigType> {
  if (!newConfig || typeof newConfig !== 'object') {
    throw new Error('Invalid configuration object');
  }

  const cleanConfig = mergeConfigSchema(newConfig);

  // 1. Always save to LocalStorage immediately for instant persistence
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cleanConfig));
  } catch (e) {}

  // 2. Upsert to Supabase REST API
  try {
    const payload = {
      id: DOC_ID,
      data: cleanConfig,
      updated_at: new Date().toISOString(),
    };

    // Attempt Upsert (Prefer: resolution=merge-duplicates)
    const upsertRes = await fetch(`${SUPABASE_BASE_URL}/${TABLE_NAME}`, {
      method: 'POST',
      headers: {
        ...getSupabaseHeaders(),
        'Prefer': 'resolution=merge-duplicates,return=representation',
      },
      body: JSON.stringify(payload),
    });

    if (upsertRes.ok) {
      const rows = await upsertRes.json();
      if (Array.isArray(rows) && rows.length > 0) {
        const savedData = rows[0].data || cleanConfig;
        return mergeConfigSchema(savedData);
      }
    } else if (upsertRes.status === 404 || upsertRes.status === 400) {
      // Try PATCH directly if row already exists
      const patchRes = await fetch(`${SUPABASE_BASE_URL}/${TABLE_NAME}?id=eq.${DOC_ID}`, {
        method: 'PATCH',
        headers: {
          ...getSupabaseHeaders(),
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(payload),
      });

      if (patchRes.ok) {
        const rows = await patchRes.json();
        if (Array.isArray(rows) && rows.length > 0) {
          return mergeConfigSchema(rows[0].data || cleanConfig);
        }
      }
    }
  } catch (err) {
    console.warn('Supabase DB save warning (saved to persistent local storage):', err);
  }

  return cleanConfig;
}

/**
 * Reset configuration in Supabase Database to default schema
 */
export async function resetDatabaseConfig(): Promise<BirthdayConfigType> {
  const defaultConfig = { ...birthdayConfig };
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch (e) {}
  return await saveDatabaseConfig(defaultConfig);
}

/**
 * Save Media File (Photo/Audio)
 */
export async function saveMediaFile(dataUrl: string, fileName: string): Promise<string> {
  return dataUrl;
}
