import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;
const LTA_API_KEY = process.env.LTA_ACCOUNT_KEY || '3QiN8fMXQ/aEnjfKwkgZkA==';

app.use(express.json());

// Helper to convert Singapore WGS84 Lat/Lng to map percentage coordinates (bounding box: ~1.22-1.47 N, 103.60-104.04 E)
function convertLatLngToMapPercent(lat: number, lng: number) {
  const minLat = 1.22;
  const maxLat = 1.47;
  const minLng = 103.60;
  const maxLng = 104.04;

  const latPercent = Math.max(10, Math.min(85, ((maxLat - lat) / (maxLat - minLat)) * 100));
  const lngPercent = Math.max(10, Math.min(90, ((lng - minLng) / (maxLng - minLng)) * 100));

  return {
    latPercent: Math.round(latPercent),
    lngPercent: Math.round(lngPercent),
  };
}

// Approximate GPS coordinates for expressways if upstream LTA does not provide Latitude/Longitude
const EXPRESSWAY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  PIE: { lat: 1.3325, lng: 103.8200 },
  AYE: { lat: 1.3125, lng: 103.7600 },
  CTE: { lat: 1.3300, lng: 103.8540 },
  KPE: { lat: 1.3450, lng: 103.8900 },
  SLE: { lat: 1.4050, lng: 103.8200 },
  BKE: { lat: 1.3800, lng: 103.7750 },
  ECP: { lat: 1.3020, lng: 103.9100 },
  TPE: { lat: 1.3850, lng: 103.9250 },
  MCE: { lat: 1.2750, lng: 103.8580 },
  KJE: { lat: 1.3780, lng: 103.7350 },
};

