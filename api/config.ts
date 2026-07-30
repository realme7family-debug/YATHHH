import { birthdayConfig } from '../src/config/birthdayConfig';

const GLOBAL_CLOUD_DB_BASE = 'https://crudcrud.com/api/318219a1537140e8a665fc86f1610e59/config';
const GLOBAL_CLOUD_DOC_ID = '6a6b7a6280807903e8b0e435';
const GLOBAL_CLOUD_DOC_URL = `${GLOBAL_CLOUD_DB_BASE}/${GLOBAL_CLOUD_DOC_ID}`;

async function getDatabaseConfig() {
  try {
    const res = await fetch(`${GLOBAL_CLOUD_DB_BASE}?t=${Date.now()}`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
      cache: 'no-store',
    });
    if (res.ok) {
      const docs = await res.json();
      if (Array.isArray(docs) && docs.length > 0) {
        const latestDoc = docs[docs.length - 1];
        const { _id, ...cleanData } = latestDoc;
        if (cleanData && cleanData.name) {
          return { ...birthdayConfig, ...cleanData };
        }
      }
    }
  } catch (err) {
    console.error('Error fetching global cloud config:', err);
  }
  return birthdayConfig;
}

async function saveDatabaseConfig(config: any) {
  try {
    const { _id, ...cleanPayload } = config;
    const putRes = await fetch(GLOBAL_CLOUD_DOC_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
      body: JSON.stringify(cleanPayload),
    });
    if (putRes.ok || putRes.status === 200) {
      return { ...birthdayConfig, ...cleanPayload };
    } else {
      const postRes = await fetch(GLOBAL_CLOUD_DB_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
        body: JSON.stringify(cleanPayload),
      });
      if (postRes.ok) {
        const json = await postRes.json();
        const { _id: newId, ...savedData } = json;
        return { ...birthdayConfig, ...savedData };
      }
    }
  } catch (err) {
    console.error('Error saving global cloud config:', err);
  }
  return config;
}

export default async function handler(req: any, res: any) {
  const sendJson = (statusCode: number, payload: any) => {
    try {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      if (res.status && typeof res.status === 'function') {
        return res.status(statusCode).json(payload);
      }
      res.statusCode = statusCode;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(payload));
    } catch (err) {
      console.error('Error sending JSON response:', err);
    }
  };

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (res.status && typeof res.status === 'function') {
      return res.status(200).end();
    }
    res.statusCode = 200;
    return res.end();
  }

  try {
    const method = req.method?.toUpperCase();

    if (method === 'GET') {
      const config = await getDatabaseConfig();
      return sendJson(200, { success: true, data: config });
    }

    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch (e) {
          // ignore
        }
      }
      const payload = body?.config || body;

      if (!payload || typeof payload !== 'object') {
        return sendJson(400, { success: false, error: 'Invalid configuration payload' });
      }

      const updated = await saveDatabaseConfig(payload);
      return sendJson(200, { success: true, data: updated });
    }

    if (method === 'DELETE') {
      const reset = await saveDatabaseConfig(birthdayConfig);
      return sendJson(200, { success: true, data: reset });
    }

    return sendJson(405, { success: false, error: `Method ${method} Not Allowed` });
  } catch (error: any) {
    console.error('API /api/config Error:', error);
    return sendJson(500, { success: false, error: error.message || 'Internal Server Error' });
  }
}
