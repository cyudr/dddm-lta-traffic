import React, { useState, useMemo } from 'react';
import { TrafficIncident, ExpresswayTrafficSegment, TrafficCamera } from '../types';
import { EXPRESSWAY_SEGMENTS, TRAFFIC_CAMERAS } from '../data/transportData';
import { GoogleTrafficMap } from './GoogleTrafficMap';
import { CameraViewerModal } from './CameraViewerModal';
import { useLanguage } from '../i18n/LanguageContext';
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
  RefreshCw,
  Eye,
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

type RightPanelTab = 'feed' | 'overview' | 'details' | 'cameras';

export const TrafficIncidentsView: React.FC<TrafficIncidentsViewProps> = ({
  incidents,
  searchQuery,
  lastRefreshedTime,
  onRefreshData,
  isRefreshing = false,
}) => {
  const { t } = useLanguage();
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [activeIncidentId, setActiveIncidentId] = useState<string | null>('inc-1');
  const [selectedExpressway, setSelectedExpressway] = useState<ExpresswayTrafficSegment | null>(null);
  const [selectedCameraForModal, setSelectedCameraForModal] = useState<TrafficCamera | null>(null);
  const [showRoadFlow, setShowRoadFlow] = useState<boolean>(true);
  const [showIncidents, setShowIncidents] = useState<boolean>(true);
  const [showCameras, setShowCameras] = useState<boolean>(true);

  // Sliding panel state & tabs
  const [activeTab, setActiveTab] = useState<RightPanelTab>('feed');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);

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

  const handleSelectIncident = (incidentId: string) => {
    setActiveIncidentId(incidentId);
    setSelectedExpressway(null);
    setActiveTab('details');
    if (!isDrawerOpen) setIsDrawerOpen(true);
  };

  const handleSelectExpressway = (segment: ExpresswayTrafficSegment) => {
    setSelectedExpressway(segment);
    setActiveTab('details');
    if (!isDrawerOpen) setIsDrawerOpen(true);
  };

  const handleSelectCamera = (cam: TrafficCamera) => {
    setSelectedCameraForModal(cam);
  };

  return (
    <div className="flex-1 md:mr-72 flex flex-col bg-[#f8f9fa] h-[calc(100vh-64px)] pb-11 overflow-hidden">
      {/* 1. Top Telemetry & Controls Bar */}
      <div
        id="traffic-telemetry-bar"
        className="bg-white border-b border-[#c1c6d3] px-4 py-2 flex flex-wrap items-center justify-between gap-2 shadow-2xs z-20 shrink-0"
      >
        {/* Left: Data Source & Real-time Live Status */}
        <div className="flex items-center gap-3 text-[12px] flex-wrap">
          <div className="flex items-center gap-1.5 font-bold text-[#004481] bg-[#d5e3ff]/40 px-2.5 py-1 rounded-md border border-[#c1c6d3]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>{t('dataSourceLta')}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[#414751]">
            <Clock className="w-3.5 h-3.5 text-[#727783]" />
            <span>
              {t('lastIngested')}:{' '}
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

          <div className="hidden lg:flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px] font-semibold">
            <CheckCircle2 className="w-3 h-3" />
            <span>{t('liveStreamConnected')}</span>
          </div>
        </div>

        {/* Right: Map Layers & Sliding Drawer Toggle */}
        <div className="flex items-center gap-2">
          {/* Map Layer Toggles */}
          <div className="flex items-center gap-1 bg-[#f3f4f5] p-1 rounded-lg border border-[#c1c6d3] text-[11px]">
            <button
              onClick={() => setShowRoadFlow((prev) => !prev)}
              className={`px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer ${
                showRoadFlow
                  ? 'bg-[#004481] text-white shadow-2xs'
                  : 'text-[#414751] hover:text-[#191c1d]'
              }`}
              title="Toggle Google Maps Traffic Flow Bands"
            >
              {t('roadSpeeds')}
            </button>
            <button
              onClick={() => setShowIncidents((prev) => !prev)}
              className={`px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer ${
                showIncidents
                  ? 'bg-[#004481] text-white shadow-2xs'
                  : 'text-[#414751] hover:text-[#191c1d]'
              }`}
              title="Toggle Incident Pins"
            >
              {t('hazards')}
            </button>
            <button
              onClick={() => setShowCameras((prev) => !prev)}
              className={`px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer ${
                showCameras
                  ? 'bg-[#004481] text-white shadow-2xs'
                  : 'text-[#414751] hover:text-[#191c1d]'
              }`}
              title="Toggle Live Traffic Cameras"
            >
              {t('cameras')}
            </button>
          </div>

          {/* Toggle Sliding Drawer Button */}
          <button
            id="toggle-sliding-panel-btn"
            onClick={() => setIsDrawerOpen((prev) => !prev)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#c1c6d3] bg-[#f8f9fa] hover:bg-[#edeeef] text-[#191c1d] text-[12px] font-semibold transition-colors cursor-pointer shadow-2xs"
            title={isDrawerOpen ? t('hideSidebar') : t('showSidebar')}
          >
            {isDrawerOpen ? (
              <>
                <span className="hidden sm:inline">{t('hideSidebar')}</span>
                <ChevronRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">{t('showSidebar')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Main Content View: Real Google Maps Interface + Sliding Right Drawer */}
      <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden relative">
        {/* Real Interactive Google Maps Canvas */}
        <div
          id="google-maps-view-container"
          className="flex-1 relative w-full h-full min-h-[420px] bg-[#e5e3df] overflow-hidden"
        >
          <GoogleTrafficMap
            expresswaySegments={EXPRESSWAY_SEGMENTS}
            incidents={incidents}
            cameras={TRAFFIC_CAMERAS}
            showRoadFlow={showRoadFlow}
            showIncidents={showIncidents}
            showCameras={showCameras}
            activeIncidentId={activeIncidentId}
            selectedExpresswayId={selectedExpressway?.id || null}
            onSelectIncident={handleSelectIncident}
            onSelectExpressway={handleSelectExpressway}
            onSelectCamera={handleSelectCamera}
          />
        </div>

        {/* 3. Sliding Drawer (Feed, Speeds, CCTV List, and Details) */}
        <div
          id="sliding-drawer-panel"
          className={`bg-white border-l border-[#c1c6d3] flex flex-col h-full z-25 transition-all duration-300 ease-in-out shadow-xl ${
            isDrawerOpen
              ? 'w-full lg:w-[380px] xl:w-[420px] opacity-100'
              : 'w-0 lg:w-0 opacity-0 pointer-events-none overflow-hidden'
          }`}
        >
          {/* Drawer Tab Header */}
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
                <span>{t('liveFeed')}</span>
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
                <span>{t('overview')}</span>
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
                <span>{t('selected')}</span>
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
                <span>{t('cctvFeeds')}</span>
              </button>
            </div>

            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-1 text-[#727783] hover:text-[#191c1d] rounded-lg hover:bg-[#edeeef] transition-colors ml-1 shrink-0 cursor-pointer"
              title="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* TAB 1: LIVE FEED */}
          {activeTab === 'feed' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Filter Pills */}
              <div className="p-3 border-b border-[#edeeef] bg-white flex gap-1.5 flex-wrap shrink-0">
                <button
                  id="filter-chip-all"
                  onClick={() => setSelectedFilter('All')}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                    selectedFilter === 'All'
                      ? 'bg-[#004481] text-white shadow-2xs'
                      : 'bg-[#f3f4f5] text-[#414751] hover:bg-[#e1e3e4]'
                  }`}
                >
                  {t('all')} ({incidents.length})
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
                  {t('accidents')} ({accidentsCount})
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
                  {t('roadworks')} ({roadworksCount})
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
                  {t('congestion')} ({congestionCount})
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
                    <p className="text-[14px] font-semibold">{t('noIncidentsFound')}</p>
                  </div>
                ) : (
                  filteredIncidents.map((incident) => {
                    const isSelected = incident.id === activeIncidentId;
                    const isAccident = incident.type === 'accident';
                    const isRoadworks = incident.type === 'roadworks';

                    let borderLeftClass = 'border-l-[#727783]';
                    let badgeColor = 'text-[#414751]';
                    let iconName = 'traffic';
                    let typeLabel = t('congestion');

                    if (isAccident) {
                      borderLeftClass = 'border-l-[#e51d24]';
                      badgeColor = 'text-[#e51d24]';
                      iconName = 'warning';
                      typeLabel = t('accidents');
                    } else if (isRoadworks) {
                      borderLeftClass = 'border-l-[#795400]';
                      badgeColor = 'text-[#795400]';
                      iconName = 'construction';
                      typeLabel = t('roadworks');
                    } else {
                      borderLeftClass = 'border-l-[#005baa]';
                      badgeColor = 'text-[#005baa]';
                      iconName = 'car_repair';
                      typeLabel = t('breakdowns');
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
                            <span className={`text-[12px] font-bold tracking-wider ${badgeColor} uppercase`}>
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
                            {t('viewDetails')} ➔
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
                    {t('networkOverview')}
                  </h4>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    {t('liveIngestion')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-lg border border-[#edeeef] shadow-2xs">
                    <span className="text-[11px] text-[#727783] block uppercase font-semibold">
                      {t('activeIncidents')}
                    </span>
                    <strong className="text-[20px] font-mono font-bold text-[#e51d24]">
                      {totalIncidents}
                    </strong>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-[#edeeef] shadow-2xs">
                    <span className="text-[11px] text-[#727783] block uppercase font-semibold">
                      {t('severeCongestion')}
                    </span>
                    <strong className="text-[20px] font-mono font-bold text-[#fa9e0d]">
                      {congestionCount > 0 ? congestionCount : 5}
                    </strong>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-[#edeeef] shadow-2xs">
                    <span className="text-[11px] text-[#727783] block uppercase font-semibold">
                      {t('avgIslandSpeed')}
                    </span>
                    <strong className="text-[18px] font-mono font-bold text-[#004481]">
                      52.4 km/h
                    </strong>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-[#edeeef] shadow-2xs">
                    <span className="text-[11px] text-[#727783] block uppercase font-semibold">
                      {t('accidentsReported')}
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
                  {t('speedLegendTitle')}
                </h4>

                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/60 border border-emerald-200">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#0f9d58]"></span>
                    <span className="text-[13px] font-medium text-[#191c1d]">{t('smoothFlow')}</span>
                  </div>
                  <span className="font-mono text-[12px] font-bold text-emerald-800">&gt; 60 km/h</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/60 border border-amber-200">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#ffa000]"></span>
                    <span className="text-[13px] font-medium text-[#191c1d]">{t('moderateVolume')}</span>
                  </div>
                  <span className="font-mono text-[12px] font-bold text-amber-800">40 – 60 km/h</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-orange-50/60 border border-orange-200">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#ff7043]"></span>
                    <span className="text-[13px] font-medium text-[#191c1d]">{t('slowMoving')}</span>
                  </div>
                  <span className="font-mono text-[12px] font-bold text-orange-800">20 – 40 km/h</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-red-50/60 border border-red-200">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#d93025]"></span>
                    <span className="text-[13px] font-medium text-[#191c1d]">{t('heavyCongestion')}</span>
                  </div>
                  <span className="font-mono text-[12px] font-bold text-red-800">&lt; 20 km/h</span>
                </div>
              </div>

              {/* Major Expressways Status List */}
              <div className="bg-white rounded-xl border border-[#c1c6d3] p-4">
                <h4 className="text-[13px] font-bold text-[#191c1d] uppercase tracking-wider mb-3">
                  {t('expresswaySpeedsSummary')}
                </h4>
                <div className="divide-y divide-[#edeeef] text-[13px]">
                  {EXPRESSWAY_SEGMENTS.slice(0, 7).map((exp) => (
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
                    <span
                      className="text-[11px] font-bold text-white px-2 py-0.5 rounded uppercase"
                      style={{ backgroundColor: selectedExpressway.colorHex }}
                    >
                      {selectedExpressway.flowLevel}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-[#f8f9fa] p-3 rounded-lg border border-[#edeeef]">
                    <div>
                      <span className="text-[#727783] text-[11px] uppercase font-bold block">
                        {t('currentSpeed')}
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
                        {t('estimatedTravelTime')}
                      </span>
                      <span className="text-[18px] font-mono font-bold text-[#191c1d]">
                        {selectedExpressway.travelTimeMin} mins{' '}
                        <span className="text-[11px] font-normal text-[#727783]">
                          ({t('typicalTime')}: {selectedExpressway.typicalTimeMin}m)
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="text-[13px] space-y-1 text-[#414751]">
                    <div>
                      <strong className="text-[#191c1d]">{t('from')}:</strong> {selectedExpressway.fromLocation}
                    </div>
                    <div>
                      <strong className="text-[#191c1d]">{t('to')}:</strong> {selectedExpressway.toLocation}
                    </div>
                    <div>
                      <strong className="text-[#191c1d]">{t('direction')}:</strong> {selectedExpressway.direction}
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
                      <span className="text-[#727783]">{t('sector')}:</span>
                      <span className="font-semibold text-[#191c1d]">{activeIncident.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#727783]">{t('laneStatus')}:</span>
                      <span className="font-bold text-[#e51d24]">
                        {activeIncident.laneClosure || 'Lane 1, 2 Closed'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#727783]">{t('estClearance')}:</span>
                      <span className="font-semibold text-[#004481]">
                        {activeIncident.estClearance || '25 mins'}
                      </span>
                    </div>
                  </div>

                  {/* Live Traffic Camera Stream if available */}
                  {activeIncident.trafficCamUrl && (
                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#004481]">
                          <Camera className="w-4 h-4" />
                          <span>{t('liveCctvFeed')}</span>
                        </div>
                        <button
                          onClick={() => {
                            const matchedCam = TRAFFIC_CAMERAS.find(
                              (c) => c.expressway === activeIncident.expressway
                            ) || TRAFFIC_CAMERAS[0];
                            setSelectedCameraForModal(matchedCam);
                          }}
                          className="text-[11px] text-[#004481] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Maximize2 className="w-3 h-3" />
                          <span>{t('viewFullFeed')}</span>
                        </button>
                      </div>
                      <div
                        onClick={() => {
                          const matchedCam = TRAFFIC_CAMERAS.find(
                            (c) => c.expressway === activeIncident.expressway
                          ) || TRAFFIC_CAMERAS[0];
                          setSelectedCameraForModal(matchedCam);
                        }}
                        className="relative rounded-lg overflow-hidden border border-[#c1c6d3] cursor-pointer group"
                      >
                        <img
                          src={activeIncident.trafficCamUrl}
                          alt="Traffic Camera"
                          className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <span className="bg-black/75 text-white text-[11px] px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5" />
                            <span>Click to Open Live Stream</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: TRAFFIC CAMERAS (List with snapshot previews and modal triggers) */}
          {activeTab === 'cameras' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-[13px] font-bold text-[#004481] uppercase tracking-wider">
                  {t('liveCctv')}
                </h4>
                <span className="text-[11px] text-[#727783]">LTA DataMall Images</span>
              </div>

              {TRAFFIC_CAMERAS.map((cam) => (
                <div
                  key={cam.id}
                  onClick={() => handleSelectCamera(cam)}
                  className="bg-white rounded-xl border border-[#c1c6d3] overflow-hidden shadow-2xs hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="relative">
                    <img
                      src={cam.imageUrl}
                      alt={cam.name}
                      className="w-full h-40 object-cover group-hover:scale-102 transition-transform duration-200"
                    />
                    <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded">
                      {cam.expressway} • CCTV
                    </div>
                    <div className="absolute bottom-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                      <span>LIVE</span>
                    </div>
                  </div>

                  <div className="p-3 flex items-center justify-between">
                    <div>
                      <h5 className="text-[14px] font-bold text-[#191c1d] group-hover:text-[#004481] transition-colors">
                        {cam.name}
                      </h5>
                      <span className="text-[11px] text-[#727783]">{t('expresswayCorridor')}: {cam.expressway}</span>
                    </div>
                    <button
                      className="p-1.5 text-[#004481] hover:bg-[#d5e3ff]/40 rounded-lg transition-colors"
                      title={t('viewFullFeed')}
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Camera Live Feed Modal */}
      <CameraViewerModal
        camera={selectedCameraForModal}
        isOpen={!!selectedCameraForModal}
        onClose={() => setSelectedCameraForModal(null)}
        allCameras={TRAFFIC_CAMERAS}
        onSelectCamera={(cam) => setSelectedCameraForModal(cam)}
        incidents={incidents}
      />
    </div>
  );
};
