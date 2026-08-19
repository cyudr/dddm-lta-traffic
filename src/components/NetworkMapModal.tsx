import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Info, Layers } from 'lucide-react';
import { MRTLineStatus } from '../types';

interface NetworkMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  lines: MRTLineStatus[];
  onSelectLine: (line: MRTLineStatus) => void;
}

export const NetworkMapModal: React.FC<NetworkMapModalProps> = ({
  isOpen,
  onClose,
  lines,
  onSelectLine,
}) => {
  const [selectedLineFilter, setSelectedLineFilter] = useState<string>('ALL');
  const [zoom, setZoom] = useState<number>(1);
  const [selectedStation, setSelectedStation] = useState<string | null>(null);

  if (!isOpen) return null;

  const keyInterchanges = [
    { name: 'Jurong East', lines: ['NS', 'EW'], x: 200, y: 350 },
    { name: 'Woodlands', lines: ['NS', 'TE'], x: 380, y: 120 },
    { name: 'Bishan', lines: ['NS', 'CC'], x: 490, y: 270 },
    { name: 'Dhoby Ghaut', lines: ['NS', 'NE', 'CC'], x: 500, y: 440, alert: true },
    { name: 'City Hall', lines: ['NS', 'EW'], x: 520, y: 470 },
    { name: 'Raffles Place', lines: ['NS', 'EW'], x: 520, y: 500 },
    { name: 'Marina Bay', lines: ['NS', 'CC', 'TE'], x: 530, y: 540 },
    { name: 'Outram Park', lines: ['EW', 'NE', 'TE'], x: 470, y: 510 },
    { name: 'Buona Vista', lines: ['EW', 'CC'], x: 360, y: 420 },
    { name: 'Paya Lebar', lines: ['EW', 'CC'], x: 670, y: 420 },
    { name: 'Tampines', lines: ['EW', 'DT'], x: 790, y: 360 },
    { name: 'Serangoon', lines: ['NE', 'CC'], x: 580, y: 310 },
    { name: 'Little India', lines: ['NE', 'DT'], x: 510, y: 410 },
    { name: 'Chinatown', lines: ['NE', 'DT'], x: 480, y: 480 },
    { name: 'HarbourFront', lines: ['NE', 'CC'], x: 440, y: 560 },
    { name: 'Botanic Gardens', lines: ['CC', 'DT'], x: 420, y: 380 },
    { name: 'Caldecott', lines: ['CC', 'TE'], x: 460, y: 320 },
    { name: 'Bugis', lines: ['EW', 'DT'], x: 550, y: 440 },
    { name: 'MacPherson', lines: ['CC', 'DT'], x: 650, y: 380 },
    { name: 'Newton', lines: ['NS', 'DT'], x: 470, y: 400 },
    { name: 'Stevens', lines: ['DT', 'TE'], x: 450, y: 380 },
    { name: 'Orchard', lines: ['NS', 'TE'], x: 460, y: 430 },
  ];

  return (
    <div
      id="network-map-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6"
    >
      <div
        id="network-map-modal"
        className="bg-white rounded-xl shadow-2xl border border-[#c1c6d3] w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Top Header */}
        <div className="p-4 border-b border-[#c1c6d3] bg-[#f8f9fa] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-[#004481] text-white">
              <span className="material-symbols-outlined text-[20px]">map</span>
            </div>
            <div>
              <h3 className="text-[18px] font-bold text-[#004481] leading-tight">
                Singapore Rail Transit Network (MRT/LRT)
              </h3>
              <p className="text-[12px] text-[#727783]">
                Official SMRT & SBS Transit Schematic Transit System
              </p>
            </div>
          </div>

          {/* Controls & Close */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white border border-[#c1c6d3] rounded-lg p-0.5 shadow-xs">
              <button
                onClick={() => setZoom((z) => Math.min(z + 0.2, 2.2))}
                title="Zoom In"
                className="p-1.5 hover:bg-[#edeeef] rounded text-[#414751]"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom((z) => Math.max(z - 0.2, 0.8))}
                title="Zoom Out"
                className="p-1.5 hover:bg-[#edeeef] rounded text-[#414751]"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom(1)}
                title="Reset Zoom"
                className="p-1.5 hover:bg-[#edeeef] rounded text-[#414751]"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <button
              id="close-network-map-modal"
              onClick={onClose}
              className="p-2 text-[#727783] hover:text-[#191c1d] hover:bg-[#edeeef] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Line Filter Bar */}
        <div className="bg-[#edeeef] px-4 py-2 border-b border-[#c1c6d3] flex items-center justify-between overflow-x-auto gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#414751] uppercase tracking-wider whitespace-nowrap">
              Filter Line:
            </span>
            <button
              onClick={() => setSelectedLineFilter('ALL')}
              className={`px-2.5 py-1 rounded text-[12px] font-bold transition-colors cursor-pointer ${
                selectedLineFilter === 'ALL'
                  ? 'bg-[#004481] text-white'
                  : 'bg-white text-[#414751] hover:bg-gray-100'
              }`}
            >
              All Lines
            </button>
            {lines.map((line) => (
              <button
                key={line.id}
                onClick={() => setSelectedLineFilter(line.code)}
                className={`px-2.5 py-1 rounded text-[12px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedLineFilter === line.code
                    ? 'ring-2 ring-[#004481] text-white shadow-sm'
                    : 'bg-white text-[#414751] hover:bg-gray-100'
                }`}
                style={{
                  backgroundColor:
                    selectedLineFilter === line.code ? line.colorHex : undefined,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: line.colorHex }}
                />
                <span>{line.code}</span>
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3 text-[11px] text-[#727783]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full border-2 border-black bg-white inline-block"></span>
              Interchange
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ffc107] inline-block animate-ping"></span>
              Active Delay
            </span>
          </div>
        </div>

        {/* SVG Interactive Canvas */}
        <div className="flex-1 overflow-auto bg-[#fafafa] relative p-4 flex items-center justify-center">
          <div
            className="transition-transform duration-200 origin-center"
            style={{ transform: `scale(${zoom})`, minWidth: '950px', height: '620px' }}
          >
            <svg
              viewBox="0 0 950 620"
              className="w-[950px] h-[620px] select-none"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {/* Background Coastline / Geographic Hint */}
              <rect width="950" height="620" fill="#f8f9fa" rx="12" />
              <path
                d="M 50,450 Q 200,520 400,560 T 700,520 T 900,420"
                fill="none"
                stroke="#e1e3e4"
                strokeWidth="40"
                strokeLinecap="round"
              />

              {/* 1. North-South Line (Red #d42e12) */}
              <g
                opacity={
                  selectedLineFilter === 'ALL' || selectedLineFilter === 'NS'
                    ? 1
                    : 0.15
                }
              >
                <path
                  d="M 200,350 L 200,220 L 380,120 L 490,270 L 500,440 L 520,470 L 520,500 L 530,540 L 560,570"
                  fill="none"
                  stroke="#d42e12"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <text x="140" y="355" fill="#d42e12" fontSize="11" fontWeight="bold">
                  NS1 Jurong East
                </text>
                <text x="370" y="105" fill="#d42e12" fontSize="11" fontWeight="bold">
                  NS9 Woodlands
                </text>
                <text x="570" y="585" fill="#d42e12" fontSize="11" fontWeight="bold">
                  NS28 Marina South Pier
                </text>
              </g>

              {/* 2. East-West Line (Green #009645) */}
              <g
                opacity={
                  selectedLineFilter === 'ALL' || selectedLineFilter === 'EW'
                    ? 1
                    : 0.15
                }
              >
                <path
                  d="M 80,350 L 200,350 L 360,420 L 470,510 L 520,500 L 520,470 L 550,440 L 670,420 L 790,360 L 890,340"
                  fill="none"
                  stroke="#009645"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Changi Branch */}
                <path
                  d="M 790,360 L 860,400 L 880,450"
                  fill="none"
                  stroke="#009645"
                  strokeWidth="6"
                  strokeDasharray="4,4"
                  strokeLinecap="round"
                />
                <text x="40" y="340" fill="#009645" fontSize="11" fontWeight="bold">
                  EW33 Tuas Link
                </text>
                <text x="830" y="330" fill="#009645" fontSize="11" fontWeight="bold">
                  EW1 Pasir Ris
                </text>
                <text x="820" y="470" fill="#009645" fontSize="10" fontWeight="bold">
                  CG2 Changi Airport ✈
                </text>
              </g>

              {/* 3. North East Line (Purple #9900aa) */}
              <g
                opacity={
                  selectedLineFilter === 'ALL' || selectedLineFilter === 'NE'
                    ? 1
                    : 0.15
                }
              >
                <path
                  d="M 440,560 L 470,510 L 480,480 L 500,440 L 510,410 L 580,310 L 690,190 L 730,150"
                  fill="none"
                  stroke="#9900aa"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <text x="360" y="575" fill="#9900aa" fontSize="11" fontWeight="bold">
                  NE1 HarbourFront
                </text>
                <text x="710" y="140" fill="#9900aa" fontSize="11" fontWeight="bold">
                  NE17 Punggol Coast
                </text>
              </g>

              {/* 4. Circle Line (Yellow #fa9e0d) */}
              <g
                opacity={
                  selectedLineFilter === 'ALL' || selectedLineFilter === 'CC'
                    ? 1
                    : 0.15
                }
              >
                <path
                  d="M 500,440 Q 580,470 630,470 Q 670,420 670,350 Q 580,240 490,270 Q 460,320 420,380 L 360,420 Q 380,510 440,560"
                  fill="none"
                  stroke="#fa9e0d"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Marina Bay Extension */}
                <path
                  d="M 630,470 L 580,520 L 530,540"
                  fill="none"
                  stroke="#fa9e0d"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </g>

              {/* 5. Downtown Line (Blue #005ec4) */}
              <g
                opacity={
                  selectedLineFilter === 'ALL' || selectedLineFilter === 'DT'
                    ? 1
                    : 0.15
                }
              >
                <path
                  d="M 270,180 L 420,380 L 470,400 L 510,410 L 550,440 L 560,480 L 480,480 L 510,510 L 600,480 L 650,380 L 790,360 L 850,420"
                  fill="none"
                  stroke="#005ec4"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <text x="200" y="175" fill="#005ec4" fontSize="11" fontWeight="bold">
                  DT1 Bukit Panjang
                </text>
                <text x="820" y="440" fill="#005ec4" fontSize="11" fontWeight="bold">
                  DT35 Expo
                </text>
              </g>

              {/* 6. Thomson-East Coast Line (Brown #9d5b25) */}
              <g
                opacity={
                  selectedLineFilter === 'ALL' || selectedLineFilter === 'TE'
                    ? 1
                    : 0.15
                }
              >
                <path
                  d="M 380,80 L 380,120 L 460,320 L 450,380 L 460,430 L 470,510 L 530,540 L 600,560 L 720,530 L 820,490"
                  fill="none"
                  stroke="#9d5b25"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <text x="320" y="70" fill="#9d5b25" fontSize="11" fontWeight="bold">
                  TE1 Woodlands North
                </text>
                <text x="780" y="515" fill="#9d5b25" fontSize="11" fontWeight="bold">
                  TE29 Bayshore
                </text>
              </g>

              {/* Key Interchanges Markers */}
              {keyInterchanges.map((station) => (
                <g
                  key={station.name}
                  className="cursor-pointer group"
                  onClick={() => setSelectedStation(station.name)}
                >
                  <circle
                    cx={station.x}
                    cy={station.y}
                    r={station.alert ? '10' : '7'}
                    fill="white"
                    stroke="#191c1d"
                    strokeWidth="3"
                  />
                  {station.alert && (
                    <circle
                      cx={station.x}
                      cy={station.y}
                      r="14"
                      fill="none"
                      stroke="#ffc107"
                      strokeWidth="2.5"
                      strokeDasharray="3,3"
                      className="animate-spin origin-center"
                    />
                  )}
                  <text
                    x={station.x + 9}
                    y={station.y + 4}
                    fill="#191c1d"
                    fontSize="10"
                    fontWeight="600"
                    className="group-hover:fill-[#004481]"
                  >
                    {station.name}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Station Details Floating Card */}
          {selectedStation && (
            <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-md rounded-lg p-4 border border-[#c1c6d3] shadow-xl z-20 w-80 animate-in slide-in-from-bottom-2">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-[16px] font-bold text-[#004481]">
                    {selectedStation} Station
                  </h4>
                  <p className="text-[11px] text-[#727783]">Major Network Interchange</p>
                </div>
                <button
                  onClick={() => setSelectedStation(null)}
                  className="text-[#727783] hover:text-black p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {selectedStation === 'Dhoby Ghaut' && (
                <div className="bg-[#ffdeaa]/50 border border-[#ffba2c] rounded p-2.5 mb-2 text-[12px] text-[#5a3e00]">
                  <strong className="text-[#9900aa]">NE Line Delay:</strong> +10 mins travel time due to train fault at platform B.
                </div>
              )}

              <div className="text-[12px] text-[#414751] space-y-1">
                <div>
                  <strong>First Train:</strong> 05:35 AM (City-bound)
                </div>
                <div>
                  <strong>Last Train:</strong> 11:50 PM
                </div>
                <div>
                  <strong>Fare Zone:</strong> Downtown Central (Tap in/out active)
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-3 bg-[#f8f9fa] border-t border-[#c1c6d3] flex justify-between items-center text-[12px] text-[#727783] px-6 shrink-0">
          <span>Click any line badge above to filter route or click stations for service info.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#004481] text-white rounded font-semibold hover:bg-[#005baa] transition-colors"
          >
            Close Map
          </button>
        </div>
      </div>
    </div>
  );
};
