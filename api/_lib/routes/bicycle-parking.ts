import { fetchLTAEndpoint } from '../lta';

// Bicycle Parking Racks (BicycleParkingv2)
export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  try {
    const lat = req.query.lat ? parseFloat(req.query.lat as string) : 1.3521;
    const lng = req.query.lng ? parseFloat(req.query.lng as string) : 103.8198;
    const dist = req.query.dist ? parseFloat(req.query.dist as string) : 5;

    const response = await fetchLTAEndpoint(`BicycleParkingv2?Lat=${lat}&Long=${lng}&Dist=${dist}`);
    if (response.ok) {
      const data = await response.json();
      const racks = (data.value || []).map((r: any) => ({
        description: r.Description || 'Bicycle Rack',
        latitude: parseFloat(r.Latitude) || lat,
        longitude: parseFloat(r.Longitude) || lng,
        rackType: r.RackType || 'MRT_RACKS',
        rackCount: parseInt(r.RackCount, 10) || 0,
        shelterIndicator: r.ShelterIndicator || 'N',
      }));
      return res.status(200).json({ success: true, count: racks.length, value: racks });
    }
    res.status(200).json({ success: false, value: [] });
  } catch (error: any) {
    res.status(200).json({ success: false, error: error.message, value: [] });
  }
}
