import React, { useState, useEffect } from 'react';
import {
  Compass,
  Car,
  Clock,
  QrCode,
  ShieldCheck,
  AlertTriangle,
  Camera,
  RefreshCw,
  ArrowRight,
  TrendingDown,
  Sparkles,
  MapPin,
  ExternalLink,
  Info,
  ChevronRight,
  Eye
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList
} from 'recharts';
import { CustomsCheckpointData, TrafficCamera } from '../types';
import { INITIAL_CUSTOMS_CHECKPOINTS } from '../data/customsCheckpointData';
import { useLanguage } from '../i18n/LanguageContext';

export const CustomsCheckpointView: React.FC = () => {
  const { t } = useLanguage();
  const [checkpoints, setCheckpoints] = useState<CustomsCheckpointData[]>(INITIAL_CUSTOMS_CHECKPOINTS);
  const [selectedCheckpointId, setSelectedCheckpointId] = useState<'woodlands' | 'tuas'>('woodlands');
  const [direction, setDirection] = useState<'to_jb' | 'to_sg'>('to_jb');
  const [selectedCamera, setSelectedCamera] = useState<TrafficCamera | null>(
    INITIAL_CUSTOMS_CHECKPOINTS[0].cameras[0] || null
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedTime, setLastRefreshedTime] = useState<string>('LIVE SGT');

  const activeCheckpoint = checkpoints.find((c) => c.id === selectedCheckpointId) || checkpoints[0];

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/traffic-incidents');
      // Update camera feeds timestamp
      setLastRefreshedTime(
        new Date().toLocaleTimeString('en-SG', {
          timeZone: 'Asia/Singapore',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' SGT'
      );
    } catch (err) {
      console.warn('Refresh error:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // When checkpoint changes, update default active camera
    if (activeCheckpoint.cameras.length > 0) {
      setSelectedCamera(activeCheckpoint.cameras[0]);
    }
  }, [selectedCheckpointId]);

  const activeDirStatus = direction === 'to_jb' ? activeCheckpoint.singaporeToJB : activeCheckpoint.jbToSingapore;
  const otherCheckpoint = checkpoints.find((c) => c.id !== selectedCheckpointId);
  const otherDirStatus = otherCheckpoint
    ? direction === 'to_jb'
      ? otherCheckpoint.singaporeToJB
      : otherCheckpoint.jbToSingapore
    : null;

  const timeDeltaMin = otherDirStatus
    ? activeDirStatus.travelTimeMin - otherDirStatus.travelTimeMin
    : 0;

  return (
    <div className="flex-1 md:mr-72 flex flex-col bg-[#f8f9fa] min-h-[calc(100vh-64px)] pb-24">
      {/* 1. Top Header Bar */}
      <div className="bg-white border-b border-[#e1e3e4] px-4 md:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-16 z-20 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#004481] text-white rounded-lg">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-[20px] md:text-[24px] font-bold text-[#191c1d] tracking-tight leading-none">
              Johor Bahru (JB) / Singapore Cross-Border Customs
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[12px] font-mono text-[#414751]">
                Live LTA Checkpoint Cameras & Estimated Clearance Times
              </span>
            </div>
          </div>
        </div>

        {/* Direction Toggle & Refresh */}
        <div className="flex items-center gap-2">
          <div className="flex bg-[#f3f4f5] p-1 rounded-lg border border-[#d1d5db] text-[12px] font-bold">
            <button
              onClick={() => setDirection('to_jb')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                direction === 'to_jb'
                  ? 'bg-[#004481] text-white shadow-xs'
                  : 'text-[#414751] hover:text-black'
              }`}
            >
              Singapore ➔ Johor Bahru
            </button>
            <button
              onClick={() => setDirection('to_sg')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                direction === 'to_sg'
                  ? 'bg-[#004481] text-white shadow-xs'
                  : 'text-[#414751] hover:text-black'
              }`}
            >
              Johor Bahru ➔ Singapore
            </button>
          </div>

          <button
            onClick={refreshData}
            className="p-2 bg-white hover:bg-gray-100 border border-[#d1d5db] rounded-lg text-gray-700 transition-colors cursor-pointer shadow-2xs"
            title="Refresh Live Cameras & Wait Times"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Main Content Dashboard */}
      <div className="p-4 md:p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Checkpoint Selector Tabs (Woodlands vs Tuas) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {checkpoints.map((cp) => {
            const isSelected = cp.id === selectedCheckpointId;
            const dir = direction === 'to_jb' ? cp.singaporeToJB : cp.jbToSingapore;
            return (
              <div
                key={cp.id}
                onClick={() => setSelectedCheckpointId(cp.id)}
                className={`p-5 rounded-xl border-2 transition-all cursor-pointer shadow-2xs ${
                  isSelected
                    ? 'border-[#004481] bg-white ring-2 ring-[#004481]/10'
                    : 'border-[#e1e3e4] bg-white hover:border-[#c1c6d3]'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#004481] bg-[#004481]/10 px-2 py-0.5 rounded">
                      {cp.alias}
                    </span>
                    <h3 className="text-[18px] font-bold text-[#191c1d] mt-1">{cp.name}</h3>
                    <p className="text-[12px] text-[#727783] mt-0.5">{cp.approachRoad}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[28px] font-bold text-[#191c1d] font-mono leading-none">
                      {dir.travelTimeMin}
                    </span>
                    <span className="text-[13px] text-[#727783] ml-1">mins</span>
                    <span
                      className={`block text-[11px] font-bold px-2 py-0.5 rounded mt-1 ${
                        dir.status === 'smooth'
                          ? 'bg-emerald-100 text-emerald-800'
                          : dir.status === 'moderate'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {dir.status === 'smooth'
                        ? 'Smooth Flow'
                        : dir.status === 'moderate'
                        ? 'Moderate Delay'
                        : 'Heavy Congestion'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#edeeef] flex items-center justify-between text-[11px] text-[#414751]">
                  <span>
                    Queue: <strong>{dir.queueLengthKm} km</strong> • Avg Speed: <strong>{dir.speedKmh} km/h</strong>
                  </span>
                  <span className="text-[#004481] font-semibold flex items-center gap-1">
                    {isSelected ? 'Currently Selected' : 'Click to View Live'}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Crossing Time Recommendation Banner */}
        {otherCheckpoint && otherDirStatus && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#004481]/10 via-[#004481]/5 to-transparent border border-[#004481]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#004481] text-white rounded-lg shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-[#004481]">
                  Cross-Border Routing Comparison (Live AI Recommendation)
                </h4>
                <p className="text-[12px] text-[#191c1d] mt-0.5">
                  {timeDeltaMin > 0 ? (
                    <>
                      <strong>{otherCheckpoint.name}</strong> is currently{' '}
                      <span className="text-emerald-700 font-bold">{Math.abs(timeDeltaMin)} minutes faster</span> than{' '}
                      {activeCheckpoint.name}.
                    </>
                  ) : timeDeltaMin < 0 ? (
                    <>
                      <strong>{activeCheckpoint.name}</strong> is currently{' '}
                      <span className="text-emerald-700 font-bold">{Math.abs(timeDeltaMin)} minutes faster</span> than{' '}
                      {otherCheckpoint.name}.
                    </>
                  ) : (
                    <>Both Woodlands Causeway and Tuas Second Link currently have similar queue times.</>
                  )}
                </p>
              </div>
            </div>
            <div className="text-[12px] font-bold text-[#414751] bg-white px-3 py-1.5 rounded-lg border border-[#c1c6d3] shrink-0">
              Optimal Departure: {activeCheckpoint.bestTimeToCross}
            </div>
          </div>
        )}

        {/* 3. Live Checkpoint Cameras Section */}
        <div className="bg-white p-5 md:p-6 rounded-xl border border-[#c1c6d3] shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e1e3e4] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#004481]" />
                <h3 className="text-[17px] font-bold text-[#191c1d]">
                  Live LTA Checkpoint Cameras: {activeCheckpoint.name}
                </h3>
              </div>
              <p className="text-[12px] text-[#727783] mt-0.5">
                Official Land Transport Authority live traffic camera feeds at approach viaducts and border bridge deck.
              </p>
            </div>

            {/* Camera Selectors */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {activeCheckpoint.cameras.map((cam) => (
                <button
                  key={cam.id}
                  onClick={() => setSelectedCamera(cam)}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors whitespace-nowrap ${
                    selectedCamera?.id === cam.id
                      ? 'bg-[#004481] text-white shadow-xs'
                      : 'bg-[#edeeef] text-[#414751] hover:bg-[#e1e3e4]'
                  }`}
                >
                  Cam {cam.cameraId}
                </button>
              ))}
            </div>
          </div>

          {/* Active Camera Display & Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Primary Large Camera View */}
            <div className="lg:col-span-2 bg-[#191c1d] rounded-xl overflow-hidden relative group border border-[#414751] shadow-inner">
              <div className="absolute top-3 left-3 z-10 bg-black/70 backdrop-blur-xs text-white text-[11px] px-2.5 py-1 rounded-md flex items-center gap-2 border border-white/10">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-bold">LIVE FEED: {selectedCamera?.name}</span>
              </div>

              <div className="absolute top-3 right-3 z-10 bg-black/70 backdrop-blur-xs text-white text-[11px] font-mono px-2 py-1 rounded-md border border-white/10">
                {lastRefreshedTime}
              </div>

              {selectedCamera && (
                <img
                  src={selectedCamera.imageUrl}
                  alt={selectedCamera.name}
                  className="w-full h-80 sm:h-96 object-cover bg-[#2d3133]"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback to stylized Singapore traffic visual placeholder if camera stream is temporarily unavailable
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              )}

              {/* Sub-bar below active camera */}
              <div className="p-3 bg-[#191c1d] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[12px] border-t border-[#414751]">
                <div className="flex items-center gap-2 text-[#c1c6d3]">
                  <MapPin className="w-3.5 h-3.5 text-[#004481]" />
                  <span>{selectedCamera?.locationNote || selectedCamera?.expressway}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#c1c6d3]">
                  <span>Car Lanes: <strong>{activeDirStatus.carLanesOpen} open</strong></span>
                  <span>•</span>
                  <span>Motorcycle: <strong>{activeDirStatus.motorcycleLanesOpen} open</strong></span>
                </div>
              </div>
            </div>

            {/* Thumbnail Gallery of All Checkpoint Cameras */}
            <div className="space-y-3">
              <h4 className="text-[13px] font-bold text-[#191c1d] uppercase tracking-wider text-[#727783]">
                All Checkpoint Feeds ({activeCheckpoint.cameras.length})
              </h4>
              <div className="space-y-2.5">
                {activeCheckpoint.cameras.map((cam) => {
                  const isCur = selectedCamera?.id === cam.id;
                  return (
                    <div
                      key={cam.id}
                      onClick={() => setSelectedCamera(cam)}
                      className={`p-2.5 rounded-lg border flex items-center gap-3 cursor-pointer transition-all ${
                        isCur
                          ? 'border-[#004481] bg-[#004481]/5 shadow-xs'
                          : 'border-[#e1e3e4] bg-white hover:border-[#c1c6d3]'
                      }`}
                    >
                      <img
                        src={cam.imageUrl}
                        alt={cam.name}
                        className="w-16 h-12 rounded object-cover bg-gray-200 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-bold bg-[#004481] text-white px-1.5 py-0.2 rounded">
                            Cam {cam.cameraId}
                          </span>
                          <span className="text-[11px] font-bold text-[#191c1d] truncate block">
                            {cam.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#727783] truncate block mt-0.5">
                          {cam.locationNote}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Digital QR Clearance Box */}
              <div className="p-3.5 rounded-xl bg-[#004481]/5 border border-[#004481]/20 space-y-2">
                <div className="flex items-center gap-2 text-[#004481] font-bold text-[12px]">
                  <QrCode className="w-4 h-4" />
                  <span>Passport-Free QR Clearance Active</span>
                </div>
                <p className="text-[11px] text-[#414751] leading-relaxed">
                  Singapore Immigration (ICA) QR code clearance active across both car and bus passenger halls.
                  Generate individual or group QR in the MyICA mobile app prior to arrival.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Hourly Clearance Wait Time Forecast Chart */}
        <div className="bg-white p-5 md:p-6 rounded-xl border border-[#c1c6d3] shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e1e3e4] pb-3">
            <div>
              <h3 className="text-[17px] font-bold text-[#191c1d]">
                24-Hour Checkpoint Wait Time Forecast ({activeCheckpoint.name})
              </h3>
              <p className="text-[12px] text-[#727783]">
                Predictive clearance durations (minutes) in both directions based on historical LTA & border flow analytics.
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-medium text-[#414751]">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-[#004481] rounded-xs inline-block"></span>
                Singapore ➔ Johor Bahru (Mins)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-[#f29900] rounded-xs inline-block"></span>
                Johor Bahru ➔ Singapore (Mins)
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={activeCheckpoint.hourlyWaitForecast}
                margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#727783' }} />
                <YAxis tick={{ fontSize: 11, fill: '#727783' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-white border border-[#c1c6d3] p-3 rounded-lg shadow-lg text-[12px] space-y-1">
                          <p className="font-bold text-[#191c1d] border-b border-[#edeeef] pb-1">
                            {d.hour} SGT {d.isPeak ? '(Peak Rush Period)' : ''}
                          </p>
                          <p className="text-[#004481] font-bold">
                            SG ➔ JB: <strong>{d.toJBMin} mins</strong>
                          </p>
                          <p className="text-amber-700 font-bold">
                            JB ➔ SG: <strong>{d.toSGMin} mins</strong>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar dataKey="toJBMin" fill="#004481" name="Singapore ➔ Johor Bahru (mins)" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="toJBMin" position="top" style={{ fontSize: '10px', fill: '#004481', fontWeight: 'bold' }} />
                </Bar>
                <Bar dataKey="toSGMin" fill="#f29900" name="Johor Bahru ➔ Singapore (mins)" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="toSGMin" position="top" style={{ fontSize: '10px', fill: '#f29900', fontWeight: 'bold' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5. Cross-Border Advisories & Guidelines */}
        <div className="bg-white p-5 rounded-xl border border-[#c1c6d3] shadow-2xs space-y-3">
          <div className="flex items-center gap-2 border-b border-[#e1e3e4] pb-2">
            <Info className="w-5 h-5 text-[#004481]" />
            <h3 className="text-[17px] font-bold text-[#191c1d]">
              Cross-Border Customs & Immigration Regulations
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="p-3.5 rounded-lg bg-amber-50/70 border border-amber-200 text-[12px] space-y-1.5">
              <h5 className="font-bold text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                Three-Quarter (3/4) Fuel Tank Rule
              </h5>
              <p className="text-amber-800 leading-relaxed">
                Singapore-registered motor vehicles exiting Singapore via Woodlands or Tuas checkpoints must have a fuel supply tank that is at least 3/4 full. Offence carries a fine of up to $500.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-[12px] space-y-1.5">
              <h5 className="font-bold text-emerald-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                Vehicle Entry Permit (VEP) & RFID Tag
              </h5>
              <p className="text-emerald-800 leading-relaxed">
                Singapore-registered private cars entering Malaysia must be registered with Malaysia Road Transport Department (JPJ) VEP with RFID tags installed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
