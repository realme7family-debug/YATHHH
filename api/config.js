const GLOBAL_CLOUD_DB_BASE = 'https://crudcrud.com/api/0ac992c15d2b480a8a101dd63b738841/config';
const GLOBAL_CLOUD_DOC_ID = '6a6b7e5e80807903e8b0e462';
const GLOBAL_CLOUD_DOC_URL = `${GLOBAL_CLOUD_DB_BASE}/${GLOBAL_CLOUD_DOC_ID}`;

// Server-side global memory store for instant zero-latency responses
let serverMemoryStore = null;

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
      if (serverMemoryStore && typeof serverMemoryStore === 'object') {
        return res.status(200).json({ success: true, data: serverMemoryStore });
      }

      try {
        const response = await fetch(`${GLOBAL_CLOUD_DB_BASE}?t=${Date.now()}`, { cache: 'no-store' });
        if (response.ok) {
          const docs = await response.json();
          if (Array.isArray(docs) && docs.length > 0) {
            const latestDoc = docs[docs.length - 1];
            const { _id, ...cleanData } = latestDoc;
            if (cleanData && cleanData.name) {
              serverMemoryStore = cleanData;
              return res.status(200).json({ success: true, data: cleanData });
            }
          }
        }
      } catch (err) {
        console.warn('GET cloud DB fetch warning, returning active memory store:', err);
      }

      return res.status(200).json({
        success: true,
        data: serverMemoryStore || { name: 'Bestie', coverGreeting: 'Happy Birthday' },
      });
    }

    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (e) {}
      }
      const payload = body?.config || body;
      const { _id, ...cleanPayload } = payload || {};

      // Immediately update server memory store
      serverMemoryStore = cleanPayload;

      // Asynchronously attempt network cloud persistence
      try {
        const putRes = await fetch(GLOBAL_CLOUD_DOC_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cleanPayload),
        });

        if (!putRes.ok && putRes.status !== 200) {
          await fetch(GLOBAL_CLOUD_DB_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cleanPayload),
          });
        }
      } catch (cloudErr) {
        console.warn('Cloud persistence write warning (retained in server memory store):', cloudErr);
      }

      return res.status(200).json({ success: true, data: cleanPayload });
    }

    if (method === 'DELETE') {
      serverMemoryStore = null;
      return res.status(200).json({ success: true, data: { name: 'Bestie', coverGreeting: 'Happy Birthday' } });
    }

    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  } catch (err) {
    console.error('API Error:', err);
    // Always return 200 with fallback data instead of crashing client form
    return res.status(200).json({
      success: true,
      data: serverMemoryStore || { name: 'Bestie', coverGreeting: 'Happy Birthday' },
    });
  }
}
