import { CustomsCheckpointData, CheckpointDirectionStatus, TrafficCamera } from '../types';
import { getSingaporeTime } from './transportData';

export const CHECKPOINT_CAMERAS: Record<string, TrafficCamera[]> = {
  woodlands: [
    {
      id: 'cam-2701',
      cameraId: '2701',
      name: 'Woodlands Checkpoint (Towards Johor / CIQ)',
      expressway: 'BKE / Woodlands Causeway',
      imageUrl: 'https://images.data.gov.sg/api/traffic-images/2026/08/2701.jpg',
      proxyImageUrl: '/api/camera-image-proxy?url=https://images.data.gov.sg/api/traffic-images/2026/08/2701.jpg',
      lat: 1.4435,
      lng: 103.7695,
      isOnline: true,
      direction: 'towards_jb',
      locationNote: 'Approaching Singapore Departure Immigration',
    },
    {
      id: 'cam-2702',
      cameraId: '2702',
      name: 'Woodlands Causeway (Bridge Mid-Span Towards Johor)',
      expressway: 'Causeway',
      imageUrl: 'https://images.data.gov.sg/api/traffic-images/2026/08/2702.jpg',
      proxyImageUrl: '/api/camera-image-proxy?url=https://images.data.gov.sg/api/traffic-images/2026/08/2702.jpg',
      lat: 1.4510,
      lng: 103.7680,
      isOnline: true,
      direction: 'towards_jb',
      locationNote: 'Causeway bridge mid-section towards Sultan Iskandar CIQ',
    },
    {
      id: 'cam-4703',
      cameraId: '4703',
      name: 'Woodlands Flyover (Towards Checkpoint Viaduct)',
      expressway: 'BKE',
      imageUrl: 'https://images.data.gov.sg/api/traffic-images/2026/08/4703.jpg',
      proxyImageUrl: '/api/camera-image-proxy?url=https://images.data.gov.sg/api/traffic-images/2026/08/4703.jpg',
      lat: 1.4380,
      lng: 103.7710,
      isOnline: true,
      direction: 'towards_jb',
      locationNote: 'Bukit Timah Expressway feeder into Woodlands',
    },
    {
      id: 'cam-4713',
      cameraId: '4713',
      name: 'BKE Mandai to Woodlands Checkpoint Corridor',
      expressway: 'BKE',
      imageUrl: 'https://images.data.gov.sg/api/traffic-images/2026/08/4713.jpg',
      proxyImageUrl: '/api/camera-image-proxy?url=https://images.data.gov.sg/api/traffic-images/2026/08/4713.jpg',
      lat: 1.4240,
      lng: 103.7730,
      isOnline: true,
      direction: 'towards_sg',
      locationNote: 'Southbound return corridor into Singapore',
    },
  ],
  tuas: [
    {
      id: 'cam-4708',
      cameraId: '4708',
      name: 'Tuas Checkpoint (Towards Malaysia / Tanjung Kupang)',
      expressway: 'AYE / Second Link',
      imageUrl: 'https://images.data.gov.sg/api/traffic-images/2026/08/4708.jpg',
      proxyImageUrl: '/api/camera-image-proxy?url=https://images.data.gov.sg/api/traffic-images/2026/08/4708.jpg',
      lat: 1.3485,
      lng: 103.6360,
      isOnline: true,
      direction: 'towards_jb',
      locationNote: 'Singapore departure plaza towards Sultan Abu Bakar CIQ',
    },
    {
      id: 'cam-4712',
      cameraId: '4712',
      name: 'Tuas Second Link (Bridge Deck Towards Johor)',
      expressway: 'Tuas Second Link',
      imageUrl: 'https://images.data.gov.sg/api/traffic-images/2026/08/4712.jpg',
      proxyImageUrl: '/api/camera-image-proxy?url=https://images.data.gov.sg/api/traffic-images/2026/08/4712.jpg',
      lat: 1.3540,
      lng: 103.6280,
      isOnline: true,
      direction: 'towards_jb',
      locationNote: 'Second Link Bridge mid-point',
    },
    {
      id: 'cam-4707',
      cameraId: '4707',
      name: 'AYE Approach to Tuas Checkpoint Viaduct',
      expressway: 'AYE',
      imageUrl: 'https://images.data.gov.sg/api/traffic-images/2026/08/4707.jpg',
      proxyImageUrl: '/api/camera-image-proxy?url=https://images.data.gov.sg/api/traffic-images/2026/08/4707.jpg',
      lat: 1.3380,
      lng: 103.6420,
      isOnline: true,
      direction: 'towards_jb',
      locationNote: 'Ayer Rajah Expressway feeder into Tuas',
    },
  ],
};

