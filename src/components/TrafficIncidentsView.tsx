import React, { useState, useMemo, useEffect } from 'react';
import { TrafficIncident, ExpresswayTrafficSegment } from '../types';
import { EXPRESSWAY_SEGMENTS, TRAFFIC_CAMERAS } from '../data/transportData';
import {
  Filter,
  Camera,
  AlertTriangle,
  Layers,
  Activity,
  Clock,
  Car,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Info,
  Navigation,
  Gauge,
  Video,
  X,
  Compass,
  AlertOctagon,
  ShieldAlert
} from 'lucide-react';

interface TrafficIncidentsViewProps {
  incidents: TrafficIncident[];
  searchQuery: string;
  onSelectIncident?: (incident: TrafficIncident) => void;
  lastRefreshedTime?: string;
  onRefreshData?: () => void;
  isRefreshing?: boolean;
}

type RightPanelTab = 'feed' | 'overview' | 'details' | 'cameras';

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
  const [showIncidents, setShowIncidents] = useState<boolean>(true);
  const [showCameras, setShowCameras] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [hoveredRoadSegment, setHoveredRoadSegment] = useState<ExpresswayTrafficSegment | null>(null);

  // Right sliding panel state & tabs
  const [activeTab, setActiveTab] = useState<RightPanelTab>('feed');
  const [isRightPanelOpen, setIsRightPanelOpen] = useState<boolean>(true);

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
  const breakdownCount = incidents.filter((i) => i.type === 'breakdown').length;

  // Whenever user clicks an incident or expressway segment, automatically switch to details tab in the right sliding bar
  const handleSelectIncident = (incidentId: string) => {
    setActiveIncidentId(incidentId);
    setSelectedExpressway(null);
    setActiveTab('details');
    if (!isRightPanelOpen) setIsRightPanelOpen(true);
  };

  const handleSelectExpressway = (segment: ExpresswayTrafficSegment) => {
    setSelectedExpressway(segment);
    setActiveTab('details');
    if (!isRightPanelOpen) setIsRightPanelOpen(true);
  };

  return (
    <div className="flex-1 md:ml-72 flex flex-col bg-[#f8f9fa] h-[calc(100vh-64px-44px)] overflow-hidden">
      {/* 1. Top Telemetry & Controls Bar */}
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
                {lastRefreshedTime ||
                  new Date().toLocaleTimeString('en-SG', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false,
                  }) + ' SGT'}
              </strong>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px] font-semibold">
            <CheckCircle2 className="w-3 h-3" />
            <span>Live Stream (24ms)</span>
          </div>
        </div>

        {/* Right: Map Layers & Sliding Panel Toggle */}
        <div className="flex items-center gap-2">
          {/* Map Layer Toggles */}
          <div className="flex items-center gap-1 bg-[#f3f4f5] p-1 rounded-lg border border-[#c1c6d3] text-[11px]">
            <button
              onClick={() => setShowRoadFlow((prev) => !prev)}
              className={`px-2 py-1 rounded font-semibold transition-colors cursor-pointer ${
                showRoadFlow
                  ? 'bg-[#004481] text-white shadow-2xs'
                  : 'text-[#414751] hover:text-[#191c1d]'
              }`}
              title="Toggle Colored Road Traffic Conditions"
            >
              Road Speeds
            </button>
            <button
              onClick={() => setShowIncidents((prev) => !prev)}
              className={`px-2 py-1 rounded font-semibold transition-colors cursor-pointer ${
                showIncidents
                  ? 'bg-[#004481] text-white shadow-2xs'
                  : 'text-[#414751] hover:text-[#191c1d]'
              }`}
              title="Toggle Road Hazard Pins"
            >
              Hazards
            </button>
            <button
              onClick={() => setShowCameras((prev) => !prev)}
              className={`px-2 py-1 rounded font-semibold transition-colors cursor-pointer ${
                showCameras
                  ? 'bg-[#004481] text-white shadow-2xs'
                  : 'text-[#414751] hover:text-[#191c1d]'
              }`}
              title="Toggle Traffic Cameras"
            >
              Cameras
            </button>
          </div>

          {/* Toggle Sliding Right Bar Button */}
          <button
            id="toggle-sliding-panel-btn"
            onClick={() => setIsRightPanelOpen((prev) => !prev)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#c1c6d3] bg-[#f8f9fa] hover:bg-[#edeeef] text-[#191c1d] text-[12px] font-semibold transition-colors cursor-pointer"
            title={isRightPanelOpen ? 'Collapse Side Panel' : 'Expand Side Panel'}
          >
            {isRightPanelOpen ? (
              <>
                <span className="hidden sm:inline">Hide Sidebar</span>
                <ChevronRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Show Sidebar</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Main Content Area (100% Clean Map Canvas + Sliding Side Bar) */}
      <div className="flex-1 flex flex-col lg:flex-row h-[calc(100%-48px)] overflow-hidden relative">
        {/* Completely Clean Map Canvas (NO floating cards or popups overlapping) */}
        <div
          id="traffic-map-container"
          className="flex-1 relative h-full bg-[#d9dadb] overflow-hidden select-none"
        >
          <div
            className="w-full h-full relative overflow-hidden transition-transform duration-300 ease-out flex items-center justify-center"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* Base Singapore Traffic Map Image */}
            <img
              id="singapore-traffic-map-image"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCs8Z6EPbsVDhMKbrsD4Xm2IyD_-6f8ctn-J8yP-k716PdxaI5HhIrCMei1wC6m6QJ3dZscB-rn_l2pBk6peo74DY-efxGc7RyOhihT8SCfDaPuZgu78rLfyySLDkTpxfgaTOJjbV-VQXSmAMPN47MQnzrGyF5IYpRDJJsBDCoR-hAm3fZBnQlx6ktBwwQloIka42WKfOK5MJHsMd6WtBGo4YX7564egmTm3DOeB6wEwrTbdAmUmzX_"
              alt="Singapore Expressway Live Map"
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
                  <filter id="glow-congested" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {EXPRESSWAY_SEGMENTS.map((segment) => {
                  const isHovered = hoveredRoadSegment?.id === segment.id;
                  const isSelected = selectedExpressway?.id === segment.id;
                  const isCongested = segment.flowLevel === 'congested';

                  return (
                    <g key={segment.id} className="cursor-pointer">
                      {/* Wide invisible click target */}
                      <path
                        d={segment.svgPath}
                        fill="none"
                        stroke="transparent"
                        strokeWidth="28"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        onMouseEnter={() => setHoveredRoadSegment(segment)}
                        onMouseLeave={() => setHoveredRoadSegment(null)}
                        onClick={() => handleSelectExpressway(segment)}
                      />

                      {/* White border background */}
                      <path
                        d={segment.svgPath}
                        fill="none"
                        stroke="white"
                        strokeWidth={isHovered || isSelected ? '10' : '7'}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity="0.9"
                      />

                      {/* Colored flow line */}
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
                        onClick={() => handleSelectExpressway(segment)}
                      />
                    </g>
                  );
                })}
              </svg>
            )}

            {/* Map Markers for Incidents */}
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
                    onClick={() => handleSelectIncident(incident.id)}
                    style={{
                      top: `${incident.latPercent}%`,
                      left: `${incident.lngPercent}%`,
                    }}
                    className={`absolute map-marker cursor-pointer flex flex-col items-center z-20 transition-transform ${
                      isSelected ? 'scale-125 z-40' : 'hover:scale-110'
                    }`}
                  >
                    <div
                      className={`${bgColor} text-white p-1.5 rounded shadow-md border border-white flex items-center justify-center ${
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
                    <div className={`w-1 h-3 ${bgColor}`} />
                  </div>
                );
              })}

            {/* Traffic Camera Pins on Map */}
            {showCameras &&
              TRAFFIC_CAMERAS.map((cam) => (
                <div
                  key={cam.id}
                  id={`map-marker-${cam.id}`}
                  onClick={() => {
                    const matchedInc = incidents.find((i) => i.expressway === cam.expressway);
                    if (matchedInc) handleSelectIncident(matchedInc.id);
                    else setActiveTab('cameras');
                  }}
                  style={{
                    top: `${cam.latPercent}%`,
                    left: `${cam.lngPercent}%`,
                  }}
                  className="absolute map-marker cursor-pointer z-15 bg-[#004481] text-white p-1.5 rounded-full shadow-md border border-white hover:scale-110 transition-transform"
                  title={cam.name}
                >
                  <Camera className="w-3.5 h-3.5" />
                </div>
              ))}
          </div>

          {/* Minimal Corner Map Zoom Controls */}
          <div className="absolute top-4 left-4 flex flex-col gap-1 z-30 bg-white/90 backdrop-blur-xs rounded-lg shadow-sm border border-[#c1c6d3] p-1">
            <button
              id="map-zoom-in"
              onClick={() => setZoomLevel((prev) => Math.min(prev + 0.2, 1.8))}
              title="Zoom In"
              className="p-1.5 text-[#414751] hover:bg-[#edeeef] rounded font-bold text-[13px] cursor-pointer"
            >
              +
            </button>
            <button
              id="map-zoom-out"
              onClick={() => setZoomLevel((prev) => Math.max(prev - 0.2, 0.9))}
              title="Zoom Out"
              className="p-1.5 text-[#414751] hover:bg-[#edeeef] rounded font-bold text-[13px] cursor-pointer"
            >
              −
            </button>
            <button
              id="map-zoom-reset"
              onClick={() => setZoomLevel(1)}
              title="Reset Zoom"
              className="p-1 text-[10px] text-[#727783] hover:bg-[#edeeef] rounded font-mono font-bold"
            >
              1x
            </button>
          </div>
        </div>

        {/* 3. SLIDING RIGHT SIDEBAR (Contains all Overviews, Details, Feed, and Cameras cleanly) */}
        <div
          id="sliding-right-sidebar"
          className={`bg-white border-l border-[#c1c6d3] flex flex-col h-full z-30 transition-all duration-300 ease-in-out shadow-lg ${
            isRightPanelOpen
              ? 'w-full lg:w-[420px] xl:w-[450px] opacity-100'
              : 'w-0 lg:w-0 opacity-0 pointer-events-none overflow-hidden'
          }`}
        >
          {/* Sidebar Tab Header */}
          <div className="p-3 border-b border-[#c1c6d3] bg-[#f8f9fa] flex items-center justify-between gap-1 shrink-0">
            <div className="flex items-center gap-1 overflow-x-auto w-full" role="tablist">
              <button
                onClick={() => setActiveTab('feed')}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'feed'
                    ? 'bg-[#004481] text-white shadow-xs'
                    : 'text-[#414751] hover:bg-[#edeeef]'
                }`}
              >
                <span>Live Feed</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    activeTab === 'feed'
                      ? 'bg-white/20 text-white'
                      : 'bg-[#e1e3e4] text-[#414751]'
                  }`}
                >
                  {filteredIncidents.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'bg-[#004481] text-white shadow-xs'
                    : 'text-[#414751] hover:bg-[#edeeef]'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Overview</span>
              </button>

              <button
                onClick={() => setActiveTab('details')}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'details'
                    ? 'bg-[#004481] text-white shadow-xs'
                    : 'text-[#414751] hover:bg-[#edeeef]'
                }`}
              >
                <Info className="w-3.5 h-3.5" />
                <span>Selected</span>
              </button>

              <button
                onClick={() => setActiveTab('cameras')}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'cameras'
                    ? 'bg-[#004481] text-white shadow-xs'
                    : 'text-[#414751] hover:bg-[#edeeef]'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Cameras</span>
              </button>
            </div>

            <button
              onClick={() => setIsRightPanelOpen(false)}
              className="p-1 text-[#727783] hover:text-[#191c1d] rounded-lg hover:bg-[#edeeef] transition-colors ml-1 shrink-0"
              title="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* TAB 1: LIVE FEED */}
          {activeTab === 'feed' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Filter Pills */}
              <div className="p-3 border-b border-[#edeeef] bg-white flex gap-1.5 flex-wrap">
                <button
                  id="filter-chip-all"
                  onClick={() => setSelectedFilter('All')}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                    selectedFilter === 'All'
                      ? 'bg-[#004481] text-white shadow-2xs'
                      : 'bg-[#f3f4f5] text-[#414751] hover:bg-[#e1e3e4]'
                  }`}
                >
                  All ({incidents.length})
                </button>

                <button
                  id="filter-chip-accidents"
                  onClick={() => setSelectedFilter('Accidents')}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                    selectedFilter === 'Accidents'
                      ? 'bg-[#ffdad6] text-[#93000a] border border-[#ba1a1a] shadow-2xs'
                      : 'bg-[#f3f4f5] text-[#414751] hover:bg-[#e1e3e4]'
                  }`}
                >
                  Accidents ({accidentsCount})
                </button>

                <button
                  id="filter-chip-roadworks"
                  onClick={() => setSelectedFilter('Roadworks')}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                    selectedFilter === 'Roadworks'
                      ? 'bg-[#ffdeaa] text-[#5f4100] border border-[#ffba2c] shadow-2xs'
                      : 'bg-[#f3f4f5] text-[#414751] hover:bg-[#e1e3e4]'
                  }`}
                >
                  Roadworks ({roadworksCount})
                </button>

                <button
                  id="filter-chip-congestion"
                  onClick={() => setSelectedFilter('Congestion')}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                    selectedFilter === 'Congestion'
                      ? 'bg-[#d5e3ff] text-[#004787] border border-[#005baa] shadow-2xs'
                      : 'bg-[#f3f4f5] text-[#414751] hover:bg-[#e1e3e4]'
                  }`}
                >
                  Congestion ({congestionCount})
                </button>
              </div>

              {/* Feed Card List */}
              <div
                id="incident-cards-list"
                className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-3"
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
                        onClick={() => handleSelectIncident(incident.id)}
                        className={`bg-white border rounded-lg p-3.5 border-l-4 ${borderLeftClass} transition-all cursor-pointer select-none ${
                          isSelected
                            ? 'border-[#004481] shadow-md ring-1 ring-[#004481]/20 bg-[#f8f9fa]'
                            : 'border-[#c1c6d3] shadow-xs hover:bg-[#f8f9fa]'
                        }`}
                      >
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

                        <h4 className="text-[14px] font-bold text-[#191c1d] mb-1 leading-snug">
                          {incident.title}
                        </h4>

                        <p className="text-[13px] text-[#414751] leading-relaxed line-clamp-2">
                          {incident.description}
                        </p>

                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex flex-wrap gap-1.5">
                            {incident.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-[#e1e3e4] text-[#191c1d] rounded text-[10px] font-semibold uppercase tracking-wider"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <span className="text-[11px] text-[#004481] font-semibold hover:underline">
                            View Details ➔
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: OVERVIEW & SPEED METRICS */}
          {activeTab === 'overview' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Network Overview Card */}
              <div className="bg-[#f8f9fa] rounded-xl border border-[#c1c6d3] p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[13px] font-bold text-[#004481] uppercase tracking-wider">
                    Network Overview
                  </h4>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    LIVE INGESTION
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-lg border border-[#edeeef] shadow-2xs">
                    <span className="text-[11px] text-[#727783] block uppercase font-semibold">
                      Active Incidents
                    </span>
                    <strong className="text-[20px] font-mono font-bold text-[#e51d24]">
                      {totalIncidents}
                    </strong>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-[#edeeef] shadow-2xs">
                    <span className="text-[11px] text-[#727783] block uppercase font-semibold">
                      Congestion Zones
                    </span>
                    <strong className="text-[20px] font-mono font-bold text-[#fa9e0d]">
                      {congestionCount > 0 ? congestionCount : 5}
                    </strong>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-[#edeeef] shadow-2xs">
                    <span className="text-[11px] text-[#727783] block uppercase font-semibold">
                      Avg Island Speed
                    </span>
                    <strong className="text-[18px] font-mono font-bold text-[#004481]">
                      52.4 km/h
                    </strong>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-[#edeeef] shadow-2xs">
                    <span className="text-[11px] text-[#727783] block uppercase font-semibold">
                      Accidents Reported
                    </span>
                    <strong className="text-[18px] font-mono font-bold text-[#e51d24]">
                      {accidentsCount}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Road Condition Speed Legend */}
              <div className="bg-white rounded-xl border border-[#c1c6d3] p-4 space-y-2.5">
                <h4 className="text-[13px] font-bold text-[#191c1d] uppercase tracking-wider mb-2">
                  Traffic Condition Speed Legend
                </h4>

                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/60 border border-emerald-200">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#10b981]"></span>
                    <span className="text-[13px] font-medium text-[#191c1d]">Smooth Flow</span>
                  </div>
                  <span className="font-mono text-[12px] font-bold text-emerald-800">&gt; 60 km/h</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/60 border border-amber-200">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#fa9e0d]"></span>
                    <span className="text-[13px] font-medium text-[#191c1d]">Moderate Volume</span>
                  </div>
                  <span className="font-mono text-[12px] font-bold text-amber-800">40 – 60 km/h</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-orange-50/60 border border-orange-200">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#f97316]"></span>
                    <span className="text-[13px] font-medium text-[#191c1d]">Slow Moving</span>
                  </div>
                  <span className="font-mono text-[12px] font-bold text-orange-800">20 – 40 km/h</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-red-50/60 border border-red-200">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#e51d24]"></span>
                    <span className="text-[13px] font-medium text-[#191c1d]">Heavy Congestion</span>
                  </div>
                  <span className="font-mono text-[12px] font-bold text-red-800">&lt; 20 km/h</span>
                </div>
              </div>

              {/* Major Expressways Status List */}
              <div className="bg-white rounded-xl border border-[#c1c6d3] p-4">
                <h4 className="text-[13px] font-bold text-[#191c1d] uppercase tracking-wider mb-3">
                  Expressway Speeds Summary
                </h4>
                <div className="divide-y divide-[#edeeef] text-[13px]">
                  {EXPRESSWAY_SEGMENTS.slice(0, 6).map((exp) => (
                    <div
                      key={exp.id}
                      onClick={() => handleSelectExpressway(exp)}
                      className="py-2.5 flex items-center justify-between hover:bg-[#f8f9fa] px-1 rounded cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: exp.colorHex }}
                        />
                        <span className="font-semibold text-[#191c1d]">{exp.name}</span>
                      </div>
                      <span
                        className="font-mono font-bold text-[12px]"
                        style={{ color: exp.colorHex }}
                      >
                        {exp.speedKmh} km/h
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SELECTED ITEM DETAILS */}
          {activeTab === 'details' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* If Expressway Segment is selected */}
              {selectedExpressway && (
                <div className="bg-white rounded-xl border border-[#c1c6d3] p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#edeeef]">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: selectedExpressway.colorHex }}
                      />
                      <h4 className="text-[16px] font-bold text-[#004481]">
                        {selectedExpressway.name}
                      </h4>
                    </div>
                    <span className="text-[11px] font-bold text-white px-2 py-0.5 rounded uppercase" style={{ backgroundColor: selectedExpressway.colorHex }}>
                      {selectedExpressway.flowLevel}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-[#f8f9fa] p-3 rounded-lg border border-[#edeeef]">
                    <div>
                      <span className="text-[#727783] text-[11px] uppercase font-bold block">
                        Current Speed
                      </span>
                      <span
                        className="text-[22px] font-mono font-bold"
                        style={{ color: selectedExpressway.colorHex }}
                      >
                        {selectedExpressway.speedKmh} km/h
                      </span>
                    </div>

                    <div>
                      <span className="text-[#727783] text-[11px] uppercase font-bold block">
                        Estimated Travel Time
                      </span>
                      <span className="text-[18px] font-mono font-bold text-[#191c1d]">
                        {selectedExpressway.travelTimeMin} mins{' '}
                        <span className="text-[11px] font-normal text-[#727783]">
                          (Typical: {selectedExpressway.typicalTimeMin}m)
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="text-[13px] space-y-1 text-[#414751]">
                    <div>
                      <strong className="text-[#191c1d]">From:</strong> {selectedExpressway.fromLocation}
                    </div>
                    <div>
                      <strong className="text-[#191c1d]">To:</strong> {selectedExpressway.toLocation}
                    </div>
                    <div>
                      <strong className="text-[#191c1d]">Direction:</strong> {selectedExpressway.direction}
                    </div>
                  </div>
                </div>
              )}

              {/* If Incident is selected */}
              {activeIncident && (
                <div className="bg-white rounded-xl border border-[#c1c6d3] p-4 space-y-3.5">
                  <div className="flex justify-between items-start pb-2 border-b border-[#edeeef]">
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
                      <h4 className="text-[16px] font-bold text-[#191c1d]">
                        {activeIncident.title}
                      </h4>
                    </div>
                    <span className="text-[12px] text-[#727783] font-mono">
                      {activeIncident.timeFormatted}
                    </span>
                  </div>

                  <p className="text-[14px] text-[#414751] leading-relaxed">
                    {activeIncident.description}
                  </p>

                  <div className="p-3 bg-[#f8f9fa] rounded-lg border border-[#edeeef] space-y-2 text-[13px]">
                    <div className="flex justify-between">
                      <span className="text-[#727783]">Location Sector:</span>
                      <span className="font-semibold text-[#191c1d]">{activeIncident.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#727783]">Lane Status:</span>
                      <span className="font-bold text-[#e51d24]">
                        {activeIncident.laneClosure || 'Lane 1, 2 Closed'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#727783]">Est. Clearance Time:</span>
                      <span className="font-semibold text-[#004481]">
                        {activeIncident.estClearance || '25 mins'}
                      </span>
                    </div>
                  </div>

                  {/* Traffic Camera Feed if available */}
                  {activeIncident.trafficCamUrl && (
                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#004481]">
                        <Camera className="w-4 h-4" />
                        <span>Live Traffic Camera (LTA CCTV Feed)</span>
                      </div>
                      <img
                        src={activeIncident.trafficCamUrl}
                        alt="Traffic Camera"
                        className="w-full h-44 object-cover rounded-lg border border-[#c1c6d3]"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: TRAFFIC CAMERAS */}
          {activeTab === 'cameras' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-[13px] font-bold text-[#004481] uppercase tracking-wider">
                  Expressway Camera Feeds
                </h4>
                <span className="text-[11px] text-[#727783]">LTA DataMall Image Feeds</span>
              </div>

              {TRAFFIC_CAMERAS.map((cam) => (
                <div
                  key={cam.id}
                  className="bg-white rounded-xl border border-[#c1c6d3] overflow-hidden shadow-2xs hover:shadow-xs transition-shadow"
                >
                  <img
                    src={cam.imageUrl}
                    alt={cam.name}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-3 flex items-center justify-between">
                    <div>
                      <h5 className="text-[14px] font-bold text-[#191c1d]">{cam.name}</h5>
                      <span className="text-[11px] text-[#727783]">Expressway: {cam.expressway}</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                      LIVE
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
