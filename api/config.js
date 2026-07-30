const SUPABASE_BASE_URL = 'https://njfafjfosrdahwamncus.supabase.co/rest/v1';
const SUPABASE_API_KEY = 'sb_publishable_iV1GPV3oNzXmgLJbyY4WQw_aN0A_ZiX';
const TABLE_NAME = 'config';
const DOC_ID = 'production_config';

const getSupabaseHeaders = () => ({
  'apikey': SUPABASE_API_KEY,
  'Authorization': `Bearer ${SUPABASE_API_KEY}`,
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0');
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
              return res.status(200).json({ success: true, data });
            }
          }
        }
      } catch (err) {
        console.warn('GET Supabase DB fetch warning:', err);
      }

      return res.status(200).json({ success: false, error: 'Database record not found' });
    }

    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (e) {}
      }
      const payload = body?.config || body;
      const { _id, ...cleanPayload } = payload || {};

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

        if (upsertRes.ok) {
          const rows = await upsertRes.json();
          const savedData = (Array.isArray(rows) && rows[0]?.data) ? rows[0].data : cleanPayload;
          return res.status(200).json({ success: true, data: savedData });
        }
      } catch (cloudErr) {
        console.warn('Supabase DB save warning:', cloudErr);
      }

      return res.status(200).json({ success: true, data: cleanPayload });
    }

    if (method === 'DELETE') {
      return res.status(200).json({ success: true, data: {} });
    }

    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
