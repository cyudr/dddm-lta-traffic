import { fetchLTAEndpoint } from '../lta';

// Live Bus Arrival Timings (v3/BusArrival)
export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  try {
    const busStopCode = req.query.BusStopCode as string;
    const serviceNo = req.query.ServiceNo as string;

    if (!busStopCode) {
      return res.status(400).json({ success: false, error: 'BusStopCode is required' });
    }

    let url = `v3/BusArrival?BusStopCode=${encodeURIComponent(busStopCode)}`;
    if (serviceNo) {
      url += `&ServiceNo=${encodeURIComponent(serviceNo)}`;
    }

    const response = await fetchLTAEndpoint(url);
    if (!response.ok) {
      return res.status(200).json({
        success: false,
        status: response.status,
        busStopCode,
        services: [],
      });
    }

    const data = await response.json();
    const rawServices = data.Services || [];

    const now = Date.now();

    const parseNextBus = (nb: any) => {
      if (!nb || !nb.EstimatedArrival) return undefined;
      const arrTime = new Date(nb.EstimatedArrival).getTime();
      const diffMs = arrTime - now;
      const minutesUntilArrival = Math.max(0, Math.round(diffMs / 60000));
      return {
        originCode: nb.OriginCode || '',
        destinationCode: nb.DestinationCode || '',
        estimatedArrival: nb.EstimatedArrival,
        minutesUntilArrival,
        latitude: parseFloat(nb.Latitude) || undefined,
        longitude: parseFloat(nb.Longitude) || undefined,
        visitNumber: parseInt(nb.VisitNumber, 10) || 1,
        load: (nb.Load || 'SEA') as 'SEA' | 'SDA' | 'LSD',
        feature: (nb.Feature || '') as 'WAB' | '',
        type: (nb.Type || 'SD') as 'SD' | 'DD' | 'BD',
      };
    };

    const formattedServices = rawServices.map((svc: any) => ({
      serviceNo: svc.ServiceNo,
      operator: svc.Operator,
      nextBus: parseNextBus(svc.NextBus),
      nextBus2: parseNextBus(svc.NextBus2),
      nextBus3: parseNextBus(svc.NextBus3),
    }));

    res.status(200).json({
      success: true,
      busStopCode: data.BusStopCode || busStopCode,
      count: formattedServices.length,
      services: formattedServices,
    });
  } catch (error: any) {
    res.status(200).json({ success: false, error: error.message, services: [] });
  }
}
