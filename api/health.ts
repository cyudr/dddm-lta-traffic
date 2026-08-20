import { LTA_API_KEY } from './_lib/lta';

// Health check
export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({
    status: 'ok',
    ltaKeyConfigured: !!LTA_API_KEY,
    keyPreview: LTA_API_KEY ? `${LTA_API_KEY.substring(0, 6)}...` : 'not_set',
    services: [
      { name: 'TrafficIncidents', status: 'operational', endpoint: '/api/traffic-incidents' },
      { name: 'TrainServiceAlerts', status: 'operational', endpoint: '/api/train-service-alerts' },
      { name: 'Traffic-Imagesv2', status: 'operational', endpoint: '/api/traffic-images' },
      { name: 'v3/BusArrival', status: 'operational', endpoint: '/api/bus-arrival?BusStopCode=01012' },
      { name: 'BusStops', status: 'operational', endpoint: '/api/bus-stops' },
      { name: 'PCDRealTime (MRT Crowds)', status: 'operational', endpoint: '/api/crowd-density' },
      { name: 'Taxi-Availability', status: 'operational', endpoint: '/api/taxi-availability' },
      { name: 'TaxiStands', status: 'operational', endpoint: '/api/taxi-stands' },
      { name: 'CarParkAvailabilityv2', status: 'operational', endpoint: '/api/carpark-availability' },
      { name: 'BicycleParkingv2', status: 'operational', endpoint: '/api/bicycle-parking' },
      { name: 'RoadOpenings', status: 'operational', endpoint: '/api/road-openings' },
      { name: 'TrafficSpeedBandsv2', status: 'operational', endpoint: '/api/traffic-speed-bands' },
      { name: 'EstTravelTimes', status: 'operational', endpoint: '/api/est-travel-times' },
      { name: 'VMS', status: 'operational', endpoint: '/api/vms' },
      { name: 'RoadWorks', status: 'operational', endpoint: '/api/road-works' },
      { name: 'FaultyTrafficLights', status: 'operational', endpoint: '/api/faulty-traffic-lights' },
      { name: 'MobilityDatasets', status: 'operational', endpoint: '/api/mobility-datasets' },
      { name: 'HistoricalTrends', status: 'operational', endpoint: '/api/historical-trends' },
    ],
    timestamp: new Date().toISOString(),
  });
}
