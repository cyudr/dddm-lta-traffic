export type ViewMode = 'traffic' | 'mrt';

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
  svgPath: string; // SVG path coordinate string relative to map viewBox (1000x650)
  travelTimeMin: number;
  typicalTimeMin: number;
  incidentsCount: number;
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
  latPercent: number; // percentage on map image for placement (0-100)
  lngPercent: number; // percentage on map image for placement (0-100)
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
  name: string;
  expressway: string;
  imageUrl: string;
  latPercent: number;
  lngPercent: number;
}
