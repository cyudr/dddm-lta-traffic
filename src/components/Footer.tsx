import React from 'react';

interface FooterProps {
  onOpenApiStatus: () => void;
  onOpenTerms: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenApiStatus, onOpenTerms }) => {
  return (
    <footer
      id="app-footer"
      className="fixed bottom-0 right-0 w-full md:w-[calc(100%-288px)] bg-white border-t border-[#c1c6d3] flex justify-between items-center px-4 md:px-6 py-2.5 z-40 h-11"
    >
      <div className="flex items-center gap-2">
        <span className="text-[12px] font-bold text-[#004481] tracking-wide">
          Data sourced from LTA DataMall
        </span>
        <span className="hidden sm:inline-block text-[11px] text-[#727783]">
          • Singapore Land Transport Authority
        </span>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <button
          id="footer-api-status-btn"
          onClick={onOpenApiStatus}
          className="text-[#727783] hover:text-[#004481] transition-colors text-[12px] font-semibold tracking-wide cursor-pointer"
        >
          API Status
        </button>
        <button
          id="footer-terms-btn"
          onClick={onOpenTerms}
          className="text-[#727783] hover:text-[#004481] transition-colors text-[12px] font-semibold tracking-wide cursor-pointer"
        >
          Terms of Use
        </button>
      </div>
    </footer>
  );
};
