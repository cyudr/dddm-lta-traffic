import { fetchLTAEndpoint } from '../lta';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  try {
    const response = await fetchLTAEndpoint('TrainServiceAlerts');

    if (!response.ok) {
      return res.status(200).json({
        success: false,
        source: 'fallback',
        status: response.status,
        value: { Status: 1, AffectedSegments: [], Message: [] },
      });
    }

    const data = await response.json();
    res.status(200).json({
      success: true,
      source: 'live',
      value: data.value || { Status: 1, AffectedSegments: [], Message: [] },
    });
  } catch (error: any) {
    res.status(200).json({
      success: false,
      error: error.message,
      value: { Status: 1, AffectedSegments: [], Message: [] },
    });
  }
}
