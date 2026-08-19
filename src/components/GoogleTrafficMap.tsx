import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TrafficIncident, ExpresswayTrafficSegment, TrafficCamera } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import {
  Layers,
  MapPin,
  Camera,
  AlertTriangle,
  Navigation,
  Compass,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Car
} from 'lucide-react';

interface GoogleTrafficMapProps {
  expresswaySegments: ExpresswayTrafficSegment[];
  incidents: TrafficIncident[];
  cameras: TrafficCamera[];
  showRoadFlow: boolean;
  showIncidents: boolean;
  showCameras: boolean;
  activeIncidentId: string | null;
  selectedExpresswayId: string | null;
  onSelectIncident: (id: string) => void;
  onSelectExpressway: (segment: ExpresswayTrafficSegment) => void;
  onSelectCamera: (cam: TrafficCamera) => void;
}

type MapLayerType = 'roadmap' | 'satellite' | 'terrain';

// Safe helper to resolve GPS coordinates from various schemas or fallbacks
function resolveCoordinates(
  latVal?: number,
  lngVal?: number,
  latPct?: number,
  lngPct?: number,
  fallbackLat = 1.3521,
  fallbackLng = 103.8198
): [number, number] | null {
  let lat = typeof latVal === 'number' && !isNaN(latVal) && latVal > 1.1 && latVal < 1.6 ? latVal : undefined;
  let lng = typeof lngVal === 'number' && !isNaN(lngVal) && lngVal > 103.5 && lngVal < 104.2 ? lngVal : undefined;

  if (lat === undefined || lng === undefined) {
    if (typeof latPct === 'number' && typeof lngPct === 'number' && !isNaN(latPct) && !isNaN(lngPct)) {
      lat = 1.47 - (latPct / 100) * (1.47 - 1.22);
      lng = 103.60 + (lngPct / 100) * (104.04 - 103.60);
    } else {
      lat = fallbackLat;
      lng = fallbackLng;
    }
  }

  if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
    return [lat, lng];
  }
  return null;
}

