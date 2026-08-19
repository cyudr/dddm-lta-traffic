export type ViewMode = 'traffic' | 'mrt' | 'trends';

export type IncidentType = 'accident' | 'roadworks' | 'congestion' | 'breakdown' | 'heavy_rain';

export type TrafficFlowLevel = 'smooth' | 'moderate' | 'slow' | 'congested';

export interface ExpresswayTrafficSegment {
  id: string;
  name: string;
  code: string; // 'PIE', 'AYE', 'CTE', 'KPE', 'SLE', 'BKE', 'ECP', 'TPE', 'MCE', 'KJE'
  direction: string; // 'Eastbound', 'Westbound', 'Northbound', 'Southbound'
  fromLocation: string;
  toLocation: string;
  speedKmh: number;
  flowLevel: TrafficFlowLevel;
  colorHex: string;
  coordinates: [number, number][]; // GPS coordinates [lat, lng] for Google Maps polylines
  travelTimeMin: number;
  typicalTimeMin: number;
  incidentsCount: number;
  historicalDeltaPct?: number; // e.g. -8% vs 7-day average
}

export interface TrafficIncident {
  id: string;
  type: IncidentType;
  title: string;
  expressway: string;
  location: string;
  description: string;
  timestamp: string;
  timeFormatted: string;
  severity: 'critical' | 'moderate' | 'minor';
  tags: string[];
  lat: number; // GPS latitude
  lng: number; // GPS longitude
  latPercent?: number; // fallback
  lngPercent?: number; // fallback
  laneClosure?: string;
  estClearance?: string;
  trafficCamUrl?: string;
  speedKmh?: number;
}

export interface MRTLineStatus {
  id: string;
  code: string;
  name: string;
  colorHex: string;
  badgeBg: string;
  badgeText: string;
  borderClass: string;
  status: 'normal' | 'delay' | 'disrupted';
  statusTitle: string;
  statusMessage?: string;
  delayMinutes?: number;
  stationsCount: number;
  peakFrequency: string;
  offPeakFrequency: string;
  firstTrain: string;
  lastTrain: string;
  stations?: { code: string; name: string; isInterchange?: boolean }[];
  onTimeReliability?: number; // e.g. 99.8%
}

export interface ServiceAdvisory {
  id: string;
  lineCode: string;
  lineColorBg: string;
  timeFormatted: string;
  iconType: 'campaign' | 'info' | 'warning';
  iconColor: string;
  title: string;
  message: string;
  affectedStations?: string;
  alternativeTransport?: string;
}

export interface TrafficCamera {
  id: string;
  cameraId?: string;
  name: string;
  expressway: string;
  imageUrl: string;
  proxyImageUrl?: string;
  lat: number;
  lng: number;
  latPercent?: number;
  lngPercent?: number;
  isOnline?: boolean;
  status?: string;
}

// Historical Trends & Analytics Types
export interface HourlyIncidentTrend {
  hour: string; // '00:00', '02:00', etc.
  accidents: number;
  breakdowns: number;
  roadworks: number;
  congestion: number;
  total: number;
}

export interface ExpresswaySpeedTrendPoint {
  time: string; // '06:00', '07:30', etc.
  PIE: number;
  AYE: number;
  CTE: number;
  KPE: number;
  ECP: number;
  SLE: number;
  avgSpeed: number;
}

export interface CorridorReliabilityMetric {
  corridor: string;
  currentTravelTimeMin: number;
  baselineTravelTimeMin: number;
  varianceMinutes: number;
  status: 'On Time' | 'Moderate Delay' | 'Heavy Delay';
  peakHourTrend: 'Improving' | 'Worsening' | 'Stable';
  reliabilityScore: number; // percentage, e.g. 94%
}

export interface MRTReliabilityTrend {
  line: string;
  code: string;
  mkbfKm: number; // Mean Kilometres Between Failures in thousands (e.g. 2100k km)
  punctualityPct: number;
  majorDelaysThisMonth: number;
  morningPeakCrowdPct: number;
  eveningPeakCrowdPct: number;
}

export interface HistoricalTrendsData {
  timeframe: '24h' | '7d' | '30d';
  lastHarvestTimestamp: string;
  totalIncidentsRecorded: number;
  avgNetworkSpeedKmh: number;
  networkSpeedDeltaVsYesterdayPct: number;
  peakHourCongestionIndex: number;
  hourlyTrends: HourlyIncidentTrend[];
  speedTimeline: ExpresswaySpeedTrendPoint[];
  corridorReliability: CorridorReliabilityMetric[];
  mrtReliability: MRTReliabilityTrend[];
  topBottlenecks: { location: string; expressway: string; incidentFrequency: number; avgDelayMin: number }[];
}
