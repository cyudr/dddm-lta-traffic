import { fetchLTAEndpoint } from './_lib/lta';

// Bus Stops Directory & Search (BusStops)
// Note: each serverless invocation is stateless, so this in-memory cache only
// helps warm invocations within the same function instance, not across all of them.
let cachedBusStops: any[] = [];
let lastBusStopsFetch = 0;

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  try {
    const search = ((req.query.search || req.query.q || '') as string).toLowerCase().trim();
    const code = ((req.query.code as string) || '').trim();

    // Cache bus stops for 30 minutes
    if (cachedBusStops.length === 0 || Date.now() - lastBusStopsFetch > 1800000) {
      const response = await fetchLTAEndpoint('BusStops');
      if (response.ok) {
        const data = await response.json();
        cachedBusStops = (data.value || []).map((bs: any) => ({
          busStopCode: bs.BusStopCode,
          roadName: bs.RoadName,
          description: bs.Description,
          latitude: parseFloat(bs.Latitude) || 1.3521,
          longitude: parseFloat(bs.Longitude) || 103.8198,
        }));
        lastBusStopsFetch = Date.now();
      }
    }

    let results = cachedBusStops;

    if (code) {
      results = results.filter((bs) => bs.busStopCode === code);
    } else if (search) {
      results = results.filter(
        (bs) =>
          bs.busStopCode.includes(search) ||
          bs.description.toLowerCase().includes(search) ||
          bs.roadName.toLowerCase().includes(search)
      );
    }

    res.status(200).json({
      success: true,
      count: results.length,
      value: results.slice(0, 100),
    });
  } catch (error: any) {
    res.status(200).json({ success: false, error: error.message, value: [] });
  }
}
