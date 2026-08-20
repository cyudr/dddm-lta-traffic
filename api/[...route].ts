import trafficIncidents from './_lib/routes/traffic-incidents';
import trainServiceAlerts from './_lib/routes/train-service-alerts';
import historicalTrends from './_lib/routes/historical-trends';
import trafficImages from './_lib/routes/traffic-images';
import cameraImageProxy from './_lib/routes/camera-image-proxy';
import estTravelTimes from './_lib/routes/est-travel-times';
import vms from './_lib/routes/vms';
import trafficSpeedBands from './_lib/routes/traffic-speed-bands';
import roadWorks from './_lib/routes/road-works';
import faultyTrafficLights from './_lib/routes/faulty-traffic-lights';
import carparkAvailability from './_lib/routes/carpark-availability';
import busArrival from './_lib/routes/bus-arrival';
import busStops from './_lib/routes/bus-stops';
import crowdDensity from './_lib/routes/crowd-density';
import taxiAvailability from './_lib/routes/taxi-availability';
import taxiStands from './_lib/routes/taxi-stands';
import bicycleParking from './_lib/routes/bicycle-parking';
import roadOpenings from './_lib/routes/road-openings';
import mobilityDatasets from './_lib/routes/mobility-datasets';
import health from './_lib/routes/health';

// Vercel Hobby plan caps a deployment at 12 Serverless Functions. Every LTA
// DataMall route below used to be its own api/*.ts file (20 functions);
// they now live as plain handlers under api/_lib/routes (the "_lib" prefix
// excludes them from Vercel's function count) and are dispatched here from
// a single catch-all function, so the whole API surface costs just 1.
const routes: Record<string, (req: any, res: any) => any> = {
  'traffic-incidents': trafficIncidents,
  'train-service-alerts': trainServiceAlerts,
  'historical-trends': historicalTrends,
  'traffic-images': trafficImages,
  'camera-image-proxy': cameraImageProxy,
  'est-travel-times': estTravelTimes,
  vms,
  'traffic-speed-bands': trafficSpeedBands,
  'road-works': roadWorks,
  'faulty-traffic-lights': faultyTrafficLights,
  'carpark-availability': carparkAvailability,
  'bus-arrival': busArrival,
  'bus-stops': busStops,
  'crowd-density': crowdDensity,
  'taxi-availability': taxiAvailability,
  'taxi-stands': taxiStands,
  'bicycle-parking': bicycleParking,
  'road-openings': roadOpenings,
  'mobility-datasets': mobilityDatasets,
  health,
};

export default async function handler(req: any, res: any) {
  const routeParam = req.query?.route;
  const segment = Array.isArray(routeParam) ? routeParam[0] : routeParam;
  const target = segment ? routes[segment] : undefined;

  if (!target) {
    res.status(404).json({ success: false, error: `Unknown API route: /api/${segment || ''}` });
    return;
  }

  return target(req, res);
}
