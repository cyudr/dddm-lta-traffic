import { TrafficIncident, MRTLineStatus, ServiceAdvisory, TrafficCamera, ExpresswayTrafficSegment } from '../types';

/**
 * Returns current Singapore Standard Time (SGT / UTC+8)
 */
export function getSingaporeTime(): Date {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 3600000 * 8);
}

/**
 * Calculates authentic Singapore expressway flow profiles based on SGT time of day
 */
export function getDynamicExpresswaySegments(
  incidents: TrafficIncident[] = [],
  currentTime?: Date
): ExpresswayTrafficSegment[] {
  const sgt = currentTime || getSingaporeTime();
  const hour = sgt.getHours();
  const minute = sgt.getMinutes();
  const timeVal = hour + minute / 60;

  // Base speed & congestion logic by time of day
  // 1. Midnight to Early Dawn (22:30 - 06:30): Free flow across entire network (85-95 km/h, smooth)
  // 2. AM Peak (07:30 - 09:30): Inbound corridors to CBD congested (22-38 km/h)
  // 3. Midday Off-Peak (09:30 - 16:45): Steady flow (68-82 km/h)
  // 4. PM Peak (17:15 - 19:45): Outbound corridors to residential hubs & checkpoints congested (20-35 km/h)
  // 5. Late Evening (19:45 - 22:30): Recovery to free flow (78-88 km/h)

  const isNight = timeVal >= 22.5 || timeVal < 6.5;
  const isAmPeak = timeVal >= 7.5 && timeVal <= 9.5;
  const isPmPeak = timeVal >= 17.25 && timeVal <= 19.75;
  const isMidday = timeVal > 9.5 && timeVal < 17.25;

  const baseSegments: Array<{
    id: string;
    name: string;
    code: string;
    direction: string;
    fromLocation: string;
    toLocation: string;
    coordinates: [number, number][];
    typicalTimeMin: number;
    // Time-based speed profiles
    nightSpeed: number;
    amPeakSpeed: number;
    pmPeakSpeed: number;
    middaySpeed: number;
  }> = [
    {
      id: 'pie-central-eb',
      name: 'PIE (Central Sector - Eastbound)',
      code: 'PIE',
      direction: 'Towards Changi',
      fromLocation: 'Adam Rd Flyover',
      toLocation: 'Toa Payoh / CTE Int',
      coordinates: [
        [1.332, 103.815],
        [1.334, 103.835],
        [1.331, 103.852],
        [1.328, 103.864]
      ],
      typicalTimeMin: 10,
      nightSpeed: 88,
      amPeakSpeed: 28,
      pmPeakSpeed: 42,
      middaySpeed: 68,
    },
    {
      id: 'pie-east-eb',
      name: 'PIE (East Sector - Eastbound)',
      code: 'PIE',
      direction: 'Towards Changi',
      fromLocation: 'Kallang Way',
      toLocation: 'Changi Airport',
      coordinates: [
        [1.328, 103.864],
        [1.332, 103.905],
        [1.341, 103.935],
        [1.352, 103.962],
        [1.361, 103.988]
      ],
      typicalTimeMin: 11,
      nightSpeed: 90,
      amPeakSpeed: 62,
      pmPeakSpeed: 52,
      middaySpeed: 74,
    },
    {
      id: 'pie-west-wb',
      name: 'PIE (West Sector - Westbound)',
      code: 'PIE',
      direction: 'Towards Tuas',
      fromLocation: 'BKE Junction',
      toLocation: 'Tuas Flyover',
      coordinates: [
        [1.348, 103.773],
        [1.345, 103.738],
        [1.342, 103.705],
        [1.332, 103.665],
        [1.328, 103.638]
      ],
      typicalTimeMin: 15,
      nightSpeed: 90,
      amPeakSpeed: 65,
      pmPeakSpeed: 28, // Heavy westbound evening rush
      middaySpeed: 75,
    },
    {
      id: 'aye-clementi-wb',
      name: 'AYE (Clementi Sector - Westbound)',
      code: 'AYE',
      direction: 'Towards Tuas',
      fromLocation: 'Buona Vista Flyover',
      toLocation: 'Jurong Town Hall',
      coordinates: [
        [1.295, 103.785],
        [1.305, 103.772],
        [1.315, 103.755],
        [1.323, 103.735]
      ],
      typicalTimeMin: 12,
      nightSpeed: 86,
      amPeakSpeed: 58,
      pmPeakSpeed: 30, // Westbound PM Peak
      middaySpeed: 70,
    },
    {
      id: 'aye-city-eb',
      name: 'AYE (City Sector - Eastbound)',
      code: 'AYE',
      direction: 'Towards City / MCE',
      fromLocation: 'Keppel Viaduct',
      toLocation: 'Marina Coastal',
      coordinates: [
        [1.295, 103.785],
        [1.282, 103.812],
        [1.272, 103.835]
      ],
      typicalTimeMin: 9,
      nightSpeed: 88,
      amPeakSpeed: 34, // Citybound AM Peak
      pmPeakSpeed: 62,
      middaySpeed: 76,
    },
    {
      id: 'cte-central-sb',
      name: 'CTE (Southbound - Citybound)',
      code: 'CTE',
      direction: 'Towards City',
      fromLocation: 'Braddell Rd Flyover',
      toLocation: 'Moulmein / Bukit Timah Exit',
      coordinates: [
        [1.342, 103.86],
        [1.328, 103.854],
        [1.318, 103.848],
        [1.305, 103.843]
      ],
      typicalTimeMin: 11,
      nightSpeed: 85,
      amPeakSpeed: 22, // Heavy Citybound AM bottleneck
      pmPeakSpeed: 54,
      middaySpeed: 66,
    },
    {
      id: 'cte-north-nb',
      name: 'CTE (Northbound - Towards SLE)',
      code: 'CTE',
      direction: 'Towards SLE / Yio Chu Kang',
      fromLocation: 'Cavenagh Rd',
      toLocation: 'Seletar Expressway',
      coordinates: [
        [1.305, 103.843],
        [1.332, 103.855],
        [1.365, 103.858],
        [1.385, 103.855]
      ],
      typicalTimeMin: 11,
      nightSpeed: 86,
      amPeakSpeed: 68,
      pmPeakSpeed: 24, // Outbound PM peak bottleneck
      middaySpeed: 72,
    },
    {
      id: 'kpe-tunnel-nb',
      name: 'KPE (Kallang-Paya Lebar Tunnel)',
      code: 'KPE',
      direction: 'Towards TPE',
      fromLocation: 'Nicoll Highway Entry',
      toLocation: 'Airport Road Exit',
      coordinates: [
        [1.295, 103.875],
        [1.318, 103.882],
        [1.345, 103.89],
        [1.368, 103.894]
      ],
      typicalTimeMin: 12,
      nightSpeed: 82,
      amPeakSpeed: 64,
      pmPeakSpeed: 38,
      middaySpeed: 74,
    },
    {
      id: 'ecp-east-eb',
      name: 'ECP (East Coast Parkway)',
      code: 'ECP',
      direction: 'Towards Changi Airport',
      fromLocation: 'Benjamin Sheares Bridge',
      toLocation: 'Airport Boulevard',
      coordinates: [
        [1.291, 103.861],
        [1.298, 103.882],
        [1.302, 103.91],
        [1.315, 103.945],
        [1.355, 103.985]
      ],
      typicalTimeMin: 14,
      nightSpeed: 90,
      amPeakSpeed: 70,
      pmPeakSpeed: 58,
      middaySpeed: 78,
    },
    {
      id: 'sle-central-wb',
      name: 'SLE (Seletar Expressway)',
      code: 'SLE',
      direction: 'Towards BKE / Woodlands',
      fromLocation: 'CTE / TPE Interchange',
      toLocation: 'Woodlands South / BKE',
      coordinates: [
        [1.388, 103.855],
        [1.405, 103.82],
        [1.418, 103.792],
        [1.428, 103.775]
      ],
      typicalTimeMin: 8,
      nightSpeed: 92,
      amPeakSpeed: 76,
      pmPeakSpeed: 64,
      middaySpeed: 82,
    },
    {
      id: 'bke-north-nb',
      name: 'BKE (Bukit Timah Expressway)',
      code: 'BKE',
      direction: 'Towards Woodlands Checkpoint',
      fromLocation: 'Mandai Road Exit',
      toLocation: 'Woodlands Crossing',
      coordinates: [
        [1.348, 103.773],
        [1.378, 103.776],
        [1.412, 103.772],
        [1.442, 103.768]
      ],
      typicalTimeMin: 10,
      nightSpeed: 88,
      amPeakSpeed: 64,
      pmPeakSpeed: 36, // Causeway departure rush
      middaySpeed: 76,
    },
    {
      id: 'tpe-north-eb',
      name: 'TPE (Tampines Expressway)',
      code: 'TPE',
      direction: 'Towards Changi / Pasir Ris',
      fromLocation: 'Seletar Aerospace',
      toLocation: 'PIE Changi Exit',
      coordinates: [
        [1.392, 103.865],
        [1.398, 103.895],
        [1.385, 103.925],
        [1.372, 103.945],
        [1.355, 103.972]
      ],
      typicalTimeMin: 11,
      nightSpeed: 90,
      amPeakSpeed: 72,
      pmPeakSpeed: 60,
      middaySpeed: 80,
    },
    {
      id: 'mce-coastal',
      name: 'MCE (Marina Coastal Expressway)',
      code: 'MCE',
      direction: 'Both Directions',
      fromLocation: 'AYE / Keppel',
      toLocation: 'ECP / Fort Road',
      coordinates: [
        [1.272, 103.835],
        [1.275, 103.858],
        [1.295, 103.875]
      ],
      typicalTimeMin: 5,
      nightSpeed: 86,
      amPeakSpeed: 68,
      pmPeakSpeed: 62,
      middaySpeed: 78,
    },
    {
      id: 'kje-central',
      name: 'KJE (Kranji Expressway)',
      code: 'KJE',
      direction: 'Towards PIE / Jurong',
      fromLocation: 'BKE Junction',
      toLocation: 'PIE Jurong West',
      coordinates: [
        [1.385, 103.765],
        [1.378, 103.735],
        [1.365, 103.712],
        [1.352, 103.695]
      ],
      typicalTimeMin: 7,
      nightSpeed: 92,
      amPeakSpeed: 75,
      pmPeakSpeed: 68,
      middaySpeed: 84,
    },
  ];

  return baseSegments.map((s) => {
    let speed = s.nightSpeed;
    if (isNight) {
      speed = s.nightSpeed;
    } else if (isAmPeak) {
      speed = s.amPeakSpeed;
    } else if (isPmPeak) {
      speed = s.pmPeakSpeed;
    } else if (isMidday) {
      speed = s.middaySpeed;
    } else {
      // Transitional evening
      speed = Math.round((s.middaySpeed + s.nightSpeed) / 2);
    }

    // Check if any active incidents affect this segment
    const segmentIncidents = incidents.filter(
      (inc) =>
        inc.expressway === s.code &&
        (inc.description.toLowerCase().includes(s.direction.toLowerCase()) ||
          inc.location.toLowerCase().includes(s.fromLocation.toLowerCase()) ||
          inc.location.toLowerCase().includes(s.toLocation.toLowerCase()))
    );

    if (segmentIncidents.length > 0) {
      // Incident drag
      speed = Math.max(18, speed - (isNight ? 12 : 25));
    }

    // Determine flow level & Google Maps compliant color
    let flowLevel: 'smooth' | 'moderate' | 'slow' | 'congested' = 'smooth';
    let colorHex = '#0f9d58'; // Google Maps Green

    if (speed < 25) {
      flowLevel = 'congested';
      colorHex = '#d93025'; // Red
    } else if (speed < 45) {
      flowLevel = 'slow';
      colorHex = '#ff7043'; // Orange
    } else if (speed < 65) {
      flowLevel = 'moderate';
      colorHex = '#ffa000'; // Amber
    } else {
      flowLevel = 'smooth';
      colorHex = '#0f9d58'; // Green
    }

    const travelTimeMin = Math.max(
      s.typicalTimeMin,
      Math.round(s.typicalTimeMin * (80 / Math.max(20, speed)))
    );

    return {
      id: s.id,
      name: s.name,
      code: s.code,
      direction: s.direction,
      fromLocation: s.fromLocation,
      toLocation: s.toLocation,
      speedKmh: speed,
      flowLevel,
      colorHex,
      coordinates: s.coordinates,
      travelTimeMin,
      typicalTimeMin: s.typicalTimeMin,
      incidentsCount: segmentIncidents.length,
    };
  });
}

