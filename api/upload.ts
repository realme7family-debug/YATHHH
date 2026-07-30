import { v2 as cloudinary } from 'cloudinary';
import { saveMediaFile } from '../src/lib/db';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export default async function handler(req: any, res: any) {
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
      try {
        body = JSON.parse(body);
      } catch (e) {
        // ignore
      }
    }

    const { file, fileName, resourceType } = body || {};
    if (!file) {
      return res.status(400).json({ success: false, error: 'No file data provided' });
    }

    let url = '';

    // If Cloudinary is configured, upload to Cloudinary
    if (cloudName && apiKey && apiSecret) {
      try {
        const uploadResult = await cloudinary.uploader.upload(file, {
          folder: 'yaathh_birthday',
          resource_type: resourceType === 'audio' ? 'video' : 'auto',
        });
        url = uploadResult.secure_url;
      } catch (cloudErr) {
        console.error('Cloudinary upload error, falling back to database media storage:', cloudErr);
      }
    }

    // Fallback to production database media storage
    if (!url) {
      url = await saveMediaFile(file, fileName || 'upload');
    }

    return res.status(200).json({
      success: true,
      url,
      message: 'Media uploaded successfully to Production Database',
    });
  } catch (error: any) {
    console.error('API /api/upload Error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Media upload failed' });
  }
}
