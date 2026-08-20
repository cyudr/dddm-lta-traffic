export type ViewMode = 'traffic' | 'bus' | 'mrt' | 'taxis-parking' | 'customs' | 'trends';

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
  badgeBg?: string;
  badgeText?: string;
  borderClass?: string;
  status: 'normal' | 'delay' | 'disrupted';
  statusTitle?: string;
  statusText?: string;
  statusMessage?: string;
  description?: string;
  operatingHours?: string;
  frequencyMin?: number;
  delayMinutes?: number;
  delayDurationMin?: number;
  stationsCount: number;
  peakFrequency?: string;
  offPeakFrequency?: string;
  firstTrain?: string;
  lastTrain?: string;
  affectedStations?: string[];
  interchanges?: string[];
  stations?: ({ code: string; name: string; isInterchange?: boolean } | string)[];
  onTimeReliability?: number; // e.g. 99.8%
}

export interface ServiceAdvisory {
  id: string;
  lineCode: string;
  lineName?: string;
  lineColorBg?: string;
  timeFormatted?: string;
  timestamp?: string;
  iconType?: 'campaign' | 'info' | 'warning';
  iconColor?: string;
  title: string;
  message?: string;
  description?: string;
  affectedStations?: string;
  affectedSegments?: string;
  alternativeTransport?: string;
  actionAdvice?: string;
  isMajor?: boolean;
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
  direction?: 'towards_jb' | 'towards_sg' | 'towards_changi' | 'towards_city' | 'towards_tuas' | string;
  locationNote?: string;
}

// ----------------------------------------------------
// LTA DataMall Bus Services & Arrivals Types
// ----------------------------------------------------
export type BusLoadLevel = 'SEA' | 'SDA' | 'LSD'; // Seats Available, Standing Available, Limited Standing
export type BusFeature = 'WAB' | ''; // Wheelchair Accessible Bus
export type BusVehicleType = 'SD' | 'DD' | 'BD'; // Single Deck, Double Deck, Bendy

export interface NextBusArrival {
  originCode: string;
  destinationCode: string;
  estimatedArrival: string; // ISO string
  minutesUntilArrival: number;
  latitude?: number;
  longitude?: number;
  visitNumber: number;
  load: BusLoadLevel;
  feature: BusFeature;
  type: BusVehicleType;
}

export interface BusServiceArrivalInfo {
  serviceNo: string;
  operator: 'SBST' | 'SMRT' | 'TTS' | 'GAS' | string;
  nextBus?: NextBusArrival;
  nextBus2?: NextBusArrival;
  nextBus3?: NextBusArrival;
}

export interface BusStopItem {
  busStopCode: string;
  roadName: string;
  description: string;
  latitude: number;
  longitude: number;
  distanceKm?: number;
}

// ----------------------------------------------------
// LTA DataMall Platform Crowd Density (PCD) Types
// ----------------------------------------------------
export type MRTCrowdLevel = 'l' | 'm' | 'h' | 'na'; // low, moderate, high

export interface StationCrowdDensity {
  station: string; // e.g. "NS1", "EW24"
  stationName?: string;
  line: string; // "NSL", "EWL", "NEL", "CCL", "DTL", "TEL"
  startTime: string;
  endTime: string;
  crowdLevel: MRTCrowdLevel;
}

// ----------------------------------------------------
// LTA DataMall Taxi Availability & Taxi Stands
// ----------------------------------------------------
export interface TaxiLocation {
  latitude: number;
  longitude: number;
}

export interface TaxiStandItem {
  taxiCode: string;
  latitude: number;
  longitude: number;
  bfa: 'Yes' | 'No' | string; // Barrier Free Access
  ownership: string;
  type: string; // "Stand", "Stop"
  name: string;
}

// ----------------------------------------------------
// LTA DataMall Carpark & Bicycle Parking Types
// ----------------------------------------------------
export interface CarparkAvailabilityItem {
  carParkID: string;
  area: string;
  development: string;
  location: string;
  availableLots: number;
  lotType: string; // "C" (Car), "H" (Heavy), "M" (Motorcycle)
  agency: 'HDB' | 'LTA' | 'URA' | string;
  latitude: number;
  longitude: number;
}

