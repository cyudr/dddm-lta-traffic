import React, { useState } from 'react';
import { ViewMode, MRTLineStatus, TrafficIncident } from './types';
import { INITIAL_INCIDENTS, MRT_LINES, SERVICE_ADVISORIES } from './data/transportData';
import { TopNavbar } from './components/TopNavbar';
import { Sidebar } from './components/Sidebar';
import { TrafficIncidentsView } from './components/TrafficIncidentsView';
import { MRTStatusView } from './components/MRTStatusView';
import { NetworkMapModal } from './components/NetworkMapModal';
import { LineDetailsModal } from './components/LineDetailsModal';
import { ApiStatusModal } from './components/ApiStatusModal';
import { ClockModal } from './components/ClockModal';
import { TermsModal } from './components/TermsModal';
import { Footer } from './components/Footer';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('traffic');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [incidents, setIncidents] = useState<TrafficIncident[]>(INITIAL_INCIDENTS);
  const [lines, setLines] = useState<MRTLineStatus[]>(MRT_LINES);
  const [advisories, setAdvisories] = useState(SERVICE_ADVISORIES);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modals state
  const [isNetworkMapOpen, setIsNetworkMapOpen] = useState(false);
  const [selectedLineForModal, setSelectedLineForModal] = useState<MRTLineStatus | null>(null);
  const [isApiStatusOpen, setIsApiStatusOpen] = useState(false);
  const [isClockModalOpen, setIsClockModalOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  return (
    <div className="bg-[#f8f9fa] text-[#191c1d] min-h-screen flex flex-col antialiased selection:bg-[#004481] selection:text-white">
      {/* 1. Top Navigation Bar */}
      <TopNavbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenClockModal={() => setIsClockModalOpen(true)}
        onOpenDataMallModal={() => setIsApiStatusOpen(true)}
        onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
      />

      {/* 2. Main Layout Container */}
      <div className="flex flex-1 pt-16">
        {/* Left Control Center Sidebar */}
        <Sidebar
          currentView={currentView}
          onSelectView={(view) => {
            setCurrentView(view);
            setIsMobileMenuOpen(false);
          }}
          incidentCount={incidents.length}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Dynamic View Mode: Traffic Incidents (Screen 1) or MRT Status (Screen 2) */}
        <main className="flex-1 flex flex-col w-full">
          {currentView === 'traffic' ? (
            <TrafficIncidentsView
              incidents={incidents}
              searchQuery={searchQuery}
            />
          ) : (
            <MRTStatusView
              lines={lines}
              advisories={advisories}
              onOpenNetworkMap={() => setIsNetworkMapOpen(true)}
              onSelectLineDetails={(line) => setSelectedLineForModal(line)}
            />
          )}
        </main>
      </div>

      {/* 3. Global Footer */}
      <Footer
        onOpenApiStatus={() => setIsApiStatusOpen(true)}
        onOpenTerms={() => setIsTermsOpen(true)}
      />

      {/* 4. Modals */}
      <NetworkMapModal
        isOpen={isNetworkMapOpen}
        onClose={() => setIsNetworkMapOpen(false)}
        lines={lines}
        onSelectLine={(line) => {
          setIsNetworkMapOpen(false);
          setSelectedLineForModal(line);
        }}
      />

      <LineDetailsModal
        line={selectedLineForModal}
        onClose={() => setSelectedLineForModal(null)}
      />

      <ApiStatusModal
        isOpen={isApiStatusOpen}
        onClose={() => setIsApiStatusOpen(false)}
      />

      <ClockModal
        isOpen={isClockModalOpen}
        onClose={() => setIsClockModalOpen(false)}
      />

      <TermsModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />
    </div>
  );
}
