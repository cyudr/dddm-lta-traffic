import { fetchLTAEndpoint, EXPRESSWAY_COORDINATES, convertLatLngToMapPercent } from '../lta';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  try {
    const response = await fetchLTAEndpoint('TrafficIncidents');

    if (!response.ok) {
      return res.status(200).json({
        success: false,
        source: 'fallback',
        status: response.status,
        value: [],
      });
    }

    const data = await response.json();
    const rawIncidents = data.value || [];

    const enrichedIncidents = rawIncidents.map((item: any, index: number) => {
      const msg = item.Message || '';
      const typeStr = item.Type || 'Incident';

      let expressway = 'Roadway';
      const expMatches = ['PIE', 'AYE', 'CTE', 'KPE', 'SLE', 'BKE', 'ECP', 'TPE', 'MCE', 'KJE'];
      for (const exp of expMatches) {
        if (msg.toUpperCase().includes(exp)) {
          expressway = exp;
          break;
        }
      }

      const defaultCoords = EXPRESSWAY_COORDINATES[expressway] || { lat: 1.3521, lng: 103.8198 };
      const rawLat = parseFloat(item.Latitude);
      const rawLng = parseFloat(item.Longitude);

      const lat = !isNaN(rawLat) && rawLat > 1.1 && rawLat < 1.5 ? rawLat : defaultCoords.lat + (Math.random() - 0.5) * 0.02;
      const lng = !isNaN(rawLng) && rawLng > 103.5 && rawLng < 104.1 ? rawLng : defaultCoords.lng + (Math.random() - 0.5) * 0.02;

      let incidentType: 'accident' | 'roadworks' | 'congestion' | 'breakdown' | 'heavy_rain' = 'congestion';
      let severity: 'critical' | 'moderate' | 'minor' = 'moderate';

      const upperMsg = msg.toUpperCase();
      if (typeStr.toLowerCase().includes('accident') || upperMsg.includes('ACCIDENT')) {
        incidentType = 'accident';
        severity = 'critical';
      } else if (typeStr.toLowerCase().includes('roadwork') || upperMsg.includes('ROADWORK') || upperMsg.includes('ROAD WORKS')) {
        incidentType = 'roadworks';
        severity = 'moderate';
      } else if (typeStr.toLowerCase().includes('breakdown') || upperMsg.includes('BREAKDOWN') || upperMsg.includes('VEHICLE BREAKDOWN')) {
        incidentType = 'breakdown';
        severity = 'moderate';
      } else if (upperMsg.includes('HEAVY TRAFFIC') || upperMsg.includes('CONGESTION') || upperMsg.includes('SLOW')) {
        incidentType = 'congestion';
        severity = 'minor';
      }

      const timeMatch = msg.match(/\((\d{1,2}\/\d{1,2})\)(\d{1,2}:\d{2})/);
      const timeFormatted = timeMatch ? `${timeMatch[2]} SGT` : new Date().toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit', hour12: true });

      let title = `${expressway} Incident`;
      if (msg.includes('on ')) {
        const afterOn = msg.split('on ')[1];
        if (afterOn) {
          title = afterOn.split('.')[0].split(' Avoid')[0].substring(0, 45);
        }
      }

      const { latPercent, lngPercent } = convertLatLngToMapPercent(lat, lng);

      const tags = [expressway];
      let laneClosure = 'All lanes open';
      if (upperMsg.includes('LANE 1') || upperMsg.includes('LANE 2') || upperMsg.includes('LANE 3')) {
        const laneMatch = msg.match(/lane\s*\d+(?:,\s*\d+)?/i);
        if (laneMatch) {
          tags.push(laneMatch[0].toUpperCase() + ' CLOSED');
          laneClosure = laneMatch[0] + ' closed';
        }
      }

      return {
        id: `lta-${index + 1}`,
        type: incidentType,
        title: title || `${expressway} Alert`,
        expressway,
        location: msg.split('.')[0] || `${expressway} Sector`,
        description: msg,
        timestamp: new Date().toISOString(),
        timeFormatted,
        severity,
        tags,
        lat,
        lng,
        latPercent,
        lngPercent,
        laneClosure,
        estClearance: '25 mins',
        speedKmh: Math.floor(20 + Math.random() * 35),
      };
    });

    res.status(200).json({
      success: true,
      source: 'live',
      count: enrichedIncidents.length,
      value: enrichedIncidents,
      rawCount: rawIncidents.length,
    });
  } catch (error: any) {
    res.status(200).json({
      success: false,
      error: error.message,
      value: [],
    });
  }
}
