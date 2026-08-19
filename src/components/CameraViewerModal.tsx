import React, { useState, useEffect } from 'react';
import { TrafficCamera, TrafficIncident } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import {
  Camera,
  RefreshCw,
  X,
  Compass,
  AlertTriangle,
  Clock,
  Navigation,
  CheckCircle2,
  Maximize2,
  ExternalLink
} from 'lucide-react';

interface CameraViewerModalProps {
  camera: TrafficCamera | null;
  isOpen: boolean;
  onClose: () => void;
  allCameras: TrafficCamera[];
  onSelectCamera: (cam: TrafficCamera) => void;
  incidents: TrafficIncident[];
}

export const CameraViewerModal: React.FC<CameraViewerModalProps> = ({
  camera,
  isOpen,
  onClose,
  allCameras,
  onSelectCamera,
  incidents,
}) => {
  const { t } = useLanguage();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [imageKey, setImageKey] = useState(Date.now());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Auto-refresh snapshot every 20 seconds
  useEffect(() => {
    if (!isOpen || !autoRefresh) return;
    const interval = setInterval(() => {
      setImageKey(Date.now());
    }, 20000);
    return () => clearInterval(interval);
  }, [isOpen, autoRefresh]);

  if (!isOpen || !camera) return null;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setImageKey(Date.now());
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Find nearest incident along the same expressway
  const relatedIncident = incidents.find(
    (i) => i.expressway.toUpperCase() === camera.expressway.toUpperCase()
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="camera-viewer-modal"
        className="bg-white rounded-2xl border border-[#c1c6d3] shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-4 bg-[#004481] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-lg">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-[17px] font-bold tracking-tight">{camera.name}</h3>
              <div className="flex items-center gap-2 text-[12px] text-white/80">
                <span>{t('expresswayCorridor')}: <strong>{camera.expressway}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  {t('cameraFeedActive')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title={t('refreshSnapshot')}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Live Snapshot Image with HUD Overlay */}
          <div className="relative rounded-xl overflow-hidden bg-[#191c1d] border border-[#c1c6d3] shadow-inner aspect-video flex items-center justify-center">
            <img
              key={imageKey}
              src={`${camera.imageUrl}${camera.imageUrl.includes('?') ? '&' : '?'}t=${imageKey}`}
              alt={camera.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback if live image link has CORS or token expire
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80';
              }}
            />

            {/* In-Image Live Metadata Watermark */}
            <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 text-white text-[11px] font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              <span>LTA CCTV • {camera.cameraId || camera.id}</span>
            </div>

            <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 text-white text-[11px] font-mono">
              {new Date().toLocaleTimeString('en-SG', {
                timeZone: 'Asia/Singapore',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
              })}{' '}
              SGT
            </div>
          </div>

          {/* Quick Info & Telemetry Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#f8f9fa] p-3 rounded-xl border border-[#edeeef]">
              <span className="text-[11px] text-[#727783] block uppercase font-bold">
                Camera Location
              </span>
              <span className="text-[14px] font-semibold text-[#191c1d] block mt-0.5">
                {camera.name.split(' - ')[1] || camera.expressway}
              </span>
            </div>

            <div className="bg-[#f8f9fa] p-3 rounded-xl border border-[#edeeef]">
              <span className="text-[11px] text-[#727783] block uppercase font-bold">
                Auto-Refresh Stream
              </span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[13px] font-medium text-[#191c1d]">Every 20s</span>
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded text-[#004481] cursor-pointer"
                />
              </div>
            </div>

            <div className="bg-[#f8f9fa] p-3 rounded-xl border border-[#edeeef]">
              <span className="text-[11px] text-[#727783] block uppercase font-bold">
                Corridor Status
              </span>
              <span className="text-[13px] font-bold text-emerald-700 block mt-0.5">
                {relatedIncident ? 'Active Alert Nearby' : 'Normal Traffic'}
              </span>
            </div>
          </div>

          {/* Nearby Hazards along this Expressway */}
          {relatedIncident && (
            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[13px] font-bold text-amber-900">
                  {relatedIncident.title}
                </h4>
                <p className="text-[12px] text-amber-800 mt-0.5">
                  {relatedIncident.description}
                </p>
              </div>
            </div>
          )}

          {/* Camera Quick Switch Carousel */}
          <div>
            <span className="text-[12px] font-bold text-[#414751] block uppercase tracking-wider mb-2">
              Other Expressways Cameras
            </span>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {allCameras.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onSelectCamera(c)}
                  className={`flex-shrink-0 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                    c.id === camera.id
                      ? 'border-[#004481] bg-[#d5e3ff]/30 ring-2 ring-[#004481]'
                      : 'border-[#c1c6d3] bg-white hover:bg-[#f8f9fa]'
                  }`}
                >
                  <div className="text-[12px] font-bold text-[#191c1d] truncate w-32">
                    {c.expressway}
                  </div>
                  <div className="text-[10px] text-[#727783] truncate w-32">
                    {c.name.split(' - ')[1] || c.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-[#f8f9fa] border-t border-[#c1c6d3] flex justify-between items-center text-[12px] text-[#727783]">
          <span>Data provided by LTA DataMall v2 Traffic Images API</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#004481] text-white rounded-lg font-medium hover:bg-[#005baa] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
