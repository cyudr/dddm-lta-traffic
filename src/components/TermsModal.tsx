import React from 'react';
import { X, Shield, FileText, Check } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="terms-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        id="terms-modal"
        className="bg-white rounded-xl shadow-2xl border border-[#c1c6d3] w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="p-4 border-b border-[#c1c6d3] bg-[#f8f9fa] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#004481]" />
            <h3 className="text-[18px] font-bold text-[#004481]">Terms of Use & Attribution</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#727783] hover:text-[#191c1d]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3 text-[13px] text-[#414751] leading-relaxed">
          <div className="p-3 bg-[#d5e3ff]/30 rounded-lg border border-[#c1c6d3]">
            <h4 className="font-bold text-[#004481] text-[14px] mb-1">
              Singapore Land Transport Authority (LTA)
            </h4>
            <p>
              Data feeds displayed across TransportMonitor SG are accessed under the Singapore Open
              Data Licence version 1.0 provided by LTA DataMall.
            </p>
          </div>

          <h5 className="font-bold text-[#191c1d] pt-2">1. Real-time Incident Disclaimers</h5>
          <p>
            Traffic incident reports and train travel delay estimates are provided for situational
            awareness and commuter trip planning. Road conditions and transit headways may fluctuate
            dynamically during severe weather or major vehicle recovery operations.
          </p>

          <h5 className="font-bold text-[#191c1d] pt-2">2. Data Ingestion &amp; Integrity</h5>
          <p>
            The monitoring console refreshes incident feeds continuously. All timestamps are
            referenced in Singapore Standard Time (SGT / UTC+8).
          </p>

          <h5 className="font-bold text-[#191c1d] pt-2">3. Transit Operators Attribution</h5>
          <p>
            MRT &amp; LRT line names, badges, station codes, and schematic alignments correspond to
            the official public transit network managed by SMRT Trains Ltd and SBS Transit Ltd.
          </p>
        </div>

        <div className="p-3 bg-[#f8f9fa] border-t border-[#c1c6d3] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#004481] text-white rounded font-semibold hover:bg-[#005baa] text-[13px]"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