export const GoogleTrafficMap: React.FC<GoogleTrafficMapProps> = ({
  expresswaySegments,
  incidents,
  cameras,
  showRoadFlow,
  showIncidents,
  showCameras,
  activeIncidentId,
  selectedExpresswayId,
  onSelectIncident,
  onSelectExpressway,
  onSelectCamera,
}) => {
  const { t } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const polylinesLayerRef = useRef<L.LayerGroup | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const camerasLayerRef = useRef<L.LayerGroup | null>(null);

  const [mapType, setMapType] = useState<MapLayerType>('roadmap');
  const [currentZoom, setCurrentZoom] = useState<number>(12);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Singapore Coordinates: 1.3521° N, 103.8198° E
    const map = L.map(mapContainerRef.current, {
      center: [1.3521, 103.8198],
      zoom: 12,
      minZoom: 10,
      maxZoom: 18,
      zoomControl: false, // We render custom authentic Google Maps UI zoom controls
      attributionControl: false,
    });

    // Default Google Maps style tile layer (using high-res CartoDB / OSM / Google tiles)
    const initialTile = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        subdomains: 'abcd',
        maxZoom: 19,
      }
    );
    initialTile.addTo(map);
    tileLayerRef.current = initialTile;

    // Create Layer Groups
    polylinesLayerRef.current = L.layerGroup().addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);
    camerasLayerRef.current = L.layerGroup().addTo(map);

    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Tile Layer Switching (Roadmap vs Satellite vs Terrain)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let url = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    let subdomains = 'abcd';

    if (mapType === 'satellite') {
      // High-resolution Esri World Imagery + Hybrid road overlay
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      subdomains = 'abc';
    } else if (mapType === 'terrain') {
      url = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      subdomains = 'abc';
    }

    const newTile = L.tileLayer(url, { subdomains, maxZoom: 19 });
    newTile.addTo(map);
    tileLayerRef.current = newTile;
  }, [mapType]);

  // Render Expressway Polylines (Traffic Speed Bands like Google Traffic Layer)
  useEffect(() => {
    if (!polylinesLayerRef.current) return;
    polylinesLayerRef.current.clearLayers();

    if (!showRoadFlow) return;

    expresswaySegments.forEach((segment) => {
      if (!segment.coordinates || segment.coordinates.length < 2) return;

      const validCoordinates = segment.coordinates.filter(
        (pt) => Array.isArray(pt) && pt.length === 2 && !isNaN(pt[0]) && !isNaN(pt[1])
      );
      if (validCoordinates.length < 2) return;

      const isSelected = selectedExpresswayId === segment.id;

      // Outer outline line for Google Maps road casing
      const casing = L.polyline(validCoordinates, {
        color: '#ffffff',
        weight: isSelected ? 10 : 8,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      });

      // Inner colored speed band
      const speedPolyline = L.polyline(validCoordinates, {
        color: segment.colorHex,
        weight: isSelected ? 6 : 5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      });

      // Tooltip & Click Event
      speedPolyline.bindTooltip(
        `<div style="font-family: Roboto, sans-serif; font-size: 12px; font-weight: bold; padding: 2px 4px;">
          <span style="color: #004481;">${segment.code}</span>: ${segment.speedKmh} km/h (${segment.flowLevel})
          <br/><span style="color: #666; font-size: 10px;">${segment.fromLocation} ➔ ${segment.toLocation}</span>
        </div>`,
        { sticky: true, className: 'google-maps-tooltip' }
      );

      speedPolyline.on('click', () => {
        onSelectExpressway(segment);
      });

      casing.on('click', () => {
        onSelectExpressway(segment);
      });

      polylinesLayerRef.current?.addLayer(casing);
      polylinesLayerRef.current?.addLayer(speedPolyline);
    });
  }, [expresswaySegments, showRoadFlow, selectedExpresswayId, onSelectExpressway]);

  // Render Incident Marker Pins (Google Maps pin style)
  useEffect(() => {
    if (!markersLayerRef.current) return;
    markersLayerRef.current.clearLayers();

    if (!showIncidents) return;

    incidents.forEach((incident) => {
      const coords = resolveCoordinates(
        incident.lat,
        incident.lng,
        incident.latPercent,
        incident.lngPercent
      );
      if (!coords) return;

      const isSelected = incident.id === activeIncidentId;
      const isAccident = incident.type === 'accident';
      const isRoadworks = incident.type === 'roadworks';

      let pinColor = '#d93025'; // Red for accident
      let iconSymbol = '⚠️';
      if (isAccident) {
        pinColor = '#d93025';
        iconSymbol = '💥';
      } else if (isRoadworks) {
        pinColor = '#f29900';
        iconSymbol = '🚧';
      } else {
        pinColor = '#1a73e8';
        iconSymbol = '🚗';
      }

      // Authentic Google Maps SVG Pin Marker
      const customIcon = L.divIcon({
        className: 'custom-google-marker',
        html: `
          <div style="
            position: relative;
            transform: translate(-50%, -100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
            filter: drop-shadow(0 3px 6px rgba(0,0,0,0.35));
            transition: transform 0.2s;
          ">
            <div style="
              width: ${isSelected ? '36px' : '30px'};
              height: ${isSelected ? '36px' : '30px'};
              background: ${pinColor};
              border: 2px solid #ffffff;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              display: flex;
              align-items: center;
              justify-content: center;
              ${isAccident ? 'box-shadow: 0 0 12px rgba(217,48,37,0.7);' : ''}
            ">
              <span style="
                transform: rotate(45deg);
                font-size: ${isSelected ? '16px' : '13px'};
                line-height: 1;
              ">${iconSymbol}</span>
            </div>
            ${
              isSelected
                ? `<div style="
                    position: absolute;
                    bottom: -4px;
                    width: 8px;
                    height: 8px;
                    background: #191c1d;
                    border-radius: 50%;
                    opacity: 0.6;
                  "></div>`
                : ''
            }
          </div>
        `,
        iconSize: [30, 40],
        iconAnchor: [15, 40],
        popupAnchor: [0, -38],
      });

      const marker = L.marker(coords, { icon: customIcon });

      // Google Maps styled InfoWindow Popup
      const popupContent = `
        <div style="font-family: Roboto, Arial, sans-serif; min-width: 220px; max-width: 280px; padding: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="background: ${pinColor}; color: #fff; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
              ${incident.type}
            </span>
            <span style="font-size: 11px; color: #666; font-family: monospace;">
              ${incident.timeFormatted}
            </span>
          </div>
          <h4 style="font-size: 13px; font-weight: bold; color: #202124; margin: 4px 0;">
            ${incident.title}
          </h4>
          <p style="font-size: 12px; color: #5f6368; line-height: 1.4; margin: 0 0 6px 0;">
            ${incident.description}
          </p>
          <div style="background: #f8f9fa; border: 1px solid #dadce0; border-radius: 6px; padding: 4px 8px; font-size: 11px; color: #3c4043;">
            <strong>Lane Impact:</strong> ${incident.laneClosure || 'Lane 1 Closed'}<br/>
            <strong>Est. Clearance:</strong> ${incident.estClearance || '25 mins'}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { className: 'google-maps-popup' });

      marker.on('click', () => {
        onSelectIncident(incident.id);
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [incidents, showIncidents, activeIncidentId, onSelectIncident]);

  // Render Traffic Camera Markers (Google Maps camera style)
  useEffect(() => {
    if (!camerasLayerRef.current) return;
    camerasLayerRef.current.clearLayers();

    if (!showCameras) return;

    cameras.forEach((cam) => {
      const coords = resolveCoordinates(
        cam.lat || (cam as any).latitude,
        cam.lng || (cam as any).longitude,
        cam.latPercent,
        cam.lngPercent
      );
      if (!coords) return;

      const camIcon = L.divIcon({
        className: 'custom-camera-marker',
        html: `
          <div style="
            position: relative;
            transform: translate(-50%, -50%);
            width: 28px;
            height: 28px;
            background: #1a73e8;
            border: 2px solid #ffffff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-size: 13px;
            cursor: pointer;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            transition: transform 0.15s;
          " onmouseover="this.style.transform='translate(-50%, -50%) scale(1.2)'" onmouseout="this.style.transform='translate(-50%, -50%) scale(1)'">
            📹
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker(coords, { icon: camIcon });

      const camPopup = `
        <div style="font-family: Roboto, Arial, sans-serif; width: 200px; padding: 2px;">
          <div style="font-size: 12px; font-weight: bold; color: #1a73e8; margin-bottom: 4px;">
            ${cam.name}
          </div>
          <img src="${cam.imageUrl}" alt="${cam.name}" style="width: 100%; height: 110px; object-fit: cover; border-radius: 6px; margin-bottom: 6px;" />
          <button id="btn-open-cam-${cam.id}" style="width: 100%; background: #1a73e8; color: #fff; border: none; padding: 5px; border-radius: 4px; font-size: 11px; font-weight: bold; cursor: pointer;">
            Open Live Snapshot Feed
          </button>
        </div>
      `;

      marker.bindPopup(camPopup, { className: 'google-maps-popup' });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-open-cam-${cam.id}`);
        if (btn) {
          btn.onclick = () => onSelectCamera(cam);
        }
      });

      marker.on('click', () => {
        onSelectCamera(cam);
      });

      camerasLayerRef.current?.addLayer(marker);
    });
  }, [cameras, showCameras, onSelectCamera]);

  // Handle Zoom In / Out
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  // Center to Singapore mainland
  const handleCenterSingapore = () => {
    mapInstanceRef.current?.setView([1.3521, 103.8198], 12, { animate: true });
  };

  const toggleFullscreen = () => {
    if (!mapContainerRef.current) return;
    if (!document.fullscreenElement) {
      mapContainerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden select-none bg-[#e5e3df]">
      {/* Real Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* 1. TOP-LEFT: Google Maps Floating Layer Selector Widget */}
      <div className="absolute top-4 left-4 z-20 flex items-center bg-white rounded-lg shadow-md border border-gray-200/80 overflow-hidden font-sans">
        <button
          onClick={() => setMapType('roadmap')}
          className={`px-3 py-2 text-[13px] font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
            mapType === 'roadmap'
              ? 'bg-[#1a73e8] text-white font-semibold'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Map</span>
        </button>

        <button
          onClick={() => setMapType('satellite')}
          className={`px-3 py-2 text-[13px] font-medium transition-colors cursor-pointer border-l border-gray-200 ${
            mapType === 'satellite'
              ? 'bg-[#1a73e8] text-white font-semibold'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <span>Satellite</span>
        </button>

        <button
          onClick={() => setMapType('terrain')}
          className={`px-3 py-2 text-[13px] font-medium transition-colors cursor-pointer border-l border-gray-200 ${
            mapType === 'terrain'
              ? 'bg-[#1a73e8] text-white font-semibold'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <span>Terrain</span>
        </button>
      </div>

      {/* 2. BOTTOM-RIGHT: Google Maps Authentic Floating Controls */}
      <div className="absolute bottom-6 right-4 z-20 flex flex-col items-center gap-2">
        {/* Street View / Center Target Button */}
        <div className="flex flex-col bg-white rounded-md shadow-md border border-gray-200 overflow-hidden">
          <button
            onClick={handleCenterSingapore}
            className="p-2 text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer border-b border-gray-200"
            title="Recenter to Singapore"
          >
            <Compass className="w-5 h-5 text-[#1a73e8]" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5" />
            ) : (
              <Maximize2 className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Zoom In / Zoom Out Controls */}
        <div className="flex flex-col bg-white rounded-md shadow-md border border-gray-200 overflow-hidden">
          <button
            onClick={handleZoomIn}
            className="p-2.5 text-gray-700 hover:bg-gray-100 font-bold text-[18px] leading-none transition-colors cursor-pointer border-b border-gray-200 flex items-center justify-center w-10 h-10"
            title="Zoom in"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2.5 text-gray-700 hover:bg-gray-100 font-bold text-[18px] leading-none transition-colors cursor-pointer flex items-center justify-center w-10 h-10"
            title="Zoom out"
          >
            −
          </button>
        </div>
      </div>

      {/* 3. BOTTOM-LEFT: Authentic Google Maps Scale & Attribution Bar */}
      <div className="absolute bottom-2 left-2 z-20 flex items-center gap-3 bg-white/85 backdrop-blur-xs px-2.5 py-1 rounded text-[11px] text-gray-600 shadow-xs border border-gray-200/60 font-sans">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-[#1a73e8]">Google Maps Style</span>
          <span>•</span>
          <span>Scale: 2 km</span>
          <div className="w-12 h-1 bg-gray-600 border-x-2 border-gray-800 inline-block ml-1"></div>
        </div>
        <span className="hidden sm:inline">
          Map data ©2025 Google / LTA DataMall Singapore
        </span>
      </div>
    </div>
  );
};
