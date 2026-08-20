import { fetchLTAEndpoint } from '../lta';

// Estimated Travel Times
export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  try {
    const response = await fetchLTAEndpoint('EstTravelTimes');
    if (response.ok) {
      const data = await response.json();
      return res.status(200).json({ success: true, value: data.value || [] });
    }
    res.status(200).json({ success: false, value: [] });
  } catch (error: any) {
    res.status(200).json({ success: false, error: error.message, value: [] });
  }
}
