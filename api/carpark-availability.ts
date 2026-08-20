import { fetchLTAEndpoint } from './_lib/lta';

// Carpark Availability
export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  try {
    const response = await fetchLTAEndpoint('CarParkAvailabilityv2');
    if (response.ok) {
      const data = await response.json();
      const rawList = data.value || [];
      const formatted = rawList.map((cp: any) => {
        const coords = (cp.Location || '').trim().split(' ');
        const lat = coords.length === 2 ? parseFloat(coords[0]) : 1.3521;
        const lng = coords.length === 2 ? parseFloat(coords[1]) : 103.8198;
        return {
          carParkID: cp.CarParkID,
          area: cp.Area || 'Singapore',
          development: cp.Development || 'Carpark',
          location: cp.Location,
          availableLots: parseInt(cp.AvailableLots, 10) || 0,
          lotType: cp.LotType || 'C',
          agency: cp.Agency || 'HDB',
          latitude: !isNaN(lat) && lat > 1.1 && lat < 1.5 ? lat : 1.3521,
          longitude: !isNaN(lng) && lng > 103.5 && lng < 104.1 ? lng : 103.8198,
        };
      });
      return res.status(200).json({ success: true, count: formatted.length, value: formatted });
    }
    res.status(200).json({ success: false, value: [] });
  } catch (error: any) {
    res.status(200).json({ success: false, error: error.message, value: [] });
  }
}
