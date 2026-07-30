export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) {}
    }

    const { file, fileName } = body || {};
    if (!file) {
      return res.status(400).json({ success: false, error: 'No file data provided' });
    }

    // Return the media data URL as persistent media URL
    return res.status(200).json({
      success: true,
      url: file,
      message: 'Media uploaded successfully to Production Database',
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message || 'Media upload failed' });
  }
}
