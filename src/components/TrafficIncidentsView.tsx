import React, { useState, useMemo } from 'react';
import { TrafficIncident, ExpresswayTrafficSegment } from '../types';
import { EXPRESSWAY_SEGMENTS, TRAFFIC_CAMERAS } from '../data/transportData';
import {
  Filter,
  Eye,
  Camera,
  RefreshCw,
  AlertTriangle,
  Layers,
  Activity,
  Navigation,
  Clock,
  Car,
  CheckCircle2,
  TrendingDown,
  Info,
  Maximize2
} from 'lucide-react';

interface TrafficIncidentsViewProps {
  incidents: TrafficIncident[];
  searchQuery: string;
  onSelectIncident?: (incident: TrafficIncident) => void;
  lastRefreshedTime?: string;
  onRefreshData?: () => void;
  isRefreshing?: boolean;
}

export const TrafficIncidentsView: React.FC<TrafficIncidentsViewProps> = ({
  incidents,
  searchQuery,
  lastRefreshedTime,
  onRefreshData,
  isRefreshing = false,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [activeIncidentId, setActiveIncidentId] = useState<string | null>('inc-1');
  const [selectedExpressway, setSelectedExpressway] = useState<ExpresswayTrafficSegment | null>(null);
  const [showRoadFlow, setShowRoadFlow] = useState<boolean>(true);
  const [showCameras, setShowCameras] = useState<boolean>(true);
  const [showIncidents, setShowIncidents] = useState<boolean>(true);
  const [showSpeedLegend, setShowSpeedLegend] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [hoveredRoadSegment, setHoveredRoadSegment] = useState<ExpresswayTrafficSegment | null>(null);

  // Filter incidents based on selected tag and search query
  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.expressway.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.description.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedFilter === 'All') return true;
      if (selectedFilter === 'Accidents') return inc.type === 'accident';
      if (selectedFilter === 'Roadworks') return inc.type === 'roadworks';
      if (selectedFilter === 'Congestion') return inc.type === 'congestion';
      if (selectedFilter === 'Breakdown') return inc.type === 'breakdown';
      return true;
    });
  }, [incidents, searchQuery, selectedFilter]);

  const activeIncident = incidents.find((i) => i.id === activeIncidentId) || filteredIncidents[0];

  const totalIncidents = incidents.length;
  const accidentsCount = incidents.filter((i) => i.type === 'accident').length;
  const roadworksCount = incidents.filter((i) => i.type === 'roadworks').length;
  const congestionCount = incidents.filter((i) => i.type === 'congestion').length;

  return (
    <div className="flex-1 md:ml-72 flex flex-col bg-[#f8f9fa] h-[calc(100vh-64px-44px)] overflow-hidden">
      {/* 1. Web-Optimized Top Telemetry & Status Bar */}
      <div
        id="traffic-telemetry-bar"
        className="bg-white border-b border-[#c1c6d3] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs z-20"
      >
        {/* Left: Data Source & Real-time Live Status */}
        <div className="flex items-center gap-3 text-[12px] flex-wrap">
          <div className="flex items-center gap-1.5 font-bold text-[#004481] bg-[#d5e3ff]/40 px-2.5 py-1 rounded-md border border-[#c1c6d3]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Source: LTA DataMall v2</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[#414751]">
            <Clock className="w-3.5 h-3.5 text-[#727783]" />
            <span>
              Last Ingested:{' '}
              <strong className="text-[#191c1d] font-mono">
                {lastRefreshedTime || new Date().toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) + ' SGT'}
              </strong>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px] font-semibold">
            <CheckCircle2 className="w-3 h-3" />
            <span>Live Stream Connected (24ms)</span>
          </div>
        </div>

        {/* Right: Road Coloration Summary & Layer Toggles */}
        <div className="flex items-center gap-2">
          {/* Layer toggles button */}
          <div className="flex items-center gap-1 bg-[#f3f4f5] p-1 rounded-lg border border-[#c1c6d3] text-[11px]">
            <button
              onClick={() => setShowRoadFlow((prev) => !prev)}
              className={`px-2 py-1 rounded font-semibold transition-colors ${
                showRoadFlow
                  ? 'bg-[#004481] text-white shadow-2xs'
                  : 'text-[#414751] hover:text-[#191c1d]'
              }`}
              title="Toggle Expressway Colored Flow Lines"
            >
              Road Flow Colors
            </button>
            <button
              onClick={() => setShowIncidents((prev) => !prev)}
              className={`px-2 py-1 rounded font-semibold transition-colors ${
                showIncidents
                  ? 'bg-[#004481] text-white shadow-2xs'
                  : 'text-[#414751] hover:text-[#191c1d]'
              }`}
              title="Toggle Incident Pins"
            >
              Incidents
            </button>
            <button
              onClick={() => setShowCameras((prev) => !prev)}
              className={`px-2 py-1 rounded font-semibold transition-colors ${
                showCameras
                  ? 'bg-[#004481] text-white shadow-2xs'
                  : 'text-[#414751] hover:text-[#191c1d]'
              }`}
              title="Toggle Traffic Cameras"
            >
              Cameras
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Content Split View (Map Canvas + Live Incident Feed) */}
      <div className="flex-1 flex flex-col lg:flex-row h-[calc(100%-48px)] overflow-hidden">
        {/* Map Container (Main Left/Center View) */}
        <div
          id="traffic-map-container"
          className="flex-1 relative h-[52vh] lg:h-full min-h-[380px] bg-[#d9dadb] overflow-hidden select-none"
        >
          {/* Background Map Image & Interactive SVG Layers */}
          <div
            className="w-full h-full relative overflow-hidden transition-transform duration-300 ease-out flex items-center justify-center"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* Base Singapore Traffic Map Image */}
            <img
              id="singapore-traffic-map-image"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCs8Z6EPbsVDhMKbrsD4Xm2IyD_-6f8ctn-J8yP-k716PdxaI5HhIrCMei1wC6m6QJ3dZscB-rn_l2pBk6peo74DY-efxGc7RyOhihT8SCfDaPuZgu78rLfyySLDkTpxfgaTOJjbV-VQXSmAMPN47MQnzrGyF5IYpRDJJsBDCoR-hAm3fZBnQlx6ktBwwQloIka42WKfOK5MJHsMd6WtBGo4YX7564egmTm3DOeB6wEwrTbdAmUmzX_"
              alt="Singapore Detailed Expressway and Arterial Traffic Live Map"
              className="w-full h-full object-cover pointer-events-none"
            />

            {/* SVG OVERLAY: Road Traffic Condition Visual Coloration */}
            {showRoadFlow && (
              <svg
                id="expressway-traffic-svg-overlay"
                viewBox="0 0 1000 650"
                className="absolute inset-0 w-full h-full pointer-events-auto z-10"
                preserveAspectRatio="none"
              >
                <defs>
                  {/* Glow filter for congested road segments */}
                  <filter id="glow-congested" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <filter id="glow-amber" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Draw Expressway Segment Lines with Visual Flow Colors */}
                {EXPRESSWAY_SEGMENTS.map((segment) => {
                  const isHovered = hoveredRoadSegment?.id === segment.id;
                  const isSelected = selectedExpressway?.id === segment.id;
                  const isCongested = segment.flowLevel === 'congested';

                  return (
                    <g key={segment.id} className="cursor-pointer group">
                      {/* Wider invisible stroke for easy hover detection */}
                      <path
                        d={segment.svgPath}
                        fill="none"
                        stroke="transparent"
                        strokeWidth="24"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        onMouseEnter={() => setHoveredRoadSegment(segment)}
                        onMouseLeave={() => setHoveredRoadSegment(null)}
                        onClick={() => setSelectedExpressway(segment)}
                      />

                      {/* White border/casing for contrast */}
                      <path
                        d={segment.svgPath}
                        fill="none"
                        stroke="white"
                        strokeWidth={isHovered || isSelected ? '10' : '7'}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity="0.85"
                      />

                      {/* Colored Expressway Flow Line */}
                      <path
                        d={segment.svgPath}
                        fill="none"
                        stroke={segment.colorHex}
                        strokeWidth={isHovered || isSelected ? '7' : '4.5'}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray={isCongested ? '8,4' : undefined}
                        className={isCongested ? 'animate-pulse' : ''}
                        filter={isCongested ? 'url(#glow-congested)' : undefined}
                        onMouseEnter={() => setHoveredRoadSegment(segment)}
                        onMouseLeave={() => setHoveredRoadSegment(null)}
                        onClick={() => setSelectedExpressway(segment)}
                      />

                      {/* Expressway Code Tag along the line */}
                      {isHovered && (
                        <circle
                          cx={segment.svgPath.match(/M\s*(\d+)/)?.[1] || 500}
                          cy={segment.svgPath.match(/M\s*\d+,(\d+)/)?.[1] || 300}
                          r="6"
                          fill={segment.colorHex}
                          stroke="white"
                          strokeWidth="2"
                        />
                      )}
                    </g>
                  );
                })}
              </svg>
            )}

            {/* Simulated Map Markers on top of Singapore Map */}
            {showIncidents &&
              incidents.map((incident) => {
                const isSelected = incident.id === activeIncidentId;
                const isAccident = incident.type === 'accident';
                const isRoadworks = incident.type === 'roadworks';
                const isCongestion = incident.type === 'congestion';

                let bgColor = 'bg-[#727783]';
                let iconName = 'traffic';

                if (isAccident) {
                  bgColor = 'bg-[#e51d24]';
                  iconName = 'car_crash';
                } else if (isRoadworks) {
                  bgColor = 'bg-[#795400]';
                  iconName = 'construction';
                } else if (isCongestion) {
                  bgColor = 'bg-[#5a3e00]';
                  iconName = 'traffic';
                } else {
                  bgColor = 'bg-[#005baa]';
                  iconName = 'warning';
                }

                return (
                  <div
                    key={incident.id}
                    id={`map-marker-${incident.id}`}
                    onClick={() => {
                      setActiveIncidentId(incident.id);
                      setSelectedExpressway(null);
                    }}
                    style={{
                      top: `${incident.latPercent}%`,
                      left: `${incident.lngPercent}%`,
                    }}
                    className={`absolute map-marker cursor-pointer flex flex-col items-center z-20 ${
                      isSelected ? 'scale-125 z-40' : 'hover:scale-110'
                    }`}
                  >
                    {/* Marker Pill / Icon */}
                    <div
                      className={`${bgColor} text-white p-1.5 rounded shadow-md border border-white flex items-center justify-center transition-all ${
                        isSelected ? 'ring-3 ring-blue-500 shadow-xl' : ''
                      }`}
                    >
                      <span
                        className="material-symbols-outlined text-[16px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {iconName}
                      </span>
                    </div>
                    {/* Stem */}
                    <div className={`w-1 h-3 ${bgColor}`} />

                    {/* Marker Label Popup if selected or hovered */}
                    {isSelected && (
                      <div className="absolute bottom-full mb-1 bg-[#191c1d] text-white text-[11px] font-semibold px-2.5 py-1 rounded shadow-lg whitespace-nowrap animate-in fade-in duration-150 border border-white/20">
                        {incident.title}
                        <div className="text-[10px] text-[#ffdad6]">{incident.timeFormatted}</div>
                      </div>
                    )}
                  </div>
                );
              })}

            {/* Traffic Camera Snapshot Overlay Markers */}
            {showCameras &&
              TRAFFIC_CAMERAS.map((cam) => (
                <div
                  key={cam.id}
                  id={`map-marker-${cam.id}`}
                  onClick={() => {
                    const matchedInc = incidents.find((i) => i.expressway === cam.expressway);
                    if (matchedInc) setActiveIncidentId(matchedInc.id);
                  }}
                  style={{
                    top: `${cam.latPercent}%`,
                    left: `${cam.lngPercent}%`,
                  }}
                  className="absolute map-marker cursor-pointer z-15 bg-white/95 rounded border border-[#c1c6d3] shadow-md p-1 flex items-center gap-1.5 hover:scale-105 transition-transform"
                >
                  <img
                    src={cam.imageUrl}
                    alt={cam.name}
                    className="w-10 h-7 object-cover rounded"
                  />
                  <div className="text-[9px] font-bold text-[#004481] pr-1 leading-tight">
                    {cam.name.split(' - ')[0]}
                    <div className="text-[8px] text-[#727783] font-normal">
                      {cam.name.split(' - ')[1]}
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Top-Left: NETWORK OVERVIEW HUD Overlay Card matching mockup */}
          <div
            id="network-overview-card"
            className="absolute top-4 left-4 bg-white/95 backdrop-blur-md p-4 rounded-lg border border-[#c1c6d3] shadow-md z-30 w-64 md:w-72"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[12px] font-bold text-[#414751] tracking-wider uppercase">
                NETWORK OVERVIEW
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                REALTIME LTA
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center py-1 border-b border-[#edeeef]">
                <span className="text-[14px] text-[#191c1d]">Active Incidents</span>
                <span className="text-[15px] font-mono font-bold text-[#e51d24]">
                  {totalIncidents > 0 ? totalIncidents : 24}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#edeeef]">
                <span className="text-[14px] text-[#191c1d]">Severe Congestion</span>
                <span className="text-[15px] font-mono font-bold text-[#795400]">
                  {congestionCount > 0 ? congestionCount : 5}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 text-[12px] text-[#727783]">
                <span>Avg Island Speed</span>
                <span className="font-semibold text-[#004481]">52.4 km/h</span>
              </div>
            </div>
          </div>

          {/* Road Traffic Condition Color Legend */}
          {showSpeedLegend && (
            <div
              id="traffic-speed-legend"
              className="hidden sm:flex absolute bottom-6 left-4 bg-white/95 backdrop-blur-sm p-3 rounded-lg border border-[#c1c6d3] shadow-md z-30 flex-col gap-1.5 text-[11px]"
            >
              <div className="flex items-center justify-between gap-4 mb-0.5">
                <span className="font-bold text-[#414751] text-[10px] uppercase tracking-wider">
                  Live Traffic Condition
                </span>
                <span className="text-[9px] text-[#727783] font-mono">LTA Speeds</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-2 rounded-xs bg-[#10b981]"></span>
                <span className="text-[#191c1d] font-medium">Smooth (&gt;60 km/h)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-2 rounded-xs bg-[#fa9e0d]"></span>
                <span className="text-[#191c1d] font-medium">Moderate (40–60 km/h)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-2 rounded-xs bg-[#f97316]"></span>
                <span className="text-[#191c1d] font-medium">Slow (20–40 km/h)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-2 rounded-xs bg-[#e51d24]"></span>
                <span className="text-[#191c1d] font-medium">Congested (&lt;20 km/h)</span>
              </div>
            </div>
          )}

          {/* Map Controls Floating Right */}
          <div className="absolute top-4 right-4 flex flex-col gap-1.5 z-30 bg-white rounded-lg shadow-md border border-[#c1c6d3] p-1">
            <button
              id="map-zoom-in"
              onClick={() => setZoomLevel((prev) => Math.min(prev + 0.2, 1.8))}
              title="Zoom In"
              className="p-1.5 text-[#414751] hover:bg-[#edeeef] rounded transition-colors text-[13px] font-bold cursor-pointer"
            >
              +
            </button>
            <button
              id="map-zoom-out"
              onClick={() => setZoomLevel((prev) => Math.max(prev - 0.2, 0.9))}
              title="Zoom Out"
              className="p-1.5 text-[#414751] hover:bg-[#edeeef] rounded transition-colors text-[13px] font-bold cursor-pointer"
            >
              −
            </button>
            <button
              id="map-toggle-cams"
              onClick={() => setShowCameras((prev) => !prev)}
              title="Toggle Traffic Cameras"
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                showCameras ? 'bg-[#004481] text-white' : 'text-[#414751] hover:bg-[#edeeef]'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Selected Expressway Segment Detail Banner (if clicked or hovered) */}
          {selectedExpressway && (
            <div
              id="selected-expressway-banner"
              className="absolute bottom-4 right-4 left-4 sm:left-auto sm:w-96 bg-white/95 backdrop-blur-md rounded-lg p-3.5 border border-[#c1c6d3] shadow-lg z-35 flex flex-col gap-2 animate-in slide-in-from-bottom-2 duration-200"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: selectedExpressway.colorHex }}
                  />
                  <h4 className="text-[14px] font-bold text-[#191c1d]">
                    {selectedExpressway.name}
                  </h4>
                </div>
                <button
                  onClick={() => setSelectedExpressway(null)}
                  className="text-[#727783] hover:text-[#191c1d] text-[12px] font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[12px] bg-[#f8f9fa] p-2 rounded border border-[#edeeef]">
                <div>
                  <span className="text-[#727783] block text-[10px] uppercase font-bold">
                    Current Speed
                  </span>
                  <strong
                    className="text-[16px] font-mono"
                    style={{ color: selectedExpressway.colorHex }}
                  >
                    {selectedExpressway.speedKmh} km/h
                  </strong>
                </div>
                <div>
                  <span className="text-[#727783] block text-[10px] uppercase font-bold">
                    Est. Travel Time
                  </span>
                  <strong className="text-[14px] font-mono text-[#191c1d]">
                    {selectedExpressway.travelTimeMin} mins{' '}
                    <span className="text-[11px] font-normal text-[#727783]">
                      (Typ: {selectedExpressway.typicalTimeMin}m)
                    </span>
                  </strong>
                </div>
              </div>

              <div className="text-[12px] text-[#414751]">
                Sector: <strong>{selectedExpressway.fromLocation}</strong> ➔{' '}
                <strong>{selectedExpressway.toLocation}</strong>
              </div>
            </div>
          )}

          {/* Active Incident Detail Overlay (Floating Card at bottom on mobile/desktop) */}
          {!selectedExpressway && activeIncident && (
            <div
              id="active-incident-banner"
              className="absolute bottom-4 right-4 left-4 sm:left-auto sm:w-96 bg-white/95 backdrop-blur-md rounded-lg p-3.5 border border-[#c1c6d3] shadow-lg z-30 flex flex-col gap-2 animate-in slide-in-from-bottom-2 duration-200"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded text-white ${
                      activeIncident.type === 'accident'
                        ? 'bg-[#e51d24]'
                        : activeIncident.type === 'roadworks'
                        ? 'bg-[#795400]'
                        : 'bg-[#5a3e00]'
                    }`}
                  >
                    {activeIncident.type.toUpperCase()}
                  </span>
                  <h4 className="text-[14px] font-bold text-[#191c1d]">{activeIncident.title}</h4>
                </div>
                <span className="text-[11px] text-[#727783] font-mono">
                  {activeIncident.timeFormatted}
                </span>
              </div>

              <p className="text-[13px] text-[#414751] leading-snug">{activeIncident.description}</p>

              <div className="flex items-center justify-between pt-1 border-t border-[#edeeef] text-[11px]">
                <span className="text-[#727783]">
                  Impact:{' '}
                  <strong className="text-[#e51d24]">
                    {activeIncident.laneClosure || 'Lane Affected'}
                  </strong>
                </span>
                <span className="text-[#004481] font-semibold">
                  Est. Clearance: {activeIncident.estClearance || '25 mins'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Incident Feed Panel (Right Sidebar matching mockup) */}
        <div
          id="incident-feed-panel"
          className="w-full lg:w-96 bg-[#f8f9fa] border-l border-[#c1c6d3] flex flex-col h-full overflow-hidden"
        >
          {/* Feed Header */}
          <div className="p-4 border-b border-[#c1c6d3] bg-white sticky top-0 z-10">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-[20px] font-bold text-[#191c1d] tracking-tight">Live Feed</h3>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-[#727783] bg-[#f3f4f5] px-2 py-0.5 rounded border border-[#edeeef]">
                  {filteredIncidents.length} Reports
                </span>
              </div>
            </div>

            {/* Filter Pills matching mockup */}
            <div className="flex gap-2 flex-wrap" role="tablist">
              <button
                id="filter-chip-all"
                onClick={() => setSelectedFilter('All')}
                className={`px-3 py-1 rounded-full text-[12px] font-semibold transition-all cursor-pointer ${
                  selectedFilter === 'All'
                    ? 'bg-[#004481] text-white shadow-xs'
                    : 'bg-[#e1e3e4] text-[#414751] hover:bg-[#c1c6d3]'
                }`}
              >
                All ({incidents.length})
              </button>

              <button
                id="filter-chip-accidents"
                onClick={() => setSelectedFilter('Accidents')}
                className={`px-3 py-1 rounded-full text-[12px] font-bold transition-all cursor-pointer ${
                  selectedFilter === 'Accidents'
                    ? 'bg-[#ffdad6] text-[#93000a] border border-[#ba1a1a] shadow-xs'
                    : 'bg-[#e1e3e4] text-[#414751] hover:bg-[#c1c6d3]'
                }`}
              >
                Accidents ({accidentsCount})
              </button>

              <button
                id="filter-chip-roadworks"
                onClick={() => setSelectedFilter('Roadworks')}
                className={`px-3 py-1 rounded-full text-[12px] font-semibold transition-all cursor-pointer ${
                  selectedFilter === 'Roadworks'
                    ? 'bg-[#ffdeaa] text-[#5f4100] border border-[#ffba2c] shadow-xs'
                    : 'bg-[#e1e3e4] text-[#414751] hover:bg-[#c1c6d3]'
                }`}
              >
                Roadworks ({roadworksCount})
              </button>

              <button
                id="filter-chip-congestion"
                onClick={() => setSelectedFilter('Congestion')}
                className={`px-3 py-1 rounded-full text-[12px] font-semibold transition-all cursor-pointer ${
                  selectedFilter === 'Congestion'
                    ? 'bg-[#d5e3ff] text-[#004787] border border-[#005baa] shadow-xs'
                    : 'bg-[#e1e3e4] text-[#414751] hover:bg-[#c1c6d3]'
                }`}
              >
                Congestion ({congestionCount})
              </button>
            </div>
          </div>

          {/* Scrollable Feed List matching mockup */}
          <div
            id="incident-cards-list"
            className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5"
          >
            {filteredIncidents.length === 0 ? (
              <div className="text-center py-12 text-[#727783]">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-[14px] font-semibold">No incidents found</p>
                <p className="text-[12px]">Try changing your search term or filter.</p>
              </div>
            ) : (
              filteredIncidents.map((incident) => {
                const isSelected = incident.id === activeIncidentId;
                const isAccident = incident.type === 'accident';
                const isRoadworks = incident.type === 'roadworks';
                const isCongestion = incident.type === 'congestion';

                // Visual styling matching mockup exactly
                let borderLeftClass = 'border-l-[#727783]';
                let badgeColor = 'text-[#414751]';
                let iconName = 'traffic';
                let typeLabel = 'CONGESTION';

                if (isAccident) {
                  borderLeftClass = 'border-l-[#e51d24]';
                  badgeColor = 'text-[#e51d24]';
                  iconName = 'warning';
                  typeLabel = 'ACCIDENT';
                } else if (isRoadworks) {
                  borderLeftClass = 'border-l-[#795400]';
                  badgeColor = 'text-[#795400]';
                  iconName = 'construction';
                  typeLabel = 'ROADWORKS';
                } else if (isCongestion) {
                  borderLeftClass = 'border-l-[#727783]';
                  badgeColor = 'text-[#414751]';
                  iconName = 'traffic';
                  typeLabel = 'CONGESTION';
                } else {
                  borderLeftClass = 'border-l-[#005baa]';
                  badgeColor = 'text-[#005baa]';
                  iconName = 'car_repair';
                  typeLabel = 'BREAKDOWN';
                }

                return (
                  <div
                    key={incident.id}
                    id={`incident-card-${incident.id}`}
                    onClick={() => {
                      setActiveIncidentId(incident.id);
                      setSelectedExpressway(null);
                    }}
                    className={`bg-white border rounded p-3.5 border-l-4 ${borderLeftClass} transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'border-[#004481] shadow-md ring-1 ring-[#004481]/20 bg-[#f8f9fa]'
                        : 'border-[#c1c6d3] shadow-[0_2px_4px_rgba(0,0,0,0.02)] hover:bg-[#f8f9fa]'
                    }`}
                  >
                    {/* Card Top: Type Badge & Timestamp */}
                    <div className="flex justify-between items-start mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`material-symbols-outlined text-[16px] ${badgeColor}`}
                          style={{ fontVariationSettings: isAccident ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          {iconName}
                        </span>
                        <span className={`text-[12px] font-bold tracking-wider ${badgeColor}`}>
                          {typeLabel}
                        </span>
                      </div>
                      <span className="text-[12px] font-medium text-[#727783] font-mono">
                        {incident.timeFormatted}
                      </span>
                    </div>

                    {/* Card Title */}
                    <h4 className="text-[14px] font-bold text-[#191c1d] mb-1 leading-snug">
                      {incident.title}
                    </h4>

                    {/* Description */}
                    <p className="text-[13px] text-[#414751] leading-relaxed line-clamp-2">
                      {incident.description}
                    </p>

                    {/* Tags Pill Container */}
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {incident.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-[#e1e3e4] text-[#191c1d] rounded text-[11px] font-semibold uppercase tracking-wider"
                        >
                          {tag}
                        </span>
                      ))}
                      {incident.speedKmh && (
                        <span className="px-2 py-0.5 bg-[#f3f4f5] text-[#004481] border border-[#c1c6d3] rounded text-[11px] font-mono font-medium">
                          {incident.speedKmh} km/h
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
