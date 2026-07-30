import { birthdayConfig, BirthdayConfigType } from '../config/birthdayConfig';

// Supabase API Credentials - Primary Single Source of Truth
const SUPABASE_BASE_URL = 'https://njfafjfosrdahwamncus.supabase.co/rest/v1';
const SUPABASE_API_KEY = 'sb_publishable_iV1GPV3oNzXmgLJbyY4WQw_aN0A_ZiX';
const TABLE_NAME = 'config';
const DOC_ID = 'production_config';

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
 * FETCH latest config directly from Single Source of Truth Production Database (Supabase / Backend API)
 * NO localStorage. NO device-specific memory overrides.
 */
export async function getDatabaseConfig(): Promise<BirthdayConfigType> {
  // 1. Try Vercel Serverless /api/config Endpoint (Backend Proxy with zero cache)
  try {
    const apiRes = await fetch(`/api/config?t=${Date.now()}`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
      cache: 'no-store',
    });
    if (apiRes.ok) {
      const json = await apiRes.json();
      if (json.success && json.data) {
        return mergeConfigSchema(json.data);
      }
    }
  } catch (e) {}

  // 2. Direct Supabase REST fetch
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
          return mergeConfigSchema(data);
        }
      }
    }
  } catch (err) {
    console.error('Error fetching config from Production Supabase Database:', err);
  }

  // 3. Fallback Initial Default Schema
  return { ...birthdayConfig };
}

/**
 * SAVE updated config directly into Single Source of Truth Production Database (Supabase / Backend API)
 */
export async function saveDatabaseConfig(newConfig: BirthdayConfigType): Promise<BirthdayConfigType> {
  if (!newConfig || typeof newConfig !== 'object') {
    throw new Error('Invalid configuration object');
  }

  const cleanConfig = mergeConfigSchema(newConfig);

  // 1. Try Vercel Serverless /api/config Endpoint first
  try {
    const apiRes = await fetch('/api/config', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
      cache: 'no-store',
      body: JSON.stringify(cleanConfig),
    });
    if (apiRes.ok) {
      const json = await apiRes.json();
      if (json.success && json.data) {
        return mergeConfigSchema(json.data);
      }
    }
  } catch (e) {}

  // 2. Direct Supabase REST Upsert
  try {
    const payload = {
      id: DOC_ID,
      data: cleanConfig,
      updated_at: new Date().toISOString(),
    };

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
    }
  } catch (err) {
    console.error('Error saving config to Production Supabase Database:', err);
  }

  return cleanConfig;
}

/**
 * RESET configuration in Production Database to default schema
 */
export async function resetDatabaseConfig(): Promise<BirthdayConfigType> {
  const defaultConfig = { ...birthdayConfig };
  return await saveDatabaseConfig(defaultConfig);
}

/**
 * Save Media File (Photo/Audio)
 */
export async function saveMediaFile(dataUrl: string, fileName: string): Promise<string> {
  return dataUrl;
}