export interface BicycleParkingItem {
  description: string;
  latitude: number;
  longitude: number;
  rackType: 'MRT_RACKS' | 'HDB_RACKS' | 'NLB_RACKS' | 'PARKS_RACKS' | string;
  rackCount: number;
  shelterIndicator: 'Y' | 'N' | string;
}

// ----------------------------------------------------
// LTA DataMall Road Openings & Utility Works
// ----------------------------------------------------
export interface RoadOpeningItem {
  eventId: string;
  startDate: string;
  endDate: string;
  svcDept: string; // "PUB", "SP POWERGRID", "SINGTEL", "PRIVATE", "LTA"
  roadName: string;
  other: string; // Contact phone / details
}

// ----------------------------------------------------
// LTA DataMall Mobility Datasets Types
// ----------------------------------------------------
export interface MobilityDatasetItem {
  id: string;
  title: string;
  category: 'Passenger Volume' | 'Origin-Destination' | 'Traffic Flow';
  period: string;
  downloadLink: string;
  description: string;
}

// ----------------------------------------------------
// Historical Trends & Analytics Types
// ----------------------------------------------------
export interface WeekdayTrendMetric {
  day: string;
  dayShort: string;
  isWeekend: boolean;
  accidents: number;
  breakdowns: number;
  congestionEvents: number;
  totalIncidents: number;
  avgSpeedKmh: number;
  peakCongestionHour: string;
  label: string;
}

export interface HourlyIncidentTrend {
  hour: string;
  accidents: number;
  breakdowns: number;
  roadworks: number;
  congestion: number;
  total: number;
}

export interface ExpresswaySpeedTrendPoint {
  time: string;
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
  reliabilityScore: number;
}

export interface MRTReliabilityTrend {
  line: string;
  code: string;
  mkbfKm: number;
  punctualityPct: number;
  majorDelaysThisMonth: number;
  morningPeakCrowdPct: number;
  eveningPeakCrowdPct: number;
}

export interface HistoricalTrendsData {
  timeframe: '24h' | '7d' | '30d' | 'custom';
  startDate?: string;
  endDate?: string;
  lastHarvestTimestamp: string;
  totalIncidentsRecorded: number;
  avgNetworkSpeedKmh: number;
  networkSpeedDeltaVsYesterdayPct: number;
  peakHourCongestionIndex: number;
  hourlyTrends: HourlyIncidentTrend[];
  weekdayTrends: WeekdayTrendMetric[];
  speedTimeline: ExpresswaySpeedTrendPoint[];
  corridorReliability: CorridorReliabilityMetric[];
  mrtReliability: MRTReliabilityTrend[];
  topBottlenecks: { location: string; expressway: string; incidentFrequency: number; avgDelayMin: number }[];
}

// ----------------------------------------------------
// Johor Bahru / Singapore Cross-Border Customs Types
// ----------------------------------------------------
export interface CheckpointDirectionStatus {
  travelTimeMin: number;
  baselineTimeMin: number;
  delayMinutes: number;
  status: 'smooth' | 'moderate' | 'heavy' | 'standstill' | 'congested';
  statusText: string;
  speedKmh: number;
  queueLengthKm: number;
  carLanesOpen: number;
  motorcycleLanesOpen: number;
}

export interface CheckpointHourlyForecast {
  hour: string;
  toJBMin: number;
  toSGMin: number;
  isPeak: boolean;
}

export interface CustomsCheckpointData {
  id: 'woodlands' | 'tuas';
  name: string;
  alias: string;
  approachRoad: string;
  malaysiaCheckpoint: string;
  coordinates: { lat: number; lng: number };
  singaporeToJB: CheckpointDirectionStatus;
  jbToSingapore: CheckpointDirectionStatus;
  qrClearanceActive: boolean;
  eGatesStatus: string;
  lastUpdated: string;
  bestTimeToCross: string;
  cameras: TrafficCamera[];
  hourlyWaitForecast: CheckpointHourlyForecast[];
  advisories: string[];
}