export const EXPRESSWAY_SEGMENTS: ExpresswayTrafficSegment[] = getDynamicExpresswaySegments([]);

/**
 * Returns dynamic realistic incidents calibrated to current SGT time
 */
export function getDynamicIncidents(currentTime?: Date): TrafficIncident[] {
  const sgt = currentTime || getSingaporeTime();
  const hour = sgt.getHours();
  const minute = sgt.getMinutes();
  const timeVal = hour + minute / 60;
  const isNight = timeVal >= 22.5 || timeVal < 6.0;

  const pad = (n: number) => n.toString().padStart(2, '0');
  const timeStr = `${pad(hour)}:${pad(minute)} SGT`;

  if (isNight) {
    // Midnight to Dawn incidents: Scheduled night road maintenance / roadworks, free-flowing traffic
    return [
      {
        id: 'inc-night-1',
        type: 'roadworks',
        title: 'PIE (Towards Changi)',
        expressway: 'PIE',
        location: 'PIE after Adam Rd Flyover',
        description: 'Scheduled nocturnal resurfacing roadworks on PIE (towards Changi). Extreme left lane closed. Traffic flow remains smooth.',
        timestamp: sgt.toISOString(),
        timeFormatted: timeStr,
        severity: 'minor',
        tags: ['PIE', 'SCHEDULED ROADWORKS', 'LANE 1 CLOSED'],
        lat: 1.3325,
        lng: 103.8185,
        latPercent: 30,
        lngPercent: 45,
        laneClosure: 'Lane 1 closed for maintenance',
        estClearance: 'Until 05:30 SGT',
        trafficCamUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80',
        speedKmh: 78,
      },
      {
        id: 'inc-night-2',
        type: 'roadworks',
        title: 'AYE (Towards Tuas)',
        expressway: 'AYE',
        location: 'AYE near Clementi Ave 6 Exit',
        description: 'Scheduled maintenance work on AYE (towards Tuas). Right shoulder cordoned off. All main lanes open and clear.',
        timestamp: sgt.toISOString(),
        timeFormatted: timeStr,
        severity: 'minor',
        tags: ['AYE', 'NIGHT MAINTENANCE'],
        lat: 1.3125,
        lng: 103.7580,
        latPercent: 54,
        lngPercent: 52,
        laneClosure: 'Shoulder only',
        estClearance: 'Until 05:00 SGT',
        trafficCamUrl: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=600&q=80',
        speedKmh: 84,
      },
    ];
  }

  // Daytime / Peak Incidents
  return [
    {
      id: 'inc-1',
      type: 'accident',
      title: 'PIE (Towards Changi)',
      expressway: 'PIE',
      location: 'PIE after Adam Rd',
      description: 'Accident on PIE (towards Changi Airport) after Adam Rd. Avoid lane 1 and 2. Heavy traffic expected.',
      timestamp: sgt.toISOString(),
      timeFormatted: timeStr,
      severity: 'critical',
      tags: ['PIE', 'LANE 1, 2 CLOSED'],
      lat: 1.3325,
      lng: 103.8185,
      latPercent: 30,
      lngPercent: 45,
      laneClosure: 'Lanes 1 & 2 closed',
      estClearance: '35 mins',
      trafficCamUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80',
      speedKmh: 28,
    },
    {
      id: 'inc-2',
      type: 'roadworks',
      title: 'AYE (Towards Tuas)',
      expressway: 'AYE',
      location: 'AYE at Clementi Ave 6 Exit',
      description: 'Roadworks on AYE (towards Tuas) at Clementi Ave 6 Exit. Lane 3 closed.',
      timestamp: sgt.toISOString(),
      timeFormatted: timeStr,
      severity: 'moderate',
      tags: ['AYE', 'LANE 3 CLOSED'],
      lat: 1.3125,
      lng: 103.7580,
      latPercent: 54,
      lngPercent: 52,
      laneClosure: 'Lane 3 closed',
      estClearance: '1 hr 20 mins',
      trafficCamUrl: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=600&q=80',
      speedKmh: 45,
    },
    {
      id: 'inc-3',
      type: 'congestion',
      title: 'CTE (Towards City)',
      expressway: 'CTE',
      location: 'CTE from Braddell Rd to Moulmein Rd Exit',
      description: 'Heavy traffic on CTE (towards City) from Braddell Rd to Moulmein Rd Exit.',
      timestamp: sgt.toISOString(),
      timeFormatted: timeStr,
      severity: 'minor',
      tags: ['CTE', 'SLOW TRAFFIC'],
      lat: 1.3280,
      lng: 103.8540,
      latPercent: 42,
      lngPercent: 54,
      laneClosure: 'All lanes open',
      estClearance: '20 mins',
      trafficCamUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80',
      speedKmh: 26,
    },
    {
      id: 'inc-4',
      type: 'breakdown',
      title: 'KPE (Towards TPE)',
      expressway: 'KPE',
      location: 'KPE tunnel before Airport Rd Exit',
      description: 'Vehicle breakdown on KPE (towards TPE) before Airport Rd Exit. Right shoulder blocked.',
      timestamp: sgt.toISOString(),
      timeFormatted: timeStr,
      severity: 'moderate',
      tags: ['KPE', 'SHOULDER BLOCKED'],
      lat: 1.3450,
      lng: 103.8900,
      latPercent: 36,
      lngPercent: 62,
      laneClosure: 'Right shoulder obstructed',
      estClearance: '15 mins',
      speedKmh: 52,
    },
    {
      id: 'inc-5',
      type: 'accident',
      title: 'BKE (Towards Woodlands)',
      expressway: 'BKE',
      location: 'BKE after Mandai Rd Exit',
      description: 'Minor collision on BKE (towards Woodlands Checkpoint) after Mandai Rd. Center lane affected.',
      timestamp: sgt.toISOString(),
      timeFormatted: timeStr,
      severity: 'moderate',
      tags: ['BKE', 'LANE 2 BLOCKED'],
      lat: 1.4120,
      lng: 103.7720,
      latPercent: 20,
      lngPercent: 40,
      laneClosure: 'Center lane affected',
      estClearance: '25 mins',
      speedKmh: 38,
    },
  ];
}

