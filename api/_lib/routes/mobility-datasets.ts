import { fetchLTAEndpoint } from '../lta';

// LTA Open Data Mobility Datasets (Passenger Volumes & Traffic Flow)
export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  try {
    const datasetEndpoints = [
      { id: 'pv-bus', title: 'Passenger Volume by Bus Stops (Monthly)', category: 'Passenger Volume', ep: 'PV/Bus', desc: 'Tap-in and tap-out passenger trip volumes at all 5,000+ bus stops in Singapore' },
      { id: 'pv-train', title: 'Passenger Volume by Train Stations (Monthly)', category: 'Passenger Volume', ep: 'PV/Train', desc: 'Monthly origin-destination ridership aggregated by MRT/LRT rail station nodes' },
      { id: 'pv-od-bus', title: 'Origin-Destination Bus Trips Matrix (Monthly)', category: 'Origin-Destination', ep: 'PV/ODBus', desc: 'Hourly origin to destination public bus commuter trip flow matrix' },
      { id: 'pv-od-train', title: 'Origin-Destination Train Trips Matrix (Monthly)', category: 'Origin-Destination', ep: 'PV/ODTrain', desc: 'Hourly origin to destination MRT train passenger mobility matrix' },
      { id: 'traffic-flow', title: 'Whole-Island Real-Time Traffic Flow Dataset', category: 'Traffic Flow', ep: 'TrafficFlow', desc: 'Comprehensive Singapore expressway traffic flow speed band raw geo-dataset' },
    ];

    const results = await Promise.all(
      datasetEndpoints.map(async (item) => {
        try {
          const resp = await fetchLTAEndpoint(item.ep);
          if (resp.ok) {
            const data = await resp.json();
            const link = data.value?.[0]?.Link || '';
            return {
              id: item.id,
              title: item.title,
              category: item.category,
              period: 'Latest Monthly Release',
              downloadLink: link,
              description: item.desc,
            };
          }
        } catch (e) {
          // ignore
        }
        return {
          id: item.id,
          title: item.title,
          category: item.category,
          period: 'Monthly Release',
          downloadLink: '',
          description: item.desc,
        };
      })
    );

    res.status(200).json({ success: true, value: results });
  } catch (error: any) {
    res.status(200).json({ success: false, error: error.message, value: [] });
  }
}
