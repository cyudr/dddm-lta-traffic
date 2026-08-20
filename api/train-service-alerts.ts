const LTA_API_KEY = process.env.LTA_ACCOUNT_KEY || process.env.VITE_LTA_ACCOUNT_KEY || '';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  try {
    const url = 'https://datamall2.mytransport.sg/ltaodataservice/TrainServiceAlerts';
    const response = await fetch(url, {
      headers: {
        AccountKey: LTA_API_KEY,
        accept: 'application/json',
      },
    });

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
