import React, { useState, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Search,
  Train,
  AlertTriangle,
  Clock,
  Navigation,
  Info,
  CheckCircle2,
  Layers,
  X
} from 'lucide-react';
import { MRTLineStatus, ServiceAdvisory } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface LTAMRTSystemMapProps {
  lines: MRTLineStatus[];
  advisories?: ServiceAdvisory[];
  onSelectLine?: (line: MRTLineStatus) => void;
  heightClass?: string;
}

interface StationInfo {
  id: string;
  name: string;
  lines: string[];
  x: number;
  y: number;
  isInterchange?: boolean;
  isTerminal?: boolean;
  statusAlert?: string;
  firstTrain?: string;
  lastTrain?: string;
  crowdLevel?: 'Low' | 'Moderate' | 'High';
}

const STATIONS_DATA: StationInfo[] = [
  // Interchanges
  { id: 'NS1-EW24', name: 'Jurong East', lines: ['NS', 'EW'], x: 210, y: 390, isInterchange: true, isTerminal: true, firstTrain: '05:16 AM', lastTrain: '11:45 PM', crowdLevel: 'Moderate' },
  { id: 'NS9-TE2', name: 'Woodlands', lines: ['NS', 'TE'], x: 420, y: 130, isInterchange: true, firstTrain: '05:27 AM', lastTrain: '11:38 PM', crowdLevel: 'Low' },
  { id: 'NS17-CC15', name: 'Bishan', lines: ['NS', 'CC'], x: 530, y: 280, isInterchange: true, firstTrain: '05:32 AM', lastTrain: '11:45 PM', crowdLevel: 'High' },
  { id: 'NS21-DT11', name: 'Newton', lines: ['NS', 'DT'], x: 510, y: 400, isInterchange: true, firstTrain: '05:38 AM', lastTrain: '11:58 PM', crowdLevel: 'Moderate' },
  { id: 'NS22-TE14', name: 'Orchard', lines: ['NS', 'TE'], x: 500, y: 435, isInterchange: true, firstTrain: '05:40 AM', lastTrain: '11:55 PM', crowdLevel: 'High' },
  { id: 'NS24-NE6-CC1', name: 'Dhoby Ghaut', lines: ['NS', 'NE', 'CC'], x: 550, y: 455, isInterchange: true, statusAlert: 'Train fault delay at Platform B (+8 mins)', firstTrain: '05:37 AM', lastTrain: '11:55 PM', crowdLevel: 'High' },
  { id: 'NS25-EW13', name: 'City Hall', lines: ['NS', 'EW'], x: 570, y: 490, isInterchange: true, firstTrain: '05:41 AM', lastTrain: '11:58 PM', crowdLevel: 'Moderate' },
  { id: 'NS26-EW14', name: 'Raffles Place', lines: ['NS', 'EW'], x: 570, y: 525, isInterchange: true, firstTrain: '05:38 AM', lastTrain: '11:55 PM', crowdLevel: 'Moderate' },
  { id: 'NS27-CC2-TE20', name: 'Marina Bay', lines: ['NS', 'CC', 'TE'], x: 590, y: 565, isInterchange: true, firstTrain: '05:42 AM', lastTrain: '11:52 PM', crowdLevel: 'Low' },
  { id: 'EW16-NE3-TE17', name: 'Outram Park', lines: ['EW', 'NE', 'TE'], x: 510, y: 535, isInterchange: true, firstTrain: '05:35 AM', lastTrain: '11:50 PM', crowdLevel: 'Moderate' },
  { id: 'EW21-CC22', name: 'Buona Vista', lines: ['EW', 'CC'], x: 380, y: 445, isInterchange: true, firstTrain: '05:25 AM', lastTrain: '11:42 PM', crowdLevel: 'Moderate' },
  { id: 'EW9-CC9', name: 'Paya Lebar', lines: ['EW', 'CC'], x: 720, y: 435, isInterchange: true, firstTrain: '05:32 AM', lastTrain: '11:48 PM', crowdLevel: 'Moderate' },
  { id: 'EW2-DT32', name: 'Tampines', lines: ['EW', 'DT'], x: 840, y: 385, isInterchange: true, firstTrain: '05:21 AM', lastTrain: '11:36 PM', crowdLevel: 'Moderate' },
  { id: 'EW12-DT14', name: 'Bugis', lines: ['EW', 'DT'], x: 610, y: 455, isInterchange: true, firstTrain: '05:38 AM', lastTrain: '11:54 PM', crowdLevel: 'High' },
  { id: 'NE1-CC29', name: 'HarbourFront', lines: ['NE', 'CC'], x: 470, y: 590, isInterchange: true, isTerminal: true, firstTrain: '05:30 AM', lastTrain: '11:45 PM', crowdLevel: 'Low' },
  { id: 'NE4-DT19', name: 'Chinatown', lines: ['NE', 'DT'], x: 530, y: 510, isInterchange: true, firstTrain: '05:36 AM', lastTrain: '11:52 PM', crowdLevel: 'Moderate' },
  { id: 'NE7-DT12', name: 'Little India', lines: ['NE', 'DT'], x: 565, y: 420, isInterchange: true, firstTrain: '05:39 AM', lastTrain: '11:56 PM', crowdLevel: 'Low' },
  { id: 'NE12-CC13', name: 'Serangoon', lines: ['NE', 'CC'], x: 640, y: 315, isInterchange: true, firstTrain: '05:35 AM', lastTrain: '11:51 PM', crowdLevel: 'Moderate' },
  { id: 'CC17-TE9', name: 'Caldecott', lines: ['CC', 'TE'], x: 490, y: 330, isInterchange: true, firstTrain: '05:30 AM', lastTrain: '11:46 PM', crowdLevel: 'Low' },
  { id: 'CC19-DT9', name: 'Botanic Gardens', lines: ['CC', 'DT'], x: 445, y: 395, isInterchange: true, firstTrain: '05:32 AM', lastTrain: '11:48 PM', crowdLevel: 'Low' },
  { id: 'DT10-TE11', name: 'Stevens', lines: ['DT', 'TE'], x: 480, y: 390, isInterchange: true, firstTrain: '05:34 AM', lastTrain: '11:50 PM', crowdLevel: 'Low' },
  { id: 'CC4-DT15', name: 'Promenade', lines: ['CC', 'DT'], x: 635, y: 490, isInterchange: true, firstTrain: '05:40 AM', lastTrain: '11:55 PM', crowdLevel: 'Low' },
  { id: 'CE1-DT16', name: 'Bayfront', lines: ['CC', 'DT'], x: 625, y: 535, isInterchange: true, firstTrain: '05:43 AM', lastTrain: '11:58 PM', crowdLevel: 'Low' },
  { id: 'CC10-DT26', name: 'MacPherson', lines: ['CC', 'DT'], x: 700, y: 395, isInterchange: true, firstTrain: '05:33 AM', lastTrain: '11:49 PM', crowdLevel: 'Low' },
  { id: 'DT35-CG1', name: 'Expo', lines: ['DT', 'EW'], x: 900, y: 440, isInterchange: true, firstTrain: '05:23 AM', lastTrain: '11:38 PM', crowdLevel: 'Low' },

  // Key Terminals & Stations
  { id: 'EW33', name: 'Tuas Link', lines: ['EW'], x: 70, y: 390, isTerminal: true, firstTrain: '05:19 AM', lastTrain: '11:19 PM' },
  { id: 'EW27', name: 'Boon Lay', lines: ['EW'], x: 130, y: 390, firstTrain: '05:15 AM', lastTrain: '11:40 PM' },
  { id: 'EW1', name: 'Pasir Ris', lines: ['EW'], x: 890, y: 360, isTerminal: true, firstTrain: '05:28 AM', lastTrain: '11:23 PM' },
  { id: 'CG2', name: 'Changi Airport ✈', lines: ['EW'], x: 940, y: 470, isTerminal: true, firstTrain: '05:31 AM', lastTrain: '11:18 PM' },
  { id: 'NS28', name: 'Marina South Pier', lines: ['NS'], x: 620, y: 605, isTerminal: true, firstTrain: '05:45 AM', lastTrain: '11:50 PM' },
  { id: 'NE18', name: 'Punggol Coast', lines: ['NE'], x: 790, y: 155, isTerminal: true, firstTrain: '05:35 AM', lastTrain: '11:35 PM' },
  { id: 'NE17', name: 'Punggol', lines: ['NE'], x: 770, y: 180, isInterchange: true, firstTrain: '05:42 AM', lastTrain: '11:40 PM' },
  { id: 'NE16', name: 'Sengkang', lines: ['NE'], x: 740, y: 220, isInterchange: true, firstTrain: '05:45 AM', lastTrain: '11:44 PM' },
  { id: 'DT1', name: 'Bukit Panjang', lines: ['DT'], x: 310, y: 230, isTerminal: true, firstTrain: '05:30 AM', lastTrain: '11:35 PM' },
  { id: 'TE1', name: 'Woodlands North', lines: ['TE'], x: 420, y: 80, isTerminal: true, firstTrain: '05:35 AM', lastTrain: '11:30 PM' },
  { id: 'TE29', name: 'Bayshore', lines: ['TE'], x: 870, y: 535, isTerminal: true, firstTrain: '05:40 AM', lastTrain: '11:35 PM' },
  { id: 'TE22', name: 'Gardens by the Bay', lines: ['TE'], x: 660, y: 575, firstTrain: '05:45 AM', lastTrain: '11:45 PM' },
];

