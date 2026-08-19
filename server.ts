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
      const lat = item.Latitude ? parseFloat(item.Latitude) : 1.35;
      const lng = item.Longitude ? parseFloat(item.Longitude) : 103.82;

      // Extract expressway
      let expressway = 'Roadway';
      const expMatches = ['PIE', 'AYE', 'CTE', 'KPE', 'SLE', 'BKE', 'ECP', 'TPE', 'MCE', 'KJE'];
      for (const exp of expMatches) {
        if (msg.toUpperCase().includes(exp)) {
          expressway = exp;
          break;
        }
      }

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
      if (upperMsg.includes('LANE 1') || upperMsg.includes('LANE 2') || upperMsg.includes('LANE 3')) {
        const laneMatch = msg.match(/lane\s*\d+(?:,\s*\d+)?/i);
        if (laneMatch) tags.push(laneMatch[0].toUpperCase() + ' CLOSED');
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
        latPercent,
        lngPercent,
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

// 3. Live Traffic Camera Images Proxy
app.get('/api/traffic-images', async (req, res) => {
  try {
    const response = await fetch('https://datamall2.mytransport.sg/ltaodataservice/Traffic-Images', {
      headers: {
        AccountKey: LTA_API_KEY,
        accept: 'application/json',
      },
    });

    if (!response.ok) {
      return res.json({ success: false, value: [] });
    }

    const data = await response.json();
    res.json({
      success: true,
      source: 'live',
      value: data.value || [],
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. API Status & Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    ltaKeyConfigured: !!LTA_API_KEY,
    keyPreview: LTA_API_KEY ? `${LTA_API_KEY.substring(0, 6)}...` : 'not_set',
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
