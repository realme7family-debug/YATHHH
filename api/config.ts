import type { IncomingMessage, ServerResponse } from 'http';
import { getDatabaseConfig, saveDatabaseConfig, resetDatabaseConfig } from '../src/lib/db';

export default async function handler(req: any, res: any) {
  // CORS & Security Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Cache Control: Disable browser & CDN caching completely
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const method = req.method?.toUpperCase();

    if (method === 'GET') {
      const config = await getDatabaseConfig();
      return res.status(200).json({ success: true, data: config });
    }

    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch (e) {
          // ignore error
        }
      }
      // Handle wrapped payload { config: ... } or raw config
      const payload = body?.config || body;

      if (!payload || typeof payload !== 'object') {
        return res.status(400).json({ success: false, error: 'Invalid configuration payload' });
      }

      const updated = await saveDatabaseConfig(payload);
      return res.status(200).json({ success: true, data: updated });
    }

    if (method === 'DELETE') {
      const reset = await resetDatabaseConfig();
      return res.status(200).json({ success: true, data: reset });
    }

    return res.status(405).json({ success: false, error: `Method ${method} Not Allowed` });
  } catch (error: any) {
    console.error('API /api/config Error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
}
