import React, { createContext, useContext, useState, useEffect } from 'react';

export type LanguageCode = 'en' | 'zh' | 'ms' | 'ja' | 'ko' | 'ta';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeName: 'English', flag: '🇸🇬' },
  { code: 'zh', label: 'Chinese', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'ms', label: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'ja', label: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'ta', label: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
];

export const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  en: {
    // App & Navbar
    appTitle: 'TransportMonitor SG',
    appSubtitle: 'Singapore Transport Telemetry Console',
    searchPlaceholder: 'Search incidents, expressways, MRT lines...',
    liveSgt: 'LIVE SGT',
    dataSourceLta: 'Source: LTA DataMall v2',
    lastIngested: 'Last Ingested',
    liveStreamConnected: 'Live Stream Connected (24ms)',
    refreshData: 'Refresh Data',
    updating: 'Updating...',
    hideSidebar: 'Hide Sidebar',
    showSidebar: 'Show Sidebar',
    language: 'Language',
    
    // Sidebar
    controlCenter: 'Control Center',
    trafficIncidents: 'Traffic Incidents',
    mrtStatus: 'MRT / LRT Status',
    networkMap: 'Network Map',
    liveCctv: 'Traffic Cameras',
    dataMallApi: 'DataMall API',
    allLinesNormal: 'All MRT lines normal',
    delayReported: 'Train delay reported',

    // Map & Layers
    roadSpeeds: 'Road Speeds',
    hazards: 'Hazards',
    cameras: 'Cameras',
    satellite: 'Satellite',
    vectorMap: 'Vector Map',
    mapAlwaysOn: 'Real-time Vector Map Active',
    zoomIn: 'Zoom In',
    zoomOut: 'Zoom Out',
    resetZoom: 'Reset View',
    centerMap: 'Center Map',
    myLocation: 'My Location',
    centerToLocation: 'Center to My Location',
    centerSingapore: 'Center to Singapore',
    locating: 'Locating...',
    locatedSuccess: 'Centered to your location',
    locationUnavailable: 'Location unavailable; centered to Singapore',

    // Right Sidebar Tabs
    liveFeed: 'Live Feed',
    overview: 'Overview',
    selected: 'Selected',
    cctvFeeds: 'Cameras',
    reports: 'Reports',
    all: 'All',
    accidents: 'Accidents',
    roadworks: 'Roadworks',
    congestion: 'Congestion',
    breakdowns: 'Breakdowns',

    // Telemetry & Stats
    networkOverview: 'Network Overview',
    activeIncidents: 'Active Incidents',
    severeCongestion: 'Congestion Zones',
    avgIslandSpeed: 'Avg Island Speed',
    accidentsReported: 'Accidents Reported',
    liveIngestion: 'LIVE INGESTION',

    // Speed Legend
    speedLegendTitle: 'Traffic Condition Speed Legend',
    smoothFlow: 'Smooth Flow',
    moderateVolume: 'Moderate Volume',
    slowMoving: 'Slow Moving',
    heavyCongestion: 'Heavy Congestion',
    expresswaySpeedsSummary: 'Expressway Speeds Summary',
    currentSpeed: 'Current Speed',
    estimatedTravelTime: 'Estimated Travel Time',
    typicalTime: 'Typical',
    from: 'From',
    to: 'To',
    direction: 'Direction',
    sector: 'Sector',
    impact: 'Impact',
    laneStatus: 'Lane Status',
    estClearance: 'Est. Clearance',
    liveCctvFeed: 'Live Traffic Camera (LTA CCTV Feed)',
    viewDetails: 'View Details',
    noIncidentsFound: 'No incidents found in this category',

    // Camera Feed Modal & Panel
    cameraViewerTitle: 'LTA Live Traffic CCTV Camera',
    cameraFeedActive: 'LIVE FEED ACTIVE',
    cameraTimestamp: 'Image Refreshed',
    refreshSnapshot: 'Refresh Snapshot',
    expresswayCorridor: 'Expressway Corridor',
    viewFullFeed: 'Open High-Res Feed',

    // MRT Screen
    networkStatusTitle: 'MRT / LRT Network Status',
    liveUpdate: 'LIVE UPDATE',
    normalService: 'Normal Service',
    serviceDelay: 'Service Delay',
    recentAdvisories: 'Recent Service Advisories',
    stations: 'stations',
    peakFreq: 'Peak',
    offPeakFreq: 'Off-Peak',
    firstTrain: 'First Train',
    lastTrain: 'Last Train',
    bridgingBus: 'Bridging Bus',
    viewLineDetails: 'Line Route & Stations',

    // Footer
    officialDataNotice: 'Official data feed from Land Transport Authority (LTA) Singapore DataMall.',
    systemOperational: 'All Data Feeds Connected',
    apiStatus: 'API Status',
    termsOfService: 'Terms & Licensing',
  },

  zh: {
    // App & Navbar
    appTitle: '新加坡交通实时监控',
    appSubtitle: '新加坡陆路交通管理局实时监控系统',
    searchPlaceholder: '搜索事故、高速公路、地铁线...',
    liveSgt: '新加坡时间 实时',
    dataSourceLta: '数据源: LTA DataMall v2',
    lastIngested: '最后更新',
    liveStreamConnected: '实时数据连接正常 (24ms)',
    refreshData: '刷新数据',
    updating: '更新中...',
    hideSidebar: '隐藏边栏',
    showSidebar: '显示边栏',
    language: '语言选择',

    // Sidebar
    controlCenter: '控制中心',
    trafficIncidents: '实时道路状况',
    mrtStatus: '地铁/轻轨状态',
    networkMap: '交通网络地图',
    liveCctv: '实时路况摄像头',
    dataMallApi: 'DataMall 接口',
    allLinesNormal: '所有地铁线路正常运行',
    delayReported: '检测到地铁延误',

    // Map & Layers
    roadSpeeds: '道路车速',
    hazards: '事故警报',
    cameras: '监控探头',
    satellite: '卫星图',
    vectorMap: '矢量地图',
    mapAlwaysOn: '矢量高清底图持续在线',
    zoomIn: '放大',
    zoomOut: '缩小',
    resetZoom: '重置视角',
    centerMap: '定位与居中',
    myLocation: '我的位置',
    centerToLocation: '定位到当前位置',
    centerSingapore: '居中至新加坡',
    locating: '正在定位...',
    locatedSuccess: '已定位至您的当前位置',
    locationUnavailable: '无法获取位置，已居中至新加坡',

    // Right Sidebar Tabs
    liveFeed: '实时警报',
    overview: '全岛概况',
    selected: '选中详情',
    cctvFeeds: '路况摄像头',
    reports: '条报告',
    all: '全部',
    accidents: '交通事故',
    roadworks: '道路施工',
    congestion: '交通拥堵',
    breakdowns: '车辆故障',

    // Telemetry & Stats
    networkOverview: '全岛路网总览',
    activeIncidents: '当前突发事件',
    severeCongestion: '严重拥堵路段',
    avgIslandSpeed: '全岛平均车速',
    accidentsReported: '已报告事故数',
    liveIngestion: '实时同步中',

    // Speed Legend
    speedLegendTitle: '交通路况车速图例',
    smoothFlow: '畅通无阻',
    moderateVolume: '车流正常',
    slowMoving: '车行缓慢',
    heavyCongestion: '严重拥堵',
    expresswaySpeedsSummary: '主要高速公路实时车速',
    currentSpeed: '当前车速',
    estimatedTravelTime: '预计通行时间',
    typicalTime: '平时耗时',
    from: '起点',
    to: '终点',
    direction: '方向',
    sector: '路段',
    impact: '车道影响',
    laneStatus: '车道状态',
    estClearance: '预计清理时间',
    liveCctvFeed: 'LTA 实时监控摄像头 (CCTV)',
    viewDetails: '查看详情',
    noIncidentsFound: '当前分类暂无突发事件',

    // Camera Feed Modal & Panel
    cameraViewerTitle: 'LTA 实时路况高清摄像头',
    cameraFeedActive: '实时信号在线',
    cameraTimestamp: '快照刷新时间',
    refreshSnapshot: '刷新画面',
    expresswayCorridor: '高速走廊',
    viewFullFeed: '全屏高清查看',

    // MRT Screen
    networkStatusTitle: '地铁与轻轨运行状态',
    liveUpdate: '实时更新',
    normalService: '正常运营',
    serviceDelay: '班次延误',
    recentAdvisories: '最新乘车通告',
    stations: '个车站',
    peakFreq: '高峰间隔',
    offPeakFreq: '平峰间隔',
    firstTrain: '首班车',
    lastTrain: '末班车',
    bridgingBus: '免费接驳巴士',
    viewLineDetails: '查看线路站点与换乘',

    // Footer
    officialDataNotice: '官方数据来源于新加坡陆路交通管理局 (LTA DataMall)。',
    systemOperational: '所有数据接口连接正常',
    apiStatus: '接口状态',
    termsOfService: '服务条款与许可',
  },

  ms: {
    // App & Navbar
    appTitle: 'TransportMonitor SG',
    appSubtitle: 'Konsol Telemetri Pengangkutan Singapura',
    searchPlaceholder: 'Cari insiden, lebuh raya, laluan MRT...',
    liveSgt: 'LANGSUNG SGT',
    dataSourceLta: 'Sumber: LTA DataMall v2',
    lastIngested: 'Terakhir Dikemas Kini',
    liveStreamConnected: 'Sambungan Langsung Aktif (24ms)',
    refreshData: 'Kemas Kini Data',
    updating: 'Mengemas kini...',
    hideSidebar: 'Sembunyi Bar Sisi',
    showSidebar: 'Papar Bar Sisi',
    language: 'Pilihan Bahasa',

    // Sidebar
    controlCenter: 'Pusat Kawalan',
    trafficIncidents: 'Insiden Lalu Lintas',
    mrtStatus: 'Status MRT / LRT',
    networkMap: 'Peta Rangkaian',
    liveCctv: 'Kamera Lalu Lintas',
    dataMallApi: 'API DataMall',
    allLinesNormal: 'Semua laluan MRT beroperasi biasa',
    delayReported: 'Kelewatan MRT dilaporkan',

    // Map & Layers
    roadSpeeds: 'Kelajuan Jalan',
    hazards: 'Bahaya',
    cameras: 'Kamera',
    satellite: 'Satelit',
    vectorMap: 'Peta Vektor',
    mapAlwaysOn: 'Peta Vektor Sentiasa Aktif',
    zoomIn: 'Zum Masuk',
    zoomOut: 'Zum Keluar',
    resetZoom: 'Tetap Semula Pandangan',
    centerMap: 'Pusatkan Peta',
    myLocation: 'Lokasi Saya',
    centerToLocation: 'Pusatkan ke Lokasi Saya',
    centerSingapore: 'Pusatkan ke Singapura',
    locating: 'Mencari lokasi...',
    locatedSuccess: 'Berjaya dipusatkan ke lokasi anda',
    locationUnavailable: 'Lokasi tidak dapat dikesan, dipusatkan ke Singapura',

    // Right Sidebar Tabs
    liveFeed: 'Suapan Langsung',
    overview: 'Gambaran Keseluruhan',
    selected: 'Dipilih',
    cctvFeeds: 'Kamera',
    reports: 'Laporan',
    all: 'Semua',
    accidents: 'Kemalangan',
    roadworks: 'Kerja Jalan',
    congestion: 'Kesesakan',
    breakdowns: 'Kerosakan Kereta',

    // Telemetry & Stats
    networkOverview: 'Gambaran Keseluruhan Rangkaian',
    activeIncidents: 'Insiden Aktif',
    severeCongestion: 'Zon Kesesakan',
    avgIslandSpeed: 'Purata Kelajuan Pulau',
    accidentsReported: 'Kemalangan Dilaporkan',
    liveIngestion: 'PENYERAPAN LANGSUNG',

    // Speed Legend
    speedLegendTitle: 'Petunjuk Kelajuan Keadaan Lalu Lintas',
    smoothFlow: 'Lancar',
    moderateVolume: 'Sederhana',
    slowMoving: 'Perlahan',
    heavyCongestion: 'Kesesakan Teruk',
    expresswaySpeedsSummary: 'Ringkasan Kelajuan Lebuh Raya',
    currentSpeed: 'Kelajuan Semasa',
    estimatedTravelTime: 'Anggaran Masa Perjalanan',
    typicalTime: 'Masa Biasa',
    from: 'Dari',
    to: 'Ke',
    direction: 'Arah',
    sector: 'Sektor',
    impact: 'Kesan Lorong',
    laneStatus: 'Status Lorong',
    estClearance: 'Anggaran Masa Pembersihan',
    liveCctvFeed: 'Kamera CCTV Langsung LTA',
    viewDetails: 'Lihat Butiran',
    noIncidentsFound: 'Tiada insiden ditemui',

    // Camera Feed Modal & Panel
    cameraViewerTitle: 'Kamera CCTV Lalu Lintas Langsung LTA',
    cameraFeedActive: 'SUAPAN LANGSUNG AKTIF',
    cameraTimestamp: 'Imej Dikemas Kini',
    refreshSnapshot: 'Muat Semula Imej',
    expresswayCorridor: 'Koridor Lebuh Raya',
    viewFullFeed: 'Buka Imej Resolusi Penuh',

    // MRT Screen
    networkStatusTitle: 'Status Rangkaian MRT / LRT',
    liveUpdate: 'KEMAS KINI LANGSUNG',
    normalService: 'Perkhidmatan Biasa',
    serviceDelay: 'Kelewatan Perkhidmatan',
    recentAdvisories: 'Nasihat Perkhidmatan Terkini',
    stations: 'stesen',
    peakFreq: 'Waktu Puncak',
    offPeakFreq: 'Bukan Puncak',
    firstTrain: 'Tren Pertama',
    lastTrain: 'Tren Terakhir',
    bridgingBus: 'Bas Perantara Percuma',
    viewLineDetails: 'Laluan Stesen & Pertukaran',

    // Footer
    officialDataNotice: 'Suapan data rasmi dari Penguasa Pengangkutan Darat (LTA) Singapore DataMall.',
    systemOperational: 'Semua Suapan Data Bersambung',
    apiStatus: 'Status API',
    termsOfService: 'Terma & Pelesenan',
  },

  ja: {
    // App & Navbar
    appTitle: 'シンガポール交通モニター SG',
    appSubtitle: 'シンガポール陸上交通庁 (LTA) リアルタイム監視システム',
    searchPlaceholder: '事故、高速道路、MRT路線を検索...',
    liveSgt: 'シンガポール標準時 LIVE',
    dataSourceLta: 'データ提供: LTA DataMall v2',
    lastIngested: '最終更新',
    liveStreamConnected: 'リアルタイム通信正常 (24ms)',
    refreshData: 'データを更新',
    updating: '更新中...',
    hideSidebar: 'サイドバーを隠す',
    showSidebar: 'サイドバーを表示',
    language: '言語切替',

    // Sidebar
    controlCenter: 'コントロールセンター',
    trafficIncidents: '道路交通情報',
    mrtStatus: 'MRT / LRT 運行状況',
    networkMap: '路線図マップ',
    liveCctv: 'ライブカメラ',
    dataMallApi: 'DataMall API',
    allLinesNormal: '全線平常運行中',
    delayReported: 'MRT遅延が発生しています',

    // Map & Layers
    roadSpeeds: '走行速度',
    hazards: '事故・障害',
    cameras: 'カメラ',
    satellite: '衛星写真',
    vectorMap: 'ベクターマップ',
    mapAlwaysOn: 'ベクターマップ常時稼働中',
    zoomIn: '拡大',
    zoomOut: '縮小',
    resetZoom: '全体表示',
    centerMap: 'マップを中央に配置',
    myLocation: '現在地',
    centerToLocation: '現在地に移動',
    centerSingapore: 'シンガポール中央に移動',
    locating: '現在地を取得中...',
    locatedSuccess: '現在地を表示しました',
    locationUnavailable: '位置情報を取得できませんでした。シンガポール中央を表示します',

    // Right Sidebar Tabs
    liveFeed: '速報フィード',
    overview: '全体サマリー',
    selected: '詳細情報',
    cctvFeeds: 'カメラ映像',
    reports: '件の報告',
    all: 'すべて',
    accidents: '交通事故',
    roadworks: '道路工事',
    congestion: '渋滞',
    breakdowns: '故障車',

    // Telemetry & Stats
    networkOverview: '道路網サマリー',
    activeIncidents: '発生中のインシデント',
    severeCongestion: '重度渋滞区間',
    avgIslandSpeed: '全島平均走行速度',
    accidentsReported: '事故報告数',
    liveIngestion: 'リアルタイム同期中',

    // Speed Legend
    speedLegendTitle: '交通速度インジケーター',
    smoothFlow: '順調（スムーズ）',
    moderateVolume: '標準',
    slowMoving: '低速走行',
    heavyCongestion: '激しい渋滞',
    expresswaySpeedsSummary: '主要高速道路の平均速度',
    currentSpeed: '現在の走行速度',
    estimatedTravelTime: '所要時間目安',
    typicalTime: '通常時',
    from: '出発地',
    to: '目的地',
    direction: '進行方向',
    sector: '区間',
    impact: '規制車線',
    laneStatus: '車線状況',
    estClearance: '復旧見込み時間',
    liveCctvFeed: 'LTA公式交通監視カメラ (CCTV)',
    viewDetails: '詳細を見る',
    noIncidentsFound: '該当するインシデントはありません',

    // Camera Feed Modal & Panel
    cameraViewerTitle: 'LTA ライブ交通カメラ',
    cameraFeedActive: 'ライブ映像配信中',
    cameraTimestamp: '画像更新時刻',
    refreshSnapshot: '画像を更新',
    expresswayCorridor: '高速道路区間',
    viewFullFeed: '高画質で表示',

    // MRT Screen
    networkStatusTitle: 'MRT / LRT 運行ステータス',
    liveUpdate: 'リアルタイム更新',
    normalService: '平常運行',
    serviceDelay: '運行遅延',
    recentAdvisories: '最新のお知らせ・運行情報',
    stations: '駅',
    peakFreq: 'ラッシュ時',
    offPeakFreq: '平常時',
    firstTrain: '始発',
    lastTrain: '終電',
    bridgingBus: '無料代替バス運行中',
    viewLineDetails: '路線図と駅一覧',

    // Footer
    officialDataNotice: 'シンガポール陸上交通庁 (LTA DataMall) の公式オープンデータを利用しています。',
    systemOperational: 'すべてのAPIシステムは正常に接続されています',
    apiStatus: 'API稼働状況',
    termsOfService: '利用規約・ライセンス',
  },

  ko: {
    // App & Navbar
    appTitle: '싱가포르 교통 모니터 SG',
    appSubtitle: '싱가포르 육상교통청 (LTA) 실시간 관제 시스템',
    searchPlaceholder: '사고, 고속도로, MRT 노선 검색...',
    liveSgt: '싱가포르 표준시 LIVE',
    dataSourceLta: '데이터 출처: LTA DataMall v2',
    lastIngested: '최근 수신',
    liveStreamConnected: '실시간 스트림 정상 (24ms)',
    refreshData: '데이터 새로고침',
    updating: '업데이트 중...',
    hideSidebar: '사이드바 숨기기',
    showSidebar: '사이드바 표시',
    language: '언어 선택',

    // Sidebar
    controlCenter: '관제 센터',
    trafficIncidents: '도로 교통 상황',
    mrtStatus: 'MRT / LRT 운행 현황',
    networkMap: '교통망 노선도',
    liveCctv: '교통 CCTV',
    dataMallApi: 'DataMall API',
    allLinesNormal: '모든 MRT 노선 정상 운행',
    delayReported: '지하철 지연 발생',

    // Map & Layers
    roadSpeeds: '도로 속도',
    hazards: '사고/공사',
    cameras: '카메라',
    satellite: '위성 지도',
    vectorMap: '벡터 지도',
    mapAlwaysOn: '벡터 지도 상시 렌더링 중',
    zoomIn: '확대',
    zoomOut: '축소',
    resetZoom: '화면 맞춤',
    centerMap: '지도 중앙 맞춤',
    myLocation: '내 위치',
    centerToLocation: '내 위치로 이동',
    centerSingapore: '싱가포르 중앙으로 이동',
    locating: '위치 확인 중...',
    locatedSuccess: '현재 위치로 이동했습니다',
    locationUnavailable: '위치를 확인할 수 없어 싱가포르 중앙으로 이동합니다',

    // Right Sidebar Tabs
    liveFeed: '실시간 피드',
    overview: '종합 요약',
    selected: '상세 정보',
    cctvFeeds: 'CCTV 영상',
    reports: '건 보고됨',
    all: '전체',
    accidents: '교통사고',
    roadworks: '도로 공사',
    congestion: '교통 정체',
    breakdowns: '차량 고장',

    // Telemetry & Stats
    networkOverview: '도로망 종합 현황',
    activeIncidents: '발생 중인 돌발 상황',
    severeCongestion: '심각한 정체 구역',
    avgIslandSpeed: '전체 평균 주행 속도',
    accidentsReported: '사고 접수 건수',
    liveIngestion: '실시간 동기화',

    // Speed Legend
    speedLegendTitle: '교통 주행 속도 범례',
    smoothFlow: '원활한 주행',
    moderateVolume: '보통',
    slowMoving: '서행',
    heavyCongestion: '심각한 정체',
    expresswaySpeedsSummary: '주요 고속도로 실시간 속도',
    currentSpeed: '현재 속도',
    estimatedTravelTime: '예상 소요 시간',
    typicalTime: '평소 소요',
    from: '출발',
    to: '도착',
    direction: '방향',
    sector: '구간',
    impact: '통제 차선',
    laneStatus: '차선 상태',
    estClearance: '예상 수습 시간',
    liveCctvFeed: 'LTA 실시간 교통 관제 CCTV',
    viewDetails: '상세보기',
    noIncidentsFound: '해당 조건의 돌발 상황이 없습니다',

    // Camera Feed Modal & Panel
    cameraViewerTitle: 'LTA 실시간 교통 CCTV',
    cameraFeedActive: '실시간 영상 수신 중',
    cameraTimestamp: '화면 갱신 시각',
    refreshSnapshot: '영상 새로고침',
    expresswayCorridor: '고속도로 구간',
    viewFullFeed: '고화질로 보기',

    // MRT Screen
    networkStatusTitle: 'MRT / LRT 운행 현황',
    liveUpdate: '실시간 현황',
    normalService: '정상 운행',
    serviceDelay: '운행 지연',
    recentAdvisories: '최신 운행 공지사항',
    stations: '개 역',
    peakFreq: '출퇴근 배차',
    offPeakFreq: '평시 배차',
    firstTrain: '첫차',
    lastTrain: '막차',
    bridgingBus: '무료 대체 버스 운행 중',
    viewLineDetails: '노선 및 역 정보 확인',

    // Footer
    officialDataNotice: '싱가포르 육상교통청 (LTA DataMall) 공식 공공데이터를 기반으로 제공됩니다.',
    systemOperational: '모든 데이터 서비스 정상 연결',
    apiStatus: 'API 상태',
    termsOfService: '이용약관 및 라이선스',
  },

  ta: {
    // App & Navbar
    appTitle: 'போக்குவரத்து கண்காணிப்பு SG',
    appSubtitle: 'சிங்கப்பூர் நிலப் போக்குவரத்து ஆணைய நேரலை கட்டுப்பாட்டு அமைப்பு',
    searchPlaceholder: 'விபத்துகள், விரைவுச்சாலைகள், MRT பாதைகளைத் தேடுங்கள்...',
    liveSgt: 'நேரலை SGT',
    dataSourceLta: 'மூலம்: LTA DataMall v2',
    lastIngested: 'கடைசி புதுப்பிப்பு',
    liveStreamConnected: 'நேரலை தரவு இணைப்பு செயலில் உள்ளது (24ms)',
    refreshData: 'தரவை புதுப்பிக்கவும்',
    updating: 'புதுப்பிக்கிறது...',
    hideSidebar: 'பக்கப்பட்டியை மறை',
    showSidebar: 'பக்கப்பட்டியைக் காட்டு',
    language: 'மொழி தேர்வு',

    // Sidebar
    controlCenter: 'கட்டுப்பாட்டு மையம்',
    trafficIncidents: 'போக்குவரத்து சம்பவங்கள்',
    mrtStatus: 'MRT / LRT நிலை',
    networkMap: 'நெட்வொர்க் வரைபடம்',
    liveCctv: 'நேரலை கேமராக்கள்',
    dataMallApi: 'DataMall API',
    allLinesNormal: 'அனைத்து MRT தடங்களும் வழக்கம் போல இயங்குகின்றன',
    delayReported: 'ரயில் தாமதம் அறிவிக்கப்பட்டுள்ளது',

    // Map & Layers
    roadSpeeds: 'சாலை வேகம்',
    hazards: 'ஆபத்துகள்',
    cameras: 'கேமராக்கள்',
    satellite: 'செயற்கைக்கோள்',
    vectorMap: 'வெக்டார் வரைபடம்',
    mapAlwaysOn: 'வெக்டார் வரைபடம் தொடர்ந்து இயங்குகிறது',
    zoomIn: 'பெரிதாக்கு',
    zoomOut: 'சிறிதாக்கு',
    resetZoom: 'மீட்டமை',
    centerMap: 'வரைபடத்தை மையப்படுத்து',
    myLocation: 'எனது இருப்பிடம்',
    centerToLocation: 'எனது இருப்பிடத்திற்கு நகர்த்து',
    centerSingapore: 'சிங்கப்பூருக்கு மையப்படுத்து',
    locating: 'இருப்பிடத்தைக் கண்டறிகிறது...',
    locatedSuccess: 'உங்கள் இருப்பிடம் காண்பிக்கப்பட்டது',
    locationUnavailable: 'இருப்பிடம் கிடைக்கவில்லை, சிங்கப்பூருக்கு மாற்றப்பட்டது',

    // Right Sidebar Tabs
    liveFeed: 'நேரலை ஓட்டம்',
    overview: 'கண்ணோட்டம்',
    selected: 'தேர்ந்தெடுக்கப்பட்டது',
    cctvFeeds: 'கேமராக்கள்',
    reports: 'அறிக்கைகள்',
    all: 'அனைத்தும்',
    accidents: 'விபத்துகள்',
    roadworks: 'சாலைப் பணிகள்',
    congestion: 'நெரிசல்',
    breakdowns: 'வாகனப் பழுது',

    // Telemetry & Stats
    networkOverview: 'நெட்வொர்க் கண்ணோட்டம்',
    activeIncidents: 'செயலில் உள்ள சம்பவங்கள்',
    severeCongestion: 'கடுமையான நெரிசல் பகுதிகள்',
    avgIslandSpeed: 'தீவு சராசரி வேகம்',
    accidentsReported: 'பதிவான விபத்துகள்',
    liveIngestion: 'நேரலை தரவு உட்கிரகிப்பு',

    // Speed Legend
    speedLegendTitle: 'போக்குவரத்து வேக விளக்கப்படம்',
    smoothFlow: 'சுமுகமான போக்குவரத்து',
    moderateVolume: 'மிதமான போக்குவரத்து',
    slowMoving: 'மெதுவான இயக்கம்',
    heavyCongestion: 'கடுமையான நெரிசல்',
    expresswaySpeedsSummary: 'விரைவுச்சாலை சராசரி வேகம்',
    currentSpeed: 'தற்போதைய வேகம்',
    estimatedTravelTime: 'மதிப்பிடப்பட்ட பயண நேரம்',
    typicalTime: 'வழக்கமான நேரம்',
    from: 'இருந்து',
    to: 'வரை',
    direction: 'திசை',
    sector: 'பகுதி',
    impact: 'பாதிக்கப்பட்ட பாதை',
    laneStatus: 'பாதை நிலை',
    estClearance: 'சீராகும் மதிப்பிடப்பட்ட நேரம்',
    liveCctvFeed: 'LTA நேரலை கண்காணிப்பு கேமரா (CCTV)',
    viewDetails: 'விவரங்களைக் காண்க',
    noIncidentsFound: 'சம்பவங்கள் எதுவும் இல்லை',

    // Camera Feed Modal & Panel
    cameraViewerTitle: 'LTA நேரலை போக்குவரத்து CCTV கேமரா',
    cameraFeedActive: 'நேரலை கேமரா இயங்குகிறது',
    cameraTimestamp: 'படம் புதுப்பிக்கப்பட்டது',
    refreshSnapshot: 'படத்தைப் புதுப்பி',
    expresswayCorridor: 'விரைவுச்சாலை வழித்தடம்',
    viewFullFeed: 'முழு அளவில் பார்க்க',

    // MRT Screen
    networkStatusTitle: 'MRT / LRT நெட்வொர்க் நிலை',
    liveUpdate: 'நேரலை புதுப்பிப்பு',
    normalService: 'வழக்கமான சேவை',
    serviceDelay: 'சேவை தாமதம்',
    recentAdvisories: 'சமீபத்திய சேவை அறிவிப்புகள்',
    stations: 'நிலையங்கள்',
    peakFreq: 'நெரிசல் நேரம்',
    offPeakFreq: 'மற்ற நேரம்',
    firstTrain: 'முதல் ரயில்',
    lastTrain: 'கடைசி ரயில்',
    bridgingBus: 'இலவச இணைப்பு பேருந்து சேவை',
    viewLineDetails: 'நிலைய வழிகள் மற்றும் மாற்றுப்பாதைகள்',

    // Footer
    officialDataNotice: 'சிங்கப்பூர் நிலப் போக்குவரத்து ஆணையத்தின் (LTA DataMall) அதிகாரப்பூர்வ நேரலைத் தரவு.',
    systemOperational: 'அனைத்து தரவு அமைப்புகளும் இணைக்கப்பட்டுள்ளன',
    apiStatus: 'API நிலை',
    termsOfService: 'விதிமுறைகள் மற்றும் உரிமம்',
  }
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
  currentLanguageOption: LanguageOption;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>('en');

  // Load persisted language preference if present
  useEffect(() => {
    try {
      const saved = localStorage.getItem('transport_monitor_lang') as LanguageCode;
      if (saved && TRANSLATIONS[saved]) {
        setLanguageState(saved);
      }
    } catch {
      // ignore local storage errors
    }
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('transport_monitor_lang', lang);
    } catch {
      // ignore
    }
  };

  const t = (key: string): string => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS.en[key] || key;
  };

  const currentLanguageOption = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, currentLanguageOption }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
