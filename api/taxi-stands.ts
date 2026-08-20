import { fetchLTAEndpoint } from './_lib/lta';

// Official Taxi Stands Directory (TaxiStands)
export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  try {
    const response = await fetchLTAEndpoint('TaxiStands');
    if (response.ok) {
      const data = await response.json();
      const stands = (data.value || []).map((s: any) => ({
        taxiCode: s.TaxiCode,
        latitude: parseFloat(s.Latitude) || 1.3521,
        longitude: parseFloat(s.Longitude) || 103.8198,
        bfa: s.Bfa || 'No',
        ownership: s.Ownership || 'LTA',
        type: s.Type || 'Stand',
        name: s.Name || `Taxi Stand ${s.TaxiCode}`,
      }));
      return res.status(200).json({ success: true, count: stands.length, value: stands });
    }
    res.status(200).json({ success: false, value: [] });
  } catch (error: any) {
    res.status(200).json({ success: false, error: error.message, value: [] });
  }
}
