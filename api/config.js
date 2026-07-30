const GLOBAL_CLOUD_DB_BASE = 'https://crudcrud.com/api/318219a1537140e8a665fc86f1610e59/config';
const GLOBAL_CLOUD_DOC_ID = '6a6b7a6280807903e8b0e435';
const GLOBAL_CLOUD_DOC_URL = `${GLOBAL_CLOUD_DB_BASE}/${GLOBAL_CLOUD_DOC_ID}`;

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
      const response = await fetch(`${GLOBAL_CLOUD_DB_BASE}?t=${Date.now()}`, { cache: 'no-store' });
      if (response.ok) {
        const docs = await response.json();
        if (Array.isArray(docs) && docs.length > 0) {
          const latestDoc = docs[docs.length - 1];
          const { _id, ...cleanData } = latestDoc;
          if (cleanData && cleanData.name) {
            return res.status(200).json({ success: true, data: cleanData });
          }
        }
      }
      return res.status(200).json({ success: true, data: { name: 'Bestie', coverGreeting: 'Happy Birthday' } });
    }

    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (e) {}
      }
      const payload = body?.config || body;
      const { _id, ...cleanPayload } = payload || {};

      const putRes = await fetch(GLOBAL_CLOUD_DOC_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanPayload),
      });

      if (putRes.ok || putRes.status === 200) {
        return res.status(200).json({ success: true, data: cleanPayload });
      }

      const postRes = await fetch(GLOBAL_CLOUD_DB_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanPayload),
      });
      const json = await postRes.json();
      const { _id: newId, ...savedData } = json;
      return res.status(200).json({ success: true, data: savedData });
    }

    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
  }
}
