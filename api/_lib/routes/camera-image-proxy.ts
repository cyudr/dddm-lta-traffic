import { LTA_API_KEY } from '../lta';

// Camera Image Binary Proxy
export default async function handler(req: any, res: any) {
  try {
    const imageUrl = req.query.url as string;
    if (!imageUrl) {
      return res.status(400).send('Missing url parameter');
    }

    const imgResponse = await fetch(imageUrl, {
      headers: {
        AccountKey: LTA_API_KEY,
        'User-Agent': 'Mozilla/5.0 TransportMonitorSG/1.0',
      },
    });

    if (!imgResponse.ok) {
      return res.status(imgResponse.status).send('Upstream image error');
    }

    const contentType = imgResponse.headers.get('content-type') || 'image/jpeg';
    const buffer = await imgResponse.arrayBuffer();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=15');
    res.status(200).send(Buffer.from(buffer));
  } catch (error: any) {
    res.status(502).send('Camera stream proxy failure');
  }
}
