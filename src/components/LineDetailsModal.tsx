import React from 'react';
import { X, CheckCircle, AlertTriangle, Train, Clock, Users, ArrowRight } from 'lucide-react';
import { MRTLineStatus } from '../types';

interface LineDetailsModalProps {
  line: MRTLineStatus | null;
  onClose: () => void;
}

export const LineDetailsModal: React.FC<LineDetailsModalProps> = ({ line, onClose }) => {
  if (!line) return null;

  const isDelay = line.status === 'delay';

  return (
    <div
      id="line-details-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 md:p-6"
    >
      <div
        id="line-details-modal"
        className="bg-white rounded-xl shadow-2xl border border-[#c1c6d3] w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div
          className="p-5 border-b border-[#c1c6d3] flex justify-between items-center text-white"
          style={{ backgroundColor: line.colorHex }}
        >
          <div className="flex items-center gap-3">
            <span className="bg-white text-[#191c1d] text-[14px] font-bold px-2.5 py-1 rounded shadow-xs">
              {line.code}
            </span>
            <div>
              <h3 className="text-[20px] font-bold tracking-tight">{line.name}</h3>
              <p className="text-[12px] opacity-90">{line.stationsCount} Stations • Operating</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-black/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Banner */}
        <div
          className={`p-4 border-b ${
            isDelay
              ? 'bg-[#ffdad6]/60 border-[#ffb4ac] text-[#93000a]'
              : 'bg-[#d5e3ff]/30 border-[#c1c6d3] text-[#004481]'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-[14px]">
            {isDelay ? (
              <AlertTriangle className="w-5 h-5 text-[#ba1a1a]" />
            ) : (
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            )}
            <span>Current Status: {line.statusTitle}</span>
          </div>
          {line.statusMessage && (
            <p className="text-[13px] text-[#414751] mt-1 pl-7">{line.statusMessage}</p>
          )}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-2 p-4 bg-[#f8f9fa] border-b border-[#edeeef] text-center">
          <div className="p-2 bg-white rounded border border-[#c1c6d3]">
            <div className="text-[11px] text-[#727783] uppercase font-semibold">Peak Headway</div>
            <div className="text-[15px] font-bold text-[#191c1d] mt-0.5">{line.peakFrequency}</div>
          </div>
          <div className="p-2 bg-white rounded border border-[#c1c6d3]">
            <div className="text-[11px] text-[#727783] uppercase font-semibold">Off-Peak</div>
            <div className="text-[15px] font-bold text-[#191c1d] mt-0.5">{line.offPeakFrequency}</div>
          </div>
          <div className="p-2 bg-white rounded border border-[#c1c6d3]">
            <div className="text-[11px] text-[#727783] uppercase font-semibold">Operating Hours</div>
            <div className="text-[13px] font-bold text-[#191c1d] mt-0.5">
              {line.firstTrain} – {line.lastTrain}
            </div>
          </div>
        </div>

        {/* Station List */}
        <div className="flex-1 overflow-y-auto p-4">
          <h4 className="text-[13px] font-bold text-[#414751] uppercase tracking-wider mb-3">
            Stations Along the Route
          </h4>

          <div className="relative pl-6 space-y-3">
            {/* Vertical Line track */}
            <div
              className="absolute left-2.5 top-2 bottom-2 w-1 rounded"
              style={{ backgroundColor: line.colorHex }}
            />

            {line.stations?.map((station, idx) => (
              <div key={station.code} className="relative flex items-center justify-between group">
                {/* Station dot */}
                <div
                  className={`absolute -left-6 w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs z-10 ${
                    station.isInterchange ? 'ring-2 ring-[#191c1d] bg-white' : ''
                  }`}
                  style={{
                    backgroundColor: station.isInterchange ? 'white' : line.colorHex,
                  }}
                />

                <div className="flex items-center gap-3">
                  <span className="font-mono text-[12px] font-bold text-[#727783] w-12">
                    {station.code}
                  </span>
                  <span className="text-[14px] font-medium text-[#191c1d] group-hover:text-[#004481]">
                    {station.name}
                  </span>
                </div>

                {station.isInterchange && (
                  <span className="text-[10px] font-bold text-[#004481] bg-[#d5e3ff] px-2 py-0.5 rounded">
                    INTERCHANGE
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#f8f9fa] border-t border-[#c1c6d3] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#004481] text-white rounded font-semibold hover:bg-[#005baa] transition-colors text-[13px]"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