export const INITIAL_INCIDENTS: TrafficIncident[] = getDynamicIncidents();

export const MRT_LINES: MRTLineStatus[] = [
  {
    id: 'nsl',
    code: 'NS',
    name: 'North-South Line',
    colorHex: '#d42e12',
    status: 'normal',
    statusTitle: 'Normal Service',
    statusText: 'Normal Train Service',
    description: 'Trains operating at 2-3 min peak frequency between Jurong East and Marina South Pier.',
    operatingHours: '05:30 - 00:30',
    peakFrequency: '2-3 mins',
    offPeakFrequency: '4-5 mins',
    firstTrain: '05:16 AM',
    lastTrain: '00:30 AM',
    frequencyMin: 2.5,
    stationsCount: 27,
    affectedStations: [],
    interchanges: ['Jurong East (EW24)', 'Bishan (CC15)', 'Dhoby Ghaut (NE6/CC1)', 'City Hall (EW13)', 'Raffles Place (EW14)'],
    stations: [
      { code: 'NS1', name: 'Jurong East', isInterchange: true },
      { code: 'NS2', name: 'Bukit Batok' },
      { code: 'NS3', name: 'Bukit Gombak' },
      { code: 'NS4', name: 'Choa Chu Kang', isInterchange: true },
      { code: 'NS5', name: 'Yew Tee' },
      { code: 'NS7', name: 'Kranji' },
      { code: 'NS8', name: 'Marsiling' },
      { code: 'NS9', name: 'Woodlands', isInterchange: true },
      { code: 'NS10', name: 'Admiralty' },
      { code: 'NS11', name: 'Sembawang' },
      { code: 'NS12', name: 'Canberra' },
      { code: 'NS13', name: 'Yishun' },
      { code: 'NS14', name: 'Khatib' },
      { code: 'NS15', name: 'Yio Chu Kang' },
      { code: 'NS16', name: 'Ang Mo Kio' },
      { code: 'NS17', name: 'Bishan', isInterchange: true },
      { code: 'NS18', name: 'Braddell' },
      { code: 'NS19', name: 'Toa Payoh' },
      { code: 'NS20', name: 'Novena' },
      { code: 'NS21', name: 'Newton', isInterchange: true },
      { code: 'NS22', name: 'Orchard', isInterchange: true },
      { code: 'NS23', name: 'Somerset' },
      { code: 'NS24', name: 'Dhoby Ghaut', isInterchange: true },
      { code: 'NS25', name: 'City Hall', isInterchange: true },
      { code: 'NS26', name: 'Raffles Place', isInterchange: true },
      { code: 'NS27', name: 'Marina Bay', isInterchange: true },
      { code: 'NS28', name: 'Marina South Pier' },
    ],
    delayDurationMin: 0,
  },
  {
    id: 'ewl',
    code: 'EW',
    name: 'East-West Line',
    colorHex: '#009640',
    status: 'normal',
    statusTitle: 'Normal Service',
    statusText: 'Normal Train Service',
    description: 'Regular intervals along entire 57km route from Pasir Ris / Changi Airport to Tuas Link.',
    operatingHours: '05:30 - 00:30',
    peakFrequency: '2-3 mins',
    offPeakFrequency: '4-5 mins',
    firstTrain: '05:28 AM',
    lastTrain: '00:23 AM',
    frequencyMin: 2.5,
    stationsCount: 35,
    affectedStations: [],
    interchanges: ['Pasir Ris (CR5)', 'Tampines (DT32)', 'Paya Lebar (CC9)', 'City Hall (NS25)', 'Raffles Place (NS26)', 'Outram Park (NE3/TE17)', 'Buona Vista (CC22)', 'Jurong East (NS1)'],
    stations: [
      { code: 'EW1', name: 'Pasir Ris', isInterchange: true },
      { code: 'EW2', name: 'Tampines', isInterchange: true },
      { code: 'EW3', name: 'Simei' },
      { code: 'EW4', name: 'Tanah Merah', isInterchange: true },
      { code: 'EW5', name: 'Bedok' },
      { code: 'EW6', name: 'Kembangan' },
      { code: 'EW7', name: 'Eunos' },
      { code: 'EW8', name: 'Paya Lebar', isInterchange: true },
      { code: 'EW9', name: 'Aljunied' },
      { code: 'EW10', name: 'Kallang' },
      { code: 'EW11', name: 'Lavender' },
      { code: 'EW12', name: 'Bugis', isInterchange: true },
      { code: 'EW13', name: 'City Hall', isInterchange: true },
      { code: 'EW14', name: 'Raffles Place', isInterchange: true },
      { code: 'EW15', name: 'Tanjong Pagar' },
      { code: 'EW16', name: 'Outram Park', isInterchange: true },
      { code: 'EW17', name: 'Tiong Bahru' },
      { code: 'EW18', name: 'Redhill' },
      { code: 'EW19', name: 'Queenstown' },
      { code: 'EW20', name: 'Commonwealth' },
      { code: 'EW21', name: 'Buona Vista', isInterchange: true },
      { code: 'EW22', name: 'Dover' },
      { code: 'EW23', name: 'Clementi' },
      { code: 'EW24', name: 'Jurong East', isInterchange: true },
      { code: 'EW25', name: 'Chinese Garden' },
      { code: 'EW26', name: 'Lakeside' },
      { code: 'EW27', name: 'Boon Lay' },
      { code: 'EW28', name: 'Pioneer' },
      { code: 'EW29', name: 'Joo Koon' },
      { code: 'EW30', name: 'Gul Circle' },
      { code: 'EW31', name: 'Tuas Crescent' },
      { code: 'EW32', name: 'Tuas West Road' },
      { code: 'EW33', name: 'Tuas Link' },
      { code: 'CG1', name: 'Expo', isInterchange: true },
      { code: 'CG2', name: 'Changi Airport ✈' },
    ],
    delayDurationMin: 0,
  },
  {
    id: 'nel',
    code: 'NE',
    name: 'North East Line',
    colorHex: '#9900aa',
    status: 'normal',
    statusTitle: 'Normal Service',
    statusText: 'Normal Train Service',
    description: 'Standard driverless operation from Punggol Coast to HarbourFront.',
    operatingHours: '05:45 - 00:15',
    peakFrequency: '2.5-3 mins',
    offPeakFrequency: '4-5 mins',
    firstTrain: '05:30 AM',
    lastTrain: '00:15 AM',
    frequencyMin: 3.0,
    stationsCount: 17,
    affectedStations: [],
    interchanges: ['HarbourFront (CC29)', 'Outram Park (EW16/TE17)', 'Chinatown (DT19)', 'Dhoby Ghaut (NS24/CC1)', 'Little India (DT12)', 'Serangoon (CC13)'],
    stations: [
      { code: 'NE1', name: 'HarbourFront', isInterchange: true },
      { code: 'NE3', name: 'Outram Park', isInterchange: true },
      { code: 'NE4', name: 'Chinatown', isInterchange: true },
      { code: 'NE5', name: 'Clarke Quay' },
      { code: 'NE6', name: 'Dhoby Ghaut', isInterchange: true },
      { code: 'NE7', name: 'Little India', isInterchange: true },
      { code: 'NE8', name: 'Farrer Park' },
      { code: 'NE9', name: 'Boon Keng' },
      { code: 'NE10', name: 'Potong Pasir' },
      { code: 'NE11', name: 'Woodleigh' },
      { code: 'NE12', name: 'Serangoon', isInterchange: true },
      { code: 'NE13', name: 'Kovan' },
      { code: 'NE14', name: 'Hougang' },
      { code: 'NE15', name: 'Buangkok' },
      { code: 'NE16', name: 'Sengkang', isInterchange: true },
      { code: 'NE17', name: 'Punggol', isInterchange: true },
      { code: 'NE18', name: 'Punggol Coast' },
    ],
    delayDurationMin: 0,
  },
  {
    id: 'ccl',
    code: 'CC',
    name: 'Circle Line',
    colorHex: '#fa9e0d',
    status: 'normal',
    statusTitle: 'Normal Service',
    statusText: 'Normal Train Service',
    description: 'Fully automated orbital rail connecting North, East, South, and Central sectors.',
    operatingHours: '05:30 - 00:00',
    peakFrequency: '3.5-4 mins',
    offPeakFrequency: '5-6 mins',
    firstTrain: '05:25 AM',
    lastTrain: '00:00 AM',
    frequencyMin: 3.5,
    stationsCount: 30,
    affectedStations: [],
    interchanges: ['Dhoby Ghaut (NS24/NE6)', 'Paya Lebar (EW8)', 'Serangoon (NE12)', 'Bishan (NS17)', 'Botanic Gardens (DT9)', 'Buona Vista (EW21)', 'HarbourFront (NE1)'],
    stations: [
      { code: 'CC1', name: 'Dhoby Ghaut', isInterchange: true },
      { code: 'CC2', name: 'Bras Basah' },
      { code: 'CC3', name: 'Esplanade' },
      { code: 'CC4', name: 'Promenade', isInterchange: true },
      { code: 'CC5', name: 'Nicoll Highway' },
      { code: 'CC6', name: 'Stadium' },
      { code: 'CC7', name: 'Mountbatten' },
      { code: 'CC8', name: 'Dakota' },
      { code: 'CC9', name: 'Paya Lebar', isInterchange: true },
      { code: 'CC10', name: 'MacPherson', isInterchange: true },
      { code: 'CC11', name: 'Tai Seng' },
      { code: 'CC12', name: 'Bartley' },
      { code: 'CC13', name: 'Serangoon', isInterchange: true },
      { code: 'CC14', name: 'Lorong Chuan' },
      { code: 'CC15', name: 'Bishan', isInterchange: true },
      { code: 'CC16', name: 'Marymount' },
      { code: 'CC17', name: 'Caldecott', isInterchange: true },
      { code: 'CC19', name: 'Botanic Gardens', isInterchange: true },
      { code: 'CC20', name: 'Farrer Road' },
      { code: 'CC21', name: 'Holland Village' },
      { code: 'CC22', name: 'Buona Vista', isInterchange: true },
      { code: 'CC23', name: 'one-north' },
      { code: 'CC24', name: 'Kent Ridge' },
      { code: 'CC25', name: 'Haw Par Villa' },
      { code: 'CC26', name: 'Pasir Panjang' },
      { code: 'CC27', name: 'Labrador Park' },
      { code: 'CC28', name: 'Telok Blangah' },
      { code: 'CC29', name: 'HarbourFront', isInterchange: true },
      { code: 'CE1', name: 'Bayfront', isInterchange: true },
      { code: 'CE2', name: 'Marina Bay', isInterchange: true },
    ],
    delayDurationMin: 0,
  },
  {
    id: 'dtl',
    code: 'DT',
    name: 'Downtown Line',
    colorHex: '#005ec4',
    status: 'normal',
    statusTitle: 'Normal Service',
    statusText: 'Normal Train Service',
    description: 'High reliability automated service between Bukit Panjang and Expo.',
    operatingHours: '05:30 - 00:30',
    peakFrequency: '2.5-3 mins',
    offPeakFrequency: '4-5 mins',
    firstTrain: '05:30 AM',
    lastTrain: '00:30 AM',
    frequencyMin: 3.0,
    stationsCount: 34,
    affectedStations: [],
    interchanges: ['Bukit Panjang (BP6)', 'Botanic Gardens (CC19)', 'Newton (NS21)', 'Little India (NE7)', 'Bugis (EW12)', 'Promenade (CC4)', 'Bayfront (CE1)', 'Chinatown (NE4)', 'MacPherson (CC10)', 'Tampines (EW2)', 'Expo (CG1)'],
    stations: [
      { code: 'DT1', name: 'Bukit Panjang', isInterchange: true },
      { code: 'DT2', name: 'Cashew' },
      { code: 'DT3', name: 'Hillview' },
      { code: 'DT5', name: 'Beauty World' },
      { code: 'DT6', name: 'King Albert Park' },
      { code: 'DT7', name: 'Sixth Avenue' },
      { code: 'DT8', name: 'Tan Kah Kee' },
      { code: 'DT9', name: 'Botanic Gardens', isInterchange: true },
      { code: 'DT10', name: 'Stevens', isInterchange: true },
      { code: 'DT11', name: 'Newton', isInterchange: true },
      { code: 'DT12', name: 'Little India', isInterchange: true },
      { code: 'DT13', name: 'Rochor' },
      { code: 'DT14', name: 'Bugis', isInterchange: true },
      { code: 'DT15', name: 'Promenade', isInterchange: true },
      { code: 'DT16', name: 'Bayfront', isInterchange: true },
      { code: 'DT17', name: 'Downtown' },
      { code: 'DT18', name: 'Telok Ayer' },
      { code: 'DT19', name: 'Chinatown', isInterchange: true },
      { code: 'DT20', name: 'Fort Canning' },
      { code: 'DT21', name: 'Bencoolen' },
      { code: 'DT22', name: 'Jalan Besar' },
      { code: 'DT23', name: 'Bendemeer' },
      { code: 'DT24', name: 'Geylang Bahru' },
      { code: 'DT25', name: 'Mattar' },
      { code: 'DT26', name: 'MacPherson', isInterchange: true },
      { code: 'DT27', name: 'Ubi' },
      { code: 'DT28', name: 'Kaki Bukit' },
      { code: 'DT29', name: 'Bedok North' },
      { code: 'DT30', name: 'Bedok Reservoir' },
      { code: 'DT31', name: 'Tampines West' },
      { code: 'DT32', name: 'Tampines', isInterchange: true },
      { code: 'DT33', name: 'Tampines East' },
      { code: 'DT34', name: 'Upper Changi' },
      { code: 'DT35', name: 'Expo', isInterchange: true },
    ],
    delayDurationMin: 0,
  },
  {
    id: 'tel',
    code: 'TE',
    name: 'Thomson-East Coast Line',
    colorHex: '#9D5B25',
    status: 'normal',
    statusTitle: 'Normal Service',
    statusText: 'Normal Train Service',
    description: 'Full Stage 4 passenger operations from Woodlands North to Bayshore.',
    operatingHours: '05:30 - 00:00',
    peakFrequency: '3-3.5 mins',
    offPeakFrequency: '5-6 mins',
    firstTrain: '05:35 AM',
    lastTrain: '00:00 AM',
    frequencyMin: 3.5,
    stationsCount: 27,
    affectedStations: [],
    interchanges: ['Woodlands (NS9)', 'Caldecott (CC17)', 'Stevens (DT10)', 'Orchard (NS22)', 'Outram Park (EW16/NE3)', 'Marina Bay (NS27/CE2)'],
    stations: [
      { code: 'TE1', name: 'Woodlands North' },
      { code: 'TE2', name: 'Woodlands', isInterchange: true },
      { code: 'TE3', name: 'Woodlands South' },
      { code: 'TE4', name: 'Springleaf' },
      { code: 'TE5', name: 'Lentor' },
      { code: 'TE6', name: 'Mayflower' },
      { code: 'TE7', name: 'Bright Hill' },
      { code: 'TE8', name: 'Upper Thomson' },
      { code: 'TE9', name: 'Caldecott', isInterchange: true },
      { code: 'TE11', name: 'Stevens', isInterchange: true },
      { code: 'TE12', name: 'Napier' },
      { code: 'TE13', name: 'Orchard Boulevard' },
      { code: 'TE14', name: 'Orchard', isInterchange: true },
      { code: 'TE15', name: 'Great World' },
      { code: 'TE16', name: 'Havelock' },
      { code: 'TE17', name: 'Outram Park', isInterchange: true },
      { code: 'TE18', name: 'Maxwell' },
      { code: 'TE19', name: 'Shenton Way' },
      { code: 'TE20', name: 'Marina Bay', isInterchange: true },
      { code: 'TE22', name: 'Gardens by the Bay' },
      { code: 'TE23', name: 'Tanjong Rhu' },
      { code: 'TE24', name: 'Katong Park' },
      { code: 'TE25', name: 'Tanjong Katong' },
      { code: 'TE26', name: 'Marine Parade' },
      { code: 'TE27', name: 'Marine Terrace' },
      { code: 'TE28', name: 'Siglap' },
      { code: 'TE29', name: 'Bayshore' },
    ],
    delayDurationMin: 0,
  },
];

