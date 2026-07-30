const SUPABASE_BASE_URL = 'https://njfafjfosrdahwamncus.supabase.co/rest/v1';
const SUPABASE_API_KEY = 'sb_publishable_iV1GPV3oNzXmgLJbyY4WQw_aN0A_ZiX';
const TABLE_NAME = 'config';
const DOC_ID = 'production_config';

let serverMemoryStore = null;

const getSupabaseHeaders = () => ({
  'apikey': SUPABASE_API_KEY,
  'Authorization': `Bearer ${SUPABASE_API_KEY}`,
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const method = req.method ? req.method.toUpperCase() : 'GET';

    if (method === 'GET') {
      try {
        const response = await fetch(`${SUPABASE_BASE_URL}/${TABLE_NAME}?id=eq.${DOC_ID}&select=*&t=${Date.now()}`, {
          method: 'GET',
          headers: getSupabaseHeaders(),
          cache: 'no-store',
        });

        if (response.ok) {
          const rows = await response.json();
          if (Array.isArray(rows) && rows.length > 0) {
            const data = rows[0].data || rows[0].config || rows[0];
            if (data && typeof data === 'object') {
              serverMemoryStore = data;
              return res.status(200).json({ success: true, data });
            }
          }
        }
      } catch (err) {
        console.warn('GET Supabase DB warning:', err);
      }

      return res.status(200).json({
        success: true,
        data: serverMemoryStore || null,
      });
    }

    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (e) {}
      }
      const payload = body?.config || body;
      const { _id, ...cleanPayload } = payload || {};

      serverMemoryStore = cleanPayload;

      try {
        const upsertRes = await fetch(`${SUPABASE_BASE_URL}/${TABLE_NAME}`, {
          method: 'POST',
          headers: {
            ...getSupabaseHeaders(),
            'Prefer': 'resolution=merge-duplicates,return=representation',
          },
          body: JSON.stringify({
            id: DOC_ID,
            data: cleanPayload,
            updated_at: new Date().toISOString(),
          }),
        });

        if (!upsertRes.ok) {
          await fetch(`${SUPABASE_BASE_URL}/${TABLE_NAME}?id=eq.${DOC_ID}`, {
            method: 'PATCH',
            headers: getSupabaseHeaders(),
            body: JSON.stringify({
              id: DOC_ID,
              data: cleanPayload,
              updated_at: new Date().toISOString(),
            }),
          });
        }
      } catch (cloudErr) {
        console.warn('Supabase persistence write warning:', cloudErr);
      }

      return res.status(200).json({ success: true, data: cleanPayload });
    }

    if (method === 'DELETE') {
      serverMemoryStore = null;
      return res.status(200).json({ success: true, data: {} });
    }

    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  } catch (err) {
    console.error('API Error:', err);
    return res.status(200).json({
      success: true,
      data: serverMemoryStore || {},
    });
  }
}
