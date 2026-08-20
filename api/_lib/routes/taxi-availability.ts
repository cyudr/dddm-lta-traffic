import { fetchLTAEndpoint } from '../lta';

// Real-time Available Taxis (Taxi-Availability)
export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  try {
    const response = await fetchLTAEndpoint('Taxi-Availability');
    if (response.ok) {
      const data = await response.json();
      const taxis = (data.value || [])
        .map((t: any) => ({
          latitude: parseFloat(t.Latitude),
          longitude: parseFloat(t.Longitude),
        }))
        .filter((t: any) => !isNaN(t.latitude) && !isNaN(t.longitude));

      return res.status(200).json({
        success: true,
        count: taxis.length,
        value: taxis,
        timestamp: new Date().toISOString(),
      });
    }
    res.status(200).json({ success: false, count: 0, value: [] });
  } catch (error: any) {
    res.status(200).json({ success: false, error: error.message, value: [] });
  }
}