export const SERVICE_ADVISORIES: ServiceAdvisory[] = [
  {
    id: 'adv-1',
    lineCode: 'CC',
    lineName: 'Circle Line',
    title: 'Circle Line Track Maintenance Advisory',
    description: 'Minor signaling adjustments between Botanic Gardens (CC19) and Buona Vista (CC22). SMRT engineering crew on site. Please cater up to 8 minutes extra travel time.',
    timestamp: '14:35 SGT',
    isMajor: false,
    affectedSegments: 'Botanic Gardens (CC19) ↔ Buona Vista (CC22)',
    actionAdvice: 'Commuters traveling towards one-north or Kent Ridge may also consider East-West Line via Buona Vista or Downtown Line via Botanic Gardens.',
  },
];

export const TRAFFIC_CAMERAS: TrafficCamera[] = [
  {
    id: 'cam-pie-adam',
    cameraId: '1701',
    name: 'PIE (Towards Changi Airport) - Adam Rd Flyover',
    expressway: 'PIE',
    imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80',
    lat: 1.3325,
    lng: 103.8185,
    isOnline: true,
    direction: 'towards_changi',
    locationNote: 'Approaching Adam Road Flyover, Lanes 1 & 2 closed due to incident',
  },
  {
    id: 'cam-cte-braddell',
    cameraId: '2703',
    name: 'CTE (Towards City) - Braddell Rd Flyover',
    expressway: 'CTE',
    imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80',
    lat: 1.3280,
    lng: 103.8540,
    isOnline: true,
    direction: 'towards_city',
    locationNote: 'Central Expressway southbound traffic stream',
  },
  {
    id: 'cam-aye-clementi',
    cameraId: '3705',
    name: 'AYE (Towards Tuas) - Clementi Ave 6 Exit',
    expressway: 'AYE',
    imageUrl: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=600&q=80',
    lat: 1.3125,
    lng: 103.7580,
    isOnline: true,
    direction: 'towards_tuas',
    locationNote: 'Ayer Rajah Expressway westbound near Jurong Town',
  },
  {
    id: 'cam-woodlands-causeway',
    cameraId: '2702',
    name: 'Woodlands Causeway - Bridge Deck towards Johor Bahru',
    expressway: 'Causeway',
    imageUrl: 'https://images.data.gov.sg/api/traffic-images/2026/08/2702.jpg',
    proxyImageUrl: '/api/camera-image-proxy?url=https://images.data.gov.sg/api/traffic-images/2026/08/2702.jpg',
    lat: 1.4510,
    lng: 103.7680,
    isOnline: true,
    direction: 'towards_jb',
    locationNote: 'Causeway checkpoint border crossing towards Malaysia CIQ',
  },
];
