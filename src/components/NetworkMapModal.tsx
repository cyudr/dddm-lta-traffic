import React from 'react';
import { X, Train } from 'lucide-react';
import { MRTLineStatus } from '../types';
import { LTAMRTSystemMap } from './LTAMRTSystemMap';

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
  if (!isOpen) return null;

  return (
    <div
      id="network-map-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        id="network-map-modal"
        className="bg-white rounded-2xl shadow-2xl border border-[#c1c6d3] w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-4 border-b border-[#e1e3e4] bg-[#004481] text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/10 text-white">
              <Train className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[17px] font-bold tracking-tight">
                Official Singapore Rail Transit System Map (MRT/LRT)
              </h3>
              <p className="text-[12px] text-white/80">
                Land Transport Authority (LTA) Standard Transit Schematic
              </p>
            </div>
          </div>

          <button
            id="close-network-map-modal"
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Map Body */}
        <div className="flex-1 p-3 overflow-hidden flex flex-col">
          <LTAMRTSystemMap
            lines={lines}
            onSelectLine={onSelectLine}
            heightClass="h-full"
          />
        </div>
      </div>
    </div>
  );
};
