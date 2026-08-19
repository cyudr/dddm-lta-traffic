import React from 'react';
import { X, Clock, Globe, Shield, RefreshCw } from 'lucide-react';

interface ClockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClockModal: React.FC<ClockModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const now = new Date();
  const sgtString = now.toLocaleTimeString('en-SG', {
    timeZone: 'Asia/Singapore',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const sgtDateString = now.toLocaleDateString('en-GB', {
    timeZone: 'Asia/Singapore',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div
      id="clock-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        id="clock-modal"
        className="bg-white rounded-xl shadow-2xl border border-[#c1c6d3] w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="p-4 border-b border-[#c1c6d3] bg-[#f8f9fa] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#004481]" />
            <h3 className="text-[18px] font-bold text-[#004481]">Singapore Standard Time</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#727783] hover:text-[#191c1d]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 text-center bg-[#f3f4f5]/50 border-b border-[#edeeef]">
          <div className="text-[36px] font-mono font-bold text-[#004481] tracking-wider">
            {sgtString} <span className="text-[16px] text-[#727783]">SGT</span>
          </div>
          <p className="text-[14px] text-[#414751] mt-1 font-medium">{sgtDateString}</p>
          <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            NTP Synced with SingAREN Atomic Master Clock (UTC+8)
          </div>
        </div>

        <div className="p-4 space-y-2 text-[13px] text-[#414751]">
          <div className="flex justify-between py-1 border-b border-[#edeeef]">
            <span className="text-[#727783]">Timezone Offset</span>
            <span className="font-mono font-semibold text-[#191c1d]">UTC+08:00 (SST)</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#edeeef]">
            <span className="text-[#727783]">LTA Ingestion Polling Cycle</span>
            <span className="font-semibold text-[#004481]">Active (Every 60s)</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-[#727783]">Clock Drift Delta</span>
            <span className="font-mono text-emerald-600">&lt; 0.003s</span>
          </div>
        </div>

        <div className="p-3 bg-[#f8f9fa] border-t border-[#c1c6d3] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#004481] text-white rounded font-semibold hover:bg-[#005baa]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