export const LTAMRTSystemMap: React.FC<LTAMRTSystemMapProps> = ({
  lines,
  advisories = [],
  onSelectLine,
  heightClass = 'h-full min-h-[580px]',
}) => {
  const { t } = useLanguage();
  const [selectedLineFilter, setSelectedLineFilter] = useState<string>('ALL');
  const [zoom, setZoom] = useState<number>(1);
  const [selectedStation, setSelectedStation] = useState<StationInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredStations = STATIONS_DATA.filter((st) => {
    if (selectedLineFilter !== 'ALL' && !st.lines.includes(selectedLineFilter)) return false;
    if (searchQuery.trim() && !st.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`w-full ${heightClass} relative bg-[#fafafa] border border-[#c1c6d3] rounded-2xl shadow-sm flex flex-col overflow-hidden select-none font-sans`}
    >
      {/* 1. Map Top Control Header Bar */}
      <div className="bg-white px-4 py-3 border-b border-[#e1e3e4] flex flex-wrap items-center justify-between gap-3 shrink-0 z-20 shadow-2xs">
        {/* Left: System Title & Live Telemetry Indicator */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#004481] text-white rounded-lg shadow-xs">
            <Train className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[16px] md:text-[18px] font-bold text-[#191c1d] tracking-tight">
                Singapore Rail Transit System Map
              </h3>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                LTA Official Standard
              </span>
            </div>
            <p className="text-[12px] text-[#727783] hidden sm:block">
              Full SMRT & SBS Transit Schematic Network • All 6 Lines + LRT Networks
            </p>
          </div>
        </div>

        {/* Center: Station Search Input */}
        <div className="relative w-48 sm:w-64">
          <Search className="w-4 h-4 text-[#727783] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search MRT Station..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#f3f4f5] border border-[#d1d5db] rounded-lg text-[13px] text-[#191c1d] focus:outline-none focus:ring-2 focus:ring-[#004481] focus:bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right: Map Canvas Controls */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-[#f3f4f5] border border-[#d1d5db] rounded-lg p-0.5">
            <button
              onClick={() => setZoom((z) => Math.min(z + 0.2, 2.4))}
              className="p-1.5 text-gray-700 hover:bg-white hover:shadow-xs rounded-md transition-all cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(z - 0.2, 0.7))}
              className="p-1.5 text-gray-700 hover:bg-white hover:shadow-xs rounded-md transition-all cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setZoom(1);
                setSelectedStation(null);
              }}
              className="p-1.5 text-gray-700 hover:bg-white hover:shadow-xs rounded-md transition-all cursor-pointer"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2 bg-[#f3f4f5] hover:bg-[#e1e3e4] border border-[#d1d5db] rounded-lg text-gray-700 transition-colors cursor-pointer"
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. Line Filter Pills Strip (Official LTA Colors) */}
      <div className="bg-[#edeeef] px-4 py-2 border-b border-[#e1e3e4] flex items-center justify-between overflow-x-auto gap-2 shrink-0 z-10">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-[#414751] uppercase tracking-wider whitespace-nowrap mr-1">
            Filter Line:
          </span>
          <button
            onClick={() => setSelectedLineFilter('ALL')}
            className={`px-3 py-1 rounded-md text-[12px] font-bold transition-all cursor-pointer ${
              selectedLineFilter === 'ALL'
                ? 'bg-[#004481] text-white shadow-xs'
                : 'bg-white text-[#414751] hover:bg-gray-100 border border-gray-200'
            }`}
          >
            All Lines (Full System)
          </button>

          {lines.map((l) => {
            const isSelected = selectedLineFilter === l.code;
            return (
              <button
                key={l.id}
                onClick={() => setSelectedLineFilter(l.code)}
                className={`px-2.5 py-1 rounded-md text-[12px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'text-white shadow-xs ring-2 ring-[#004481]'
                    : 'bg-white text-[#414751] hover:bg-gray-100 border border-gray-200'
                }`}
                style={{
                  backgroundColor: isSelected ? l.colorHex : undefined,
                }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: l.colorHex }}
                />
                <span>{l.code}</span>
                <span className="hidden md:inline font-normal opacity-90 text-[11px] truncate max-w-24">
                  {l.name.replace(' Line', '')}
                </span>
              </button>
            );
          })}
        </div>

        {/* Legend Hint */}
        <div className="hidden lg:flex items-center gap-4 text-[11px] text-[#727783] shrink-0 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full border-2 border-[#191c1d] bg-white inline-block"></span>
            <span>Interchange Hub</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a] inline-block animate-ping"></span>
            <span>Live Alert</span>
          </div>
        </div>
      </div>

      {/* 3. Interactive SVG Transit Network Canvas */}
      <div className="flex-1 overflow-auto bg-[#fafafa] relative p-4 flex items-center justify-center">
        <div
          className="transition-transform duration-200 origin-center cursor-grab active:cursor-grabbing"
          style={{ transform: `scale(${zoom})`, minWidth: '1020px', height: '650px' }}
        >
          <svg
            viewBox="0 0 1020 650"
            className="w-[1020px] h-[650px] select-none"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {/* Defs for gradients and shadow markers */}
            <defs>
              <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.25" />
              </filter>
            </defs>

            {/* Singapore Island Geographic Outline Silhouette */}
            <path
              d="M 50,420 Q 150,510 350,560 T 600,590 T 800,550 T 960,450 Q 980,300 860,200 T 550,110 T 350,110 T 120,240 Z"
              fill="#f0f2f5"
              stroke="#e4e7eb"
              strokeWidth="2"
            />
            <path
              d="M 500,480 Q 560,540 650,550 T 750,510"
              fill="none"
              stroke="#e1e4e8"
              strokeWidth="24"
              strokeLinecap="round"
            />

            {/* ===================================================================
                1. NORTH-SOUTH LINE (Red #d42e12)
               =================================================================== */}
            <g
              opacity={
                selectedLineFilter === 'ALL' || selectedLineFilter === 'NS' ? 1 : 0.12
              }
            >
              {/* NSL Route Line */}
              <path
                d="M 210,390 L 210,240 L 320,130 L 420,130 L 530,130 L 530,280 L 530,360 L 510,400 L 500,435 L 550,455 L 570,490 L 570,525 L 590,565 L 620,605"
                fill="none"
                stroke="#d42e12"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Station tick marks along NSL */}
              <circle cx="210" cy="300" r="3.5" fill="#fff" stroke="#d42e12" strokeWidth="2.5" />
              <text x="140" y="304" fontSize="9.5" fill="#414751">NS4 Choa Chu Kang</text>
              <circle cx="370" cy="130" r="3.5" fill="#fff" stroke="#d42e12" strokeWidth="2.5" />
              <text x="350" y="115" fontSize="9.5" fill="#414751">NS8 Marsiling</text>
              <circle cx="470" cy="130" r="3.5" fill="#fff" stroke="#d42e12" strokeWidth="2.5" />
              <text x="455" y="115" fontSize="9.5" fill="#414751">NS13 Yishun</text>
              <circle cx="530" cy="210" r="3.5" fill="#fff" stroke="#d42e12" strokeWidth="2.5" />
              <text x="540" y="214" fontSize="9.5" fill="#414751">NS16 Ang Mo Kio</text>
              <circle cx="530" cy="330" r="3.5" fill="#fff" stroke="#d42e12" strokeWidth="2.5" />
              <text x="540" y="334" fontSize="9.5" fill="#414751">NS19 Toa Payoh</text>
            </g>

            {/* ===================================================================
                2. EAST-WEST LINE (Green #009645)
               =================================================================== */}
            <g
              opacity={
                selectedLineFilter === 'ALL' || selectedLineFilter === 'EW' ? 1 : 0.12
              }
            >
              {/* Main EWL Track */}
              <path
                d="M 70,390 L 210,390 L 380,445 L 510,535 L 540,535 L 570,525 L 570,490 L 610,455 L 720,435 L 840,385 L 890,360"
                fill="none"
                stroke="#009645"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Changi Airport Branch */}
              <path
                d="M 840,385 L 870,410 L 900,440 L 940,470"
                fill="none"
                stroke="#009645"
                strokeWidth="5"
                strokeDasharray="6,4"
                strokeLinecap="round"
              />
              <circle cx="130" cy="390" r="3.5" fill="#fff" stroke="#009645" strokeWidth="2.5" />
              <text x="100" y="380" fontSize="9.5" fill="#414751">EW27 Boon Lay</text>
              <circle cx="300" cy="420" r="3.5" fill="#fff" stroke="#009645" strokeWidth="2.5" />
              <text x="245" y="430" fontSize="9.5" fill="#414751">EW23 Clementi</text>
              <circle cx="440" cy="485" r="3.5" fill="#fff" stroke="#009645" strokeWidth="2.5" />
              <text x="380" y="495" fontSize="9.5" fill="#414751">EW19 Queenstown</text>
              <circle cx="660" cy="445" r="3.5" fill="#fff" stroke="#009645" strokeWidth="2.5" />
              <text x="645" y="435" fontSize="9.5" fill="#414751">EW10 Kallang</text>
              <circle cx="780" cy="410" r="3.5" fill="#fff" stroke="#009645" strokeWidth="2.5" />
              <text x="770" y="400" fontSize="9.5" fill="#414751">EW5 Bedok</text>
            </g>

            {/* ===================================================================
                3. NORTH EAST LINE (Purple #732282)
               =================================================================== */}
            <g
              opacity={
                selectedLineFilter === 'ALL' || selectedLineFilter === 'NE' ? 1 : 0.12
              }
            >
              <path
                d="M 470,590 L 510,535 L 530,510 L 550,455 L 565,420 L 640,315 L 710,240 L 740,220 L 770,180 L 790,155"
                fill="none"
                stroke="#732282"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="600" cy="370" r="3.5" fill="#fff" stroke="#732282" strokeWidth="2.5" />
              <text x="610" y="375" fontSize="9.5" fill="#414751">NE10 Potong Pasir</text>
              <circle cx="680" cy="270" r="3.5" fill="#fff" stroke="#732282" strokeWidth="2.5" />
              <text x="690" y="275" fontSize="9.5" fill="#414751">NE14 Hougang</text>
            </g>

            {/* ===================================================================
                4. CIRCLE LINE (Orange #fa9e0d)
               =================================================================== */}
            <g
              opacity={
                selectedLineFilter === 'ALL' || selectedLineFilter === 'CC' ? 1 : 0.12
              }
            >
              {/* Main Circle Ring */}
              <path
                d="M 550,455 L 610,470 L 635,490 L 675,475 L 720,435 L 700,395 L 670,355 L 640,315 L 590,280 L 530,280 L 490,330 L 445,395 L 380,445 L 420,520 L 470,590"
                fill="none"
                stroke="#fa9e0d"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Marina Bay Extension */}
              <path
                d="M 635,490 L 625,535 L 590,565"
                fill="none"
                stroke="#fa9e0d"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <circle cx="685" cy="460" r="3.5" fill="#fff" stroke="#fa9e0d" strokeWidth="2.5" />
              <text x="695" y="465" fontSize="9.5" fill="#414751">CC6 Stadium</text>
              <circle cx="410" cy="485" r="3.5" fill="#fff" stroke="#fa9e0d" strokeWidth="2.5" />
              <text x="340" y="490" fontSize="9.5" fill="#414751">CC24 Kent Ridge</text>
            </g>

            {/* ===================================================================
                5. DOWNTOWN LINE (Blue #005ec4)
               =================================================================== */}
            <g
              opacity={
                selectedLineFilter === 'ALL' || selectedLineFilter === 'DT' ? 1 : 0.12
              }
            >
              <path
                d="M 310,230 L 380,310 L 445,395 L 480,390 L 510,400 L 565,420 L 610,455 L 635,490 L 625,535 L 570,550 L 530,510 L 565,480 L 635,435 L 700,395 L 780,385 L 840,385 L 900,440"
                fill="none"
                stroke="#005ec4"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="350" cy="275" r="3.5" fill="#fff" stroke="#005ec4" strokeWidth="2.5" />
              <text x="270" y="275" fontSize="9.5" fill="#414751">DT5 Beauty World</text>
              <circle cx="740" cy="390" r="3.5" fill="#fff" stroke="#005ec4" strokeWidth="2.5" />
              <text x="730" y="380" fontSize="9.5" fill="#414751">DT28 Kaki Bukit</text>
            </g>

            {/* ===================================================================
                6. THOMSON-EAST COAST LINE (Brown #9D5B25)
               =================================================================== */}
            <g
              opacity={
                selectedLineFilter === 'ALL' || selectedLineFilter === 'TE' ? 1 : 0.12
              }
            >
              <path
                d="M 420,80 L 420,130 L 450,200 L 480,260 L 490,330 L 480,390 L 500,435 L 510,535 L 550,560 L 590,565 L 660,575 L 740,565 L 810,550 L 870,535"
                fill="none"
                stroke="#9D5B25"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="450" cy="200" r="3.5" fill="#fff" stroke="#9D5B25" strokeWidth="2.5" />
              <text x="460" y="205" fontSize="9.5" fill="#414751">TE5 Lentor</text>
              <circle cx="480" cy="260" r="3.5" fill="#fff" stroke="#9D5B25" strokeWidth="2.5" />
              <text x="490" y="265" fontSize="9.5" fill="#414751">TE8 Upper Thomson</text>
              <circle cx="775" cy="560" r="3.5" fill="#fff" stroke="#9D5B25" strokeWidth="2.5" />
              <text x="760" y="580" fontSize="9.5" fill="#414751">TE26 Marine Parade</text>
            </g>

            {/* ===================================================================
                7. LRT LOOPS (Grey #748477)
               =================================================================== */}
            <g opacity="0.65">
              {/* Bukit Panjang LRT */}
              <circle cx="270" cy="240" r="22" fill="none" stroke="#748477" strokeWidth="3.5" strokeDasharray="4,3" />
              <text x="240" y="210" fontSize="8" fill="#748477" fontWeight="bold">BP LRT</text>

              {/* Sengkang LRT */}
              <circle cx="740" cy="200" r="18" fill="none" stroke="#748477" strokeWidth="3.5" strokeDasharray="4,3" />
              <text x="720" y="175" fontSize="8" fill="#748477" fontWeight="bold">SK LRT</text>

              {/* Punggol LRT */}
              <circle cx="785" cy="175" r="18" fill="none" stroke="#748477" strokeWidth="3.5" strokeDasharray="4,3" />
              <text x="785" y="150" fontSize="8" fill="#748477" fontWeight="bold">PG LRT</text>
            </g>

            {/* ===================================================================
                8. STATION PINS & INTERCHANGES
               =================================================================== */}
            {filteredStations.map((st) => {
              const isSelected = selectedStation?.id === st.id;
              const hasAlert = !!st.statusAlert;

              return (
                <g
                  key={st.id}
                  className="cursor-pointer group"
                  onClick={() => setSelectedStation(st)}
                >
                  {/* Alert Pulse Glow if disrupted */}
                  {hasAlert && (
                    <circle
                      cx={st.x}
                      cy={st.y}
                      r="16"
                      fill="none"
                      stroke="#ba1a1a"
                      strokeWidth="2.5"
                      strokeDasharray="4,4"
                      className="animate-spin origin-center"
                    />
                  )}

                  {/* Interchange Capsule / Circle */}
                  {st.isInterchange ? (
                    <g filter="url(#shadow)">
                      <circle
                        cx={st.x}
                        cy={st.y}
                        r={isSelected ? '11' : '8.5'}
                        fill="#ffffff"
                        stroke="#191c1d"
                        strokeWidth="3.5"
                      />
                      <circle
                        cx={st.x}
                        cy={st.y}
                        r={isSelected ? '6' : '4.5'}
                        fill={hasAlert ? '#ba1a1a' : '#191c1d'}
                      />
                    </g>
                  ) : (
                    <circle
                      cx={st.x}
                      cy={st.y}
                      r={isSelected ? '7' : '5'}
                      fill="#ffffff"
                      stroke="#414751"
                      strokeWidth="2.5"
                    />
                  )}

                  {/* Station Name Label */}
                  <text
                    x={st.x + (st.isInterchange ? 12 : 8)}
                    y={st.y + 3.5}
                    fontSize={st.isInterchange ? '11' : '9.5'}
                    fontWeight={st.isInterchange ? '700' : '500'}
                    fill={isSelected ? '#004481' : hasAlert ? '#ba1a1a' : '#191c1d'}
                    className="group-hover:fill-[#004481] transition-colors"
                  >
                    {st.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* 4. Selected Station Live Information Overlay Card */}
        {selectedStation && (
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md rounded-xl p-4 border border-[#c1c6d3] shadow-xl z-30 max-w-xs w-full animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  {selectedStation.lines.map((l) => (
                    <span
                      key={l}
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-white ${
                        l === 'NS'
                          ? 'bg-[#d42e12]'
                          : l === 'EW'
                          ? 'bg-[#009645]'
                          : l === 'NE'
                          ? 'bg-[#732282]'
                          : l === 'CC'
                          ? 'bg-[#fa9e0d]'
                          : l === 'DT'
                          ? 'bg-[#005ec4]'
                          : 'bg-[#9D5B25]'
                      }`}
                    >
                      {l}
                    </span>
                  ))}
                  <span className="text-[11px] text-[#727783] font-semibold">
                    {selectedStation.isInterchange ? 'Interchange' : 'Station'}
                  </span>
                </div>
                <h4 className="text-[16px] font-bold text-[#191c1d] leading-tight">
                  {selectedStation.name}
                </h4>
              </div>
              <button
                onClick={() => setSelectedStation(null)}
                className="text-[#727783] hover:text-black p-1 rounded hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedStation.statusAlert ? (
              <div className="bg-amber-50 border border-amber-300 rounded-lg p-2.5 mb-2.5 text-[12px] text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Active Service Alert:</strong>
                  <div className="mt-0.5 text-amber-800">{selectedStation.statusAlert}</div>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5 mb-2.5 text-[12px] text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Normal Train Operations • On Schedule</span>
              </div>
            )}

            <div className="space-y-1.5 text-[12px] text-[#414751] bg-[#f8f9fa] p-2.5 rounded-lg border border-[#e1e3e4]">
              <div className="flex justify-between">
                <span className="text-[#727783]">First Train:</span>
                <span className="font-semibold text-[#191c1d]">
                  {selectedStation.firstTrain || '05:30 AM'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#727783]">Last Train:</span>
                <span className="font-semibold text-[#191c1d]">
                  {selectedStation.lastTrain || '11:45 PM'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#727783]">Platform Crowd:</span>
                <span className="font-semibold text-emerald-700">
                  {selectedStation.crowdLevel || 'Low'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Map Footer Bar */}
      <div className="p-2.5 bg-white border-t border-[#e1e3e4] flex flex-wrap justify-between items-center text-[11px] text-[#727783] px-4 shrink-0">
        <div className="flex items-center gap-2">
          <span>Click any line badge to highlight route, or click stations to inspect live telemetry.</span>
        </div>
        <div className="font-mono text-[#004481] font-semibold">
          Data source: LTA DataMall • TrainServiceAlerts
        </div>
      </div>
    </div>
  );
};
