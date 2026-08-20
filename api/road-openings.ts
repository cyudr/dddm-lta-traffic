import { fetchLTAEndpoint } from './_lib/lta';

// Active Road Openings & Utility Works (RoadOpenings)
export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  try {
    const response = await fetchLTAEndpoint('RoadOpenings');
    if (response.ok) {
      const data = await response.json();
      const openings = (data.value || []).map((o: any) => ({
        eventId: o.EventID,
        startDate: o.StartDate,
        endDate: o.EndDate,
        svcDept: o.SvcDept || 'LTA',
        roadName: o.RoadName || 'Roadway',
        other: o.Other || '',
      }));
      return res.status(200).json({ success: true, count: openings.length, value: openings });
    }
    res.status(200).json({ success: false, value: [] });
  } catch (error: any) {
    res.status(200).json({ success: false, error: error.message, value: [] });
  }
}