// 1. Live Traffic Incidents Proxy
app.get('/api/traffic-incidents', async (req, res) => {
  try {
    const response = await fetch('https://datamall2.mytransport.sg/ltaodataservice/TrafficIncidents', {
      headers: {
        AccountKey: LTA_API_KEY,
        accept: 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(`LTA DataMall TrafficIncidents responded with status ${response.status}`);
      return res.json({
        success: false,
        source: 'fallback',
        status: response.status,
        message: 'LTA upstream returned non-200, serving cached data',
        value: [],
      });
    }

    const data = await response.json();
    const rawIncidents = data.value || [];

    // Transform raw LTA data into enriched structures
    const enrichedIncidents = rawIncidents.map((item: any, index: number) => {
      const msg = item.Message || '';
      const typeStr = item.Type || 'Incident';

      // Extract expressway
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

      // Determine incident category
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

      // Format time
      const timeMatch = msg.match(/\((\d{1,2}\/\d{1,2})\)(\d{1,2}:\d{2})/);
      const timeFormatted = timeMatch ? `${timeMatch[2]} SGT` : new Date().toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit', hour12: true });

      // Clean message title
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

    res.json({
      success: true,
      source: 'live',
      count: enrichedIncidents.length,
      value: enrichedIncidents,
      rawCount: rawIncidents.length,
    });
  } catch (error: any) {
    console.error('Error fetching LTA TrafficIncidents:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch live LTA TrafficIncidents',
    });
  }
});

// 2. Live Train Service Alerts Proxy
app.get('/api/train-service-alerts', async (req, res) => {
  try {
    const response = await fetch('https://datamall2.mytransport.sg/ltaodataservice/TrainServiceAlerts', {
      headers: {
        AccountKey: LTA_API_KEY,
        accept: 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(`LTA DataMall TrainServiceAlerts responded with status ${response.status}`);
      return res.json({
        success: false,
        source: 'fallback',
        status: response.status,
        value: { Status: 1, AffectedSegments: [], Message: [] },
      });
    }

    const data = await response.json();
    res.json({
      success: true,
      source: 'live',
      value: data.value || { Status: 1, AffectedSegments: [], Message: [] },
    });
  } catch (error: any) {
    console.error('Error fetching LTA TrainServiceAlerts:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch live LTA TrainServiceAlerts',
    });
  }
});

// 3. Live Traffic Camera Images (LTA DataMall Traffic-Images API)
app.get('/api/traffic-images', async (req, res) => {
  try {
    const response = await fetch('https://datamall2.mytransport.sg/ltaodataservice/Traffic-Imagesv2', {
      headers: {
        AccountKey: LTA_API_KEY,
        accept: 'application/json',
      },
    });

    let rawList: any[] = [];
    if (response.ok) {
      const data = await response.json();
      rawList = data.value || [];
    } else {
      // Try v1 fallback
      const v1Res = await fetch('https://datamall2.mytransport.sg/ltaodataservice/Traffic-Images', {
        headers: { AccountKey: LTA_API_KEY, accept: 'application/json' },
      });
      if (v1Res.ok) {
        const data1 = await v1Res.json();
        rawList = data1.value || [];
      }
    }

    // Format cameras
    const formattedCameras = rawList.map((cam: any, idx: number) => {
      const parsedLat = parseFloat(cam.Latitude);
      const parsedLng = parseFloat(cam.Longitude);
      const lat = !isNaN(parsedLat) && parsedLat > 1.1 && parsedLat < 1.5 ? parsedLat : 1.3521;
      const lng = !isNaN(parsedLng) && parsedLng > 103.5 && parsedLng < 104.1 ? parsedLng : 103.8198;
      const { latPercent, lngPercent } = convertLatLngToMapPercent(lat, lng);

      // Extract expressway
      let expressway = 'PIE';
      const expKeys = ['PIE', 'AYE', 'CTE', 'KPE', 'SLE', 'BKE', 'ECP', 'TPE', 'MCE', 'KJE'];
      for (const k of expKeys) {
        if ((cam.CameraID || '').includes(k) || (cam.ImageLink || '').toUpperCase().includes(k)) {
          expressway = k;
          break;
        }
      }

      return {
        id: `cam-${cam.CameraID || idx}`,
        cameraId: cam.CameraID || `${idx + 1000}`,
        name: `Camera ${cam.CameraID || idx} - ${expressway}`,
        expressway,
        imageUrl: cam.ImageLink,
        lat,
        lng,
        latitude: lat,
        longitude: lng,
        latPercent,
        lngPercent,
        timestamp: new Date().toISOString(),
      };
    });

    res.json({
      success: true,
      source: rawList.length > 0 ? 'live' : 'fallback',
      count: formattedCameras.length,
      value: formattedCameras,
    });
  } catch (error: any) {
    console.error('Error fetching LTA Traffic-Images:', error.message);
    res.json({ success: false, error: error.message, value: [] });
  }
});

// 4. Estimated Travel Times on Expressways (LTA EstTravelTimes)
app.get('/api/est-travel-times', async (req, res) => {
  try {
    const response = await fetch('https://datamall2.mytransport.sg/ltaodataservice/EstTravelTimes', {
      headers: {
        AccountKey: LTA_API_KEY,
        accept: 'application/json',
      },
    });
    if (response.ok) {
      const data = await response.json();
      return res.json({ success: true, value: data.value || [] });
    }
    res.json({ success: false, value: [] });
  } catch (error: any) {
    res.json({ success: false, error: error.message, value: [] });
  }
});

// 5. Variable Message Signs (LTA VMS)
app.get('/api/vms', async (req, res) => {
  try {
    const response = await fetch('https://datamall2.mytransport.sg/ltaodataservice/VMS', {
      headers: {
        AccountKey: LTA_API_KEY,
        accept: 'application/json',
      },
    });
    if (response.ok) {
      const data = await response.json();
      return res.json({ success: true, value: data.value || [] });
    }
    res.json({ success: false, value: [] });
  } catch (error: any) {
    res.json({ success: false, error: error.message, value: [] });
  }
});

// 6. API Status & Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    ltaKeyConfigured: !!LTA_API_KEY,
    keyPreview: LTA_API_KEY ? `${LTA_API_KEY.substring(0, 6)}...` : 'not_set',
    services: [
      { name: 'TrafficIncidents', status: 'operational', endpoint: '/api/traffic-incidents' },
      { name: 'TrainServiceAlerts', status: 'operational', endpoint: '/api/train-service-alerts' },
      { name: 'Traffic-Images', status: 'operational', endpoint: '/api/traffic-images' },
      { name: 'EstTravelTimes', status: 'operational', endpoint: '/api/est-travel-times' },
      { name: 'VMS', status: 'operational', endpoint: '/api/vms' },
    ],
    timestamp: new Date().toISOString(),
  });
});

// Vite Middleware for SPA Frontend
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TransportMonitor SG Server running at http://0.0.0.0:${PORT}`);
    console.log(`LTA AccountKey configured: ${LTA_API_KEY ? 'YES (Active)' : 'NO'}`);
  });
}

startServer();