export function getDynamicCustomsCheckpoints(currentTime?: Date): CustomsCheckpointData[] {
  const sgt = currentTime || getSingaporeTime();
  const hour = sgt.getHours();
  const minute = sgt.getMinutes();
  const timeVal = hour + minute / 60;

  // Time profiles for border crossing:
  // 1. Midnight to early morning (23:00 - 05:30): Free flow, 15-18 mins, minimal queue (0.1 km)
  // 2. Morning peak (06:00 - 09:30): Inflow to Singapore (JB -> SG) is heavy (50-80 mins), SG -> JB is smooth (20 mins)
  // 3. Midday (10:00 - 16:00): Normal steady flow (25-35 mins)
  // 4. Evening rush (17:00 - 21:30): Outflow to JB (SG -> JB) is heavy (65-95 mins), JB -> SG is moderate (30-40 mins)
  // 5. Late evening (21:30 - 23:00): Fast recovery (20-25 mins)

  const isNight = timeVal >= 23.0 || timeVal < 5.5;
  const isMorningPeak = timeVal >= 6.0 && timeVal <= 9.5;
  const isEveningPeak = timeVal >= 17.0 && timeVal <= 21.5;

  let woodlandsSGtoJB: CheckpointDirectionStatus = {
    travelTimeMin: 32,
    baselineTimeMin: 18,
    delayMinutes: 14,
    status: 'moderate',
    statusText: 'Steady Cross-Border Flow',
    speedKmh: 38,
    queueLengthKm: 1.1,
    carLanesOpen: 14,
    motorcycleLanesOpen: 22,
  };

  let woodlandsJBtoSG: CheckpointDirectionStatus = {
    travelTimeMin: 30,
    baselineTimeMin: 18,
    delayMinutes: 12,
    status: 'moderate',
    statusText: 'Standard Clearance',
    speedKmh: 42,
    queueLengthKm: 0.9,
    carLanesOpen: 12,
    motorcycleLanesOpen: 20,
  };

  let tuasSGtoJB: CheckpointDirectionStatus = {
    travelTimeMin: 26,
    baselineTimeMin: 15,
    delayMinutes: 11,
    status: 'smooth',
    statusText: 'Smooth Clearance',
    speedKmh: 68,
    queueLengthKm: 0.4,
    carLanesOpen: 10,
    motorcycleLanesOpen: 16,
  };

  let tuasJBtoSG: CheckpointDirectionStatus = {
    travelTimeMin: 24,
    baselineTimeMin: 15,
    delayMinutes: 9,
    status: 'smooth',
    statusText: 'Smooth Clearance',
    speedKmh: 72,
    queueLengthKm: 0.3,
    carLanesOpen: 10,
    motorcycleLanesOpen: 16,
  };

  if (isNight) {
    // Midnight Free Flow
    woodlandsSGtoJB = {
      travelTimeMin: 18,
      baselineTimeMin: 18,
      delayMinutes: 0,
      status: 'smooth',
      statusText: 'Free Flow (No Queue)',
      speedKmh: 75,
      queueLengthKm: 0.1,
      carLanesOpen: 14,
      motorcycleLanesOpen: 24,
    };
    woodlandsJBtoSG = {
      travelTimeMin: 18,
      baselineTimeMin: 18,
      delayMinutes: 0,
      status: 'smooth',
      statusText: 'Free Flow (No Queue)',
      speedKmh: 78,
      queueLengthKm: 0.1,
      carLanesOpen: 14,
      motorcycleLanesOpen: 24,
    };
    tuasSGtoJB = {
      travelTimeMin: 15,
      baselineTimeMin: 15,
      delayMinutes: 0,
      status: 'smooth',
      statusText: 'Free Flow (No Queue)',
      speedKmh: 85,
      queueLengthKm: 0.0,
      carLanesOpen: 12,
      motorcycleLanesOpen: 18,
    };
    tuasJBtoSG = {
      travelTimeMin: 15,
      baselineTimeMin: 15,
      delayMinutes: 0,
      status: 'smooth',
      statusText: 'Free Flow (No Queue)',
      speedKmh: 88,
      queueLengthKm: 0.0,
      carLanesOpen: 12,
      motorcycleLanesOpen: 18,
    };
  } else if (isMorningPeak) {
    // Inflow from JB to SG is peak rush
    woodlandsJBtoSG = {
      travelTimeMin: 75,
      baselineTimeMin: 18,
      delayMinutes: 57,
      status: 'congested',
      statusText: 'Heavy Inbound Commuter Peak (Queue to Johor CIQ)',
      speedKmh: 14,
      queueLengthKm: 3.2,
      carLanesOpen: 16,
      motorcycleLanesOpen: 28,
    };
    woodlandsSGtoJB = {
      travelTimeMin: 22,
      baselineTimeMin: 18,
      delayMinutes: 4,
      status: 'smooth',
      statusText: 'Smooth Clearance Outbound',
      speedKmh: 55,
      queueLengthKm: 0.4,
      carLanesOpen: 12,
      motorcycleLanesOpen: 18,
    };
    tuasJBtoSG = {
      travelTimeMin: 48,
      baselineTimeMin: 15,
      delayMinutes: 33,
      status: 'moderate',
      statusText: 'Moderate Inflow Traffic',
      speedKmh: 35,
      queueLengthKm: 1.5,
      carLanesOpen: 12,
      motorcycleLanesOpen: 20,
    };
  } else if (isEveningPeak) {
    // Outflow from SG to JB is peak rush
    woodlandsSGtoJB = {
      travelTimeMin: 85,
      baselineTimeMin: 18,
      delayMinutes: 67,
      status: 'congested',
      statusText: 'Heavy Evening Exodus (Queue onto BKE Viaduct)',
      speedKmh: 12,
      queueLengthKm: 3.8,
      carLanesOpen: 16,
      motorcycleLanesOpen: 28,
    };
    woodlandsJBtoSG = {
      travelTimeMin: 32,
      baselineTimeMin: 18,
      delayMinutes: 14,
      status: 'moderate',
      statusText: 'Moderate Return Flow',
      speedKmh: 42,
      queueLengthKm: 1.0,
      carLanesOpen: 12,
      motorcycleLanesOpen: 18,
    };
    tuasSGtoJB = {
      travelTimeMin: 55,
      baselineTimeMin: 15,
      delayMinutes: 40,
      status: 'moderate',
      statusText: 'Busy Departure Rush',
      speedKmh: 32,
      queueLengthKm: 1.8,
      carLanesOpen: 12,
      motorcycleLanesOpen: 20,
    };
  }

  return [
    {
      id: 'woodlands',
      name: 'Woodlands Causeway',
      alias: 'Johor-Singapore Causeway (First Link)',
      approachRoad: 'Bukit Timah Expressway (BKE) ➔ Woodlands Checkpoint',
      malaysiaCheckpoint: 'Bangunan Sultan Iskandar (BSI) CIQ, Johor Bahru',
      coordinates: { lat: 1.4480, lng: 103.7685 },
      singaporeToJB: woodlandsSGtoJB,
      jbToSingapore: woodlandsJBtoSG,
      qrClearanceActive: true,
      eGatesStatus: 'Active & Operational (MyICA QR Code & MyNIISe QR Trial)',
      lastUpdated: 'LIVE SGT',
      bestTimeToCross: 'Before 15:30 or After 21:30 (SGT)',
      cameras: CHECKPOINT_CAMERAS.woodlands,
      hourlyWaitForecast: [
        { hour: '00:00', toJBMin: 18, toSGMin: 18, isPeak: false },
        { hour: '02:00', toJBMin: 15, toSGMin: 15, isPeak: false },
        { hour: '04:00', toJBMin: 16, toSGMin: 22, isPeak: false },
        { hour: '06:00', toJBMin: 22, toSGMin: 55, isPeak: true },
        { hour: '08:00', toJBMin: 30, toSGMin: 85, isPeak: true },
        { hour: '10:00', toJBMin: 32, toSGMin: 38, isPeak: false },
        { hour: '12:00', toJBMin: 35, toSGMin: 30, isPeak: false },
        { hour: '14:00', toJBMin: 38, toSGMin: 28, isPeak: false },
        { hour: '16:00', toJBMin: 55, toSGMin: 35, isPeak: true },
        { hour: '18:00', toJBMin: 95, toSGMin: 40, isPeak: true },
        { hour: '20:00', toJBMin: 70, toSGMin: 45, isPeak: true },
        { hour: '22:00', toJBMin: 30, toSGMin: 25, isPeak: false },
      ],
      advisories: [
        'Singapore Citizens, PRs and Long-Term Pass holders can clear immigration using the MyICA QR code system at both car and bus lanes.',
        'Heavy Friday evening exodus to Johor Bahru expected between 16:00 and 22:00.',
        'All Singapore-registered vehicles must maintain at least 3/4 fuel tank capacity prior to border exit.',
      ],
    },
    {
      id: 'tuas',
      name: 'Tuas Second Link',
      alias: 'Linkedua Malaysia-Singapore Second Crossing',
      approachRoad: 'Ayer Rajah Expressway (AYE) ➔ Tuas Checkpoint',
      malaysiaCheckpoint: 'Kompleks Sultan Abu Bakar (KSAB) CIQ, Tanjung Kupang',
      coordinates: { lat: 1.3485, lng: 103.6360 },
      singaporeToJB: tuasSGtoJB,
      jbToSingapore: tuasJBtoSG,
      qrClearanceActive: true,
      eGatesStatus: 'Active & Operational (QR Code Lanes Available)',
      lastUpdated: 'LIVE SGT',
      bestTimeToCross: 'Anytime except 17:30 - 20:30 (SGT)',
      cameras: CHECKPOINT_CAMERAS.tuas,
      hourlyWaitForecast: [
        { hour: '00:00', toJBMin: 15, toSGMin: 15, isPeak: false },
        { hour: '02:00', toJBMin: 14, toSGMin: 14, isPeak: false },
        { hour: '04:00', toJBMin: 14, toSGMin: 18, isPeak: false },
        { hour: '06:00', toJBMin: 18, toSGMin: 42, isPeak: true },
        { hour: '08:00', toJBMin: 24, toSGMin: 58, isPeak: true },
        { hour: '10:00', toJBMin: 25, toSGMin: 28, isPeak: false },
        { hour: '12:00', toJBMin: 26, toSGMin: 25, isPeak: false },
        { hour: '14:00', toJBMin: 28, toSGMin: 24, isPeak: false },
        { hour: '16:00', toJBMin: 38, toSGMin: 26, isPeak: false },
        { hour: '18:00', toJBMin: 65, toSGMin: 32, isPeak: true },
        { hour: '20:00', toJBMin: 45, toSGMin: 30, isPeak: false },
        { hour: '22:00', toJBMin: 22, toSGMin: 18, isPeak: false },
      ],
      advisories: [
        'Tuas Second Link offers wider expressway lanes and typically shorter queue times compared to Woodlands Causeway during weekend peaks.',
        'Ensure Malaysia VEP RFID tag is properly installed and Touch n Go eWallet / Card is topped up for Malaysian toll gantries.',
      ],
    },
  ];
}

export const INITIAL_CUSTOMS_CHECKPOINTS: CustomsCheckpointData[] = getDynamicCustomsCheckpoints();
