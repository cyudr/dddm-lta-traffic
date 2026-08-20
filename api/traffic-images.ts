import { fetchLTAEndpoint, convertLatLngToMapPercent } from './_lib/lta';

// Live Traffic Camera Images (LTA DataMall Traffic-Images API)
export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  try {
    const response = await fetchLTAEndpoint('Traffic-Imagesv2');

    let rawList: any[] = [];
    if (response.ok) {
      const data = await response.json();
      rawList = data.value || [];
    } else {
      const v1Res = await fetchLTAEndpoint('Traffic-Images');
      if (v1Res.ok) {
        const data1 = await v1Res.json();
        rawList = data1.value || [];
      }
    }

    const formattedCameras = rawList.map((cam: any, idx: number) => {
      const parsedLat = parseFloat(cam.Latitude);
      const parsedLng = parseFloat(cam.Longitude);
      const lat = !isNaN(parsedLat) && parsedLat > 1.1 && parsedLat < 1.5 ? parsedLat : 1.3521;
      const lng = !isNaN(parsedLng) && parsedLng > 103.5 && parsedLng < 104.1 ? parsedLng : 103.8198;
      const { latPercent, lngPercent } = convertLatLngToMapPercent(lat, lng);

      let expressway = 'PIE';
      const expKeys = ['PIE', 'AYE', 'CTE', 'KPE', 'SLE', 'BKE', 'ECP', 'TPE', 'MCE', 'KJE'];
      for (const k of expKeys) {
        if ((cam.CameraID || '').includes(k) || (cam.ImageLink || '').toUpperCase().includes(k)) {
          expressway = k;
          break;
        }
      }

      const rawImageLink = cam.ImageLink || '';
      const isOnline = !!rawImageLink && !rawImageLink.includes('offline');

      return {
        id: `cam-${cam.CameraID || idx}`,
        cameraId: cam.CameraID || `${idx + 1000}`,
        name: `Camera ${cam.CameraID || idx} - ${expressway}`,
        expressway,
        imageUrl: rawImageLink,
        proxyImageUrl: rawImageLink ? `/api/camera-image-proxy?url=${encodeURIComponent(rawImageLink)}` : '',
        lat,
        lng,
        latitude: lat,
        longitude: lng,
        latPercent,
        lngPercent,
        isOnline,
        status: isOnline ? 'online' : 'offline',
        timestamp: new Date().toISOString(),
      };
    });

    res.status(200).json({
      success: true,
      source: rawList.length > 0 ? 'live' : 'fallback',
      count: formattedCameras.length,
      value: formattedCameras,
    });
  } catch (error: any) {
    res.status(200).json({ success: false, error: error.message, value: [] });
  }
}
