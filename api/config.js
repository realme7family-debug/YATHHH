const SUPABASE_BASE_URL = 'https://njfafjfosrdahwamncus.supabase.co/rest/v1';
const SUPABASE_API_KEY = 'sb_publishable_iV1GPV3oNzXmgLJbyY4WQw_aN0A_ZiX';
const TABLE_NAME = 'config';
const DOC_ID = 'production_config';

const getSupabaseHeaders = (isWrite = false) => {
  const headers = {
    'apikey': SUPABASE_API_KEY,
    'Authorization': `Bearer ${SUPABASE_API_KEY}`,
  };
  if (isWrite) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

async function parseRequestBody(req) {
  if (req.body) {
    if (typeof req.body === 'object') return req.body;
    if (typeof req.body === 'string') {
      try { return JSON.parse(req.body); } catch (e) {}
    }
  }
  return new Promise((resolve) => {
    let bodyData = '';
    req.on('data', (chunk) => { bodyData += chunk; });
    req.on('end', () => {
      try {
        resolve(JSON.parse(bodyData));
      } catch (e) {
        resolve({});
      }
    });
  });
}

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
        const response = await fetch(`${SUPABASE_BASE_URL}/${TABLE_NAME}?id=eq.${DOC_ID}&select=*`, {
          method: 'GET',
          headers: getSupabaseHeaders(false),
        });

        const status = response.status;
        const responseText = await response.text();

        if (response.ok) {
          let rows = [];
          try { rows = JSON.parse(responseText); } catch(e) {}
          if (Array.isArray(rows) && rows.length > 0) {
            const data = rows[0].data || rows[0].config || rows[0];
            if (data && typeof data === 'object' && Object.keys(data).length > 0) {
              return res.status(200).json({ success: true, data });
            }
          }
        }
        return res.status(200).json({ success: false, error: 'Database document not found', status, responseText });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message, stack: err.stack });
      }
    }

    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      const body = await parseRequestBody(req);
      const payload = body?.config || body;
      const { _id, ...cleanPayload } = payload || {};

      if (!cleanPayload || Object.keys(cleanPayload).length === 0) {
        return res.status(400).json({ success: false, error: 'Payload body is empty' });
      }

      try {
        const upsertRes = await fetch(`${SUPABASE_BASE_URL}/${TABLE_NAME}`, {
          method: 'POST',
          headers: {
            ...getSupabaseHeaders(true),
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
        } else {
          const errorText = await upsertRes.text();
          console.error('Supabase DB save error:', upsertRes.status, errorText);
          return res.status(500).json({ success: false, error: errorText });
        }
      } catch (cloudErr) {
        console.error('Supabase DB exception:', cloudErr);
        return res.status(500).json({ success: false, error: cloudErr.message });
      }
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
