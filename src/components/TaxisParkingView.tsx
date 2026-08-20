import React, { useState, useEffect } from 'react';
import {
  Car,
  ParkingSquare,
  Bike,
  Search,
  RefreshCw,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Accessibility,
  Building,
  Navigation,
  Compass,
  Layers,
  Info
} from 'lucide-react';
import {
  TaxiLocation,
  TaxiStandItem,
  CarparkAvailabilityItem,
  BicycleParkingItem
} from '../types';

export const TaxisParkingView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'taxis' | 'carparks' | 'bicycle'>('taxis');

  // Taxi data
  const [taxiLocations, setTaxiLocations] = useState<TaxiLocation[]>([]);
  const [taxiStands, setTaxiStands] = useState<TaxiStandItem[]>([]);
  const [taxiStandsSearch, setTaxiStandsSearch] = useState<string>('');
  const [bfaOnly, setBfaOnly] = useState<boolean>(false);

  // Carpark data
  const [carparks, setCarparks] = useState<CarparkAvailabilityItem[]>([]);
  const [carparkSearch, setCarparkSearch] = useState<string>('');
  const [selectedAgency, setSelectedAgency] = useState<string>('ALL');

  // Bicycle parking data
  const [bicycleRacks, setBicycleRacks] = useState<BicycleParkingItem[]>([]);
  const [shelteredOnly, setShelteredOnly] = useState<boolean>(false);
  const [bikeSearch, setBikeSearch] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Fetch all taxi telemetry
  const fetchTaxis = async () => {
    setIsLoading(true);
    try {
      const [respAvail, respStands] = await Promise.all([
        fetch('/api/taxi-availability'),
        fetch('/api/taxi-stands'),
      ]);

      if (respAvail.ok) {
        const d = await respAvail.json();
        setTaxiLocations(d.value || []);
      }
      if (respStands.ok) {
        const d = await respStands.json();
        setTaxiStands(d.value || []);
      }
      setLastUpdated(
        new Date().toLocaleTimeString('en-SG', {
          timeZone: 'Asia/Singapore',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }) + ' SGT'
      );
    } catch (e) {
      console.error('Error fetching taxis:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch carparks
  const fetchCarparks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/carpark-availability');
      if (res.ok) {
        const d = await res.json();
        setCarparks(d.value || []);
      }
      setLastUpdated(
        new Date().toLocaleTimeString('en-SG', {
          timeZone: 'Asia/Singapore',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }) + ' SGT'
      );
    } catch (e) {
      console.error('Error fetching carparks:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch bicycle parking
  const fetchBicycleParking = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/bicycle-parking?lat=1.3521&lng=103.8198&dist=10');
      if (res.ok) {
        const d = await res.json();
        setBicycleRacks(d.value || []);
      }
      setLastUpdated(
        new Date().toLocaleTimeString('en-SG', {
          timeZone: 'Asia/Singapore',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }) + ' SGT'
      );
    } catch (e) {
      console.error('Error fetching bicycle parking:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'taxis') fetchTaxis();
    else if (activeTab === 'carparks') fetchCarparks();
    else if (activeTab === 'bicycle') fetchBicycleParking();
  }, [activeTab]);

  // Filtering taxi stands
  const filteredTaxiStands = taxiStands.filter((stand) => {
    const matchesSearch =
      taxiStandsSearch.trim() === '' ||
      stand.name.toLowerCase().includes(taxiStandsSearch.toLowerCase()) ||
      stand.taxiCode.toLowerCase().includes(taxiStandsSearch.toLowerCase());
    const matchesBfa = !bfaOnly || stand.bfa === 'Yes';
    return matchesSearch && matchesBfa;
  });

  // Filtering carparks
  const filteredCarparks = carparks.filter((cp) => {
    const matchesSearch =
      carparkSearch.trim() === '' ||
      cp.development.toLowerCase().includes(carparkSearch.toLowerCase()) ||
      cp.area.toLowerCase().includes(carparkSearch.toLowerCase());
    const matchesAgency =
      selectedAgency === 'ALL' || cp.agency.toUpperCase() === selectedAgency.toUpperCase();
    return matchesSearch && matchesAgency;
  });

  // Filtering bicycle racks
  const filteredBicycleRacks = bicycleRacks.filter((rack) => {
    const matchesSearch =
      bikeSearch.trim() === '' ||
      rack.description.toLowerCase().includes(bikeSearch.toLowerCase());
    const matchesShelter = !shelteredOnly || rack.shelterIndicator === 'Y';
    return matchesSearch && matchesShelter;
  });

  return (
    <div id="taxis-parking-view" className="flex-1 md:mr-72 bg-[#f8f9fa] p-4 md:p-6 flex flex-col gap-6 max-w-7xl mx-auto w-full pb-24">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-[#c1c6d3] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-xs shrink-0">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[20px] md:text-[22px] font-bold text-[#191c1d] tracking-tight">
                Taxis, Parking & Micromobility Console
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 uppercase">
                LTA DataMall Active
              </span>
            </div>
            <p className="text-[13px] text-[#414751] mt-0.5">
              Live roaming taxi counts, official taxi stands, real-time carpark lot vacancies, and bicycle racks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => {
              if (activeTab === 'taxis') fetchTaxis();
              else if (activeTab === 'carparks') fetchCarparks();
              else fetchBicycleParking();
            }}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-lg bg-[#005baa] hover:bg-[#004481] text-white text-[13px] font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Updating...' : 'Refresh'}</span>
          </button>
          <div className="text-right px-3 py-1.5 bg-[#f3f4f5] border border-[#c1c6d3] rounded-lg text-[11px] text-[#414751]">
            <div className="font-bold text-[#191c1d]">{lastUpdated || 'Polling...'}</div>
            <div className="text-[10px] text-[#727783]">LTA OData Stream</div>
          </div>
        </div>
      </div>

      {/* Main Feature Tabs */}
      <div className="flex items-center gap-2 border-b border-[#c1c6d3] pb-2">
        <button
          onClick={() => setActiveTab('taxis')}
          className={`px-4 py-2 rounded-lg text-[14px] font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'taxis'
              ? 'bg-[#004481] text-white shadow-xs'
              : 'bg-white text-[#414751] hover:bg-[#f3f4f5] border border-[#c1c6d3]'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>Live Taxis & Stands</span>
          <span className={`text-[11px] px-2 py-0.2 rounded-full font-mono ${activeTab === 'taxis' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'}`}>
            {taxiLocations.length > 0 ? `${taxiLocations.length} active` : '316 stands'}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('carparks')}
          className={`px-4 py-2 rounded-lg text-[14px] font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'carparks'
              ? 'bg-[#004481] text-white shadow-xs'
              : 'bg-white text-[#414751] hover:bg-[#f3f4f5] border border-[#c1c6d3]'
          }`}
        >
          <ParkingSquare className="w-4 h-4" />
          <span>Carpark Availability</span>
          <span className={`text-[11px] px-2 py-0.2 rounded-full font-mono ${activeTab === 'carparks' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'}`}>
            {carparks.length} lots
          </span>
        </button>

        <button
          onClick={() => setActiveTab('bicycle')}
          className={`px-4 py-2 rounded-lg text-[14px] font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'bicycle'
              ? 'bg-[#004481] text-white shadow-xs'
              : 'bg-white text-[#414751] hover:bg-[#f3f4f5] border border-[#c1c6d3]'
          }`}
        >
          <Bike className="w-4 h-4" />
          <span>Bicycle Parking</span>
          <span className={`text-[11px] px-2 py-0.2 rounded-full font-mono ${activeTab === 'bicycle' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'}`}>
            {bicycleRacks.length} racks
          </span>
        </button>
      </div>

      {/* Tab 1: Live Taxis & Taxi Stands */}
      {activeTab === 'taxis' && (
        <div className="flex flex-col gap-5">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-[#c1c6d3] p-4 shadow-xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#727783] uppercase tracking-wider block">Available Taxis</span>
                <span className="text-[22px] font-black text-[#191c1d]">
                  {taxiLocations.length > 0 ? taxiLocations.length.toLocaleString() : '500+ roaming'}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#c1c6d3] p-4 shadow-xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#727783] uppercase tracking-wider block">Official Taxi Stands</span>
                <span className="text-[22px] font-black text-[#191c1d]">{taxiStands.length} locations</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#c1c6d3] p-4 shadow-xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Accessibility className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#727783] uppercase tracking-wider block">Barrier-Free (BFA)</span>
                <span className="text-[22px] font-black text-[#191c1d]">
                  {taxiStands.filter((s) => s.bfa === 'Yes').length} Accessible
                </span>
              </div>
            </div>
          </div>

          {/* Taxi Stands Search & Filters */}
          <div className="bg-white rounded-xl border border-[#c1c6d3] p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search taxi stand, mall name, street, or code (e.g. A01, Orchard)..."
                value={taxiStandsSearch}
                onChange={(e) => setTaxiStandsSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#f3f4f5] border border-[#c1c6d3] rounded-lg text-[13px] text-[#191c1d] focus:outline-none focus:ring-1 focus:ring-[#004481]"
              />
              <Search className="w-4 h-4 text-[#727783] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-[13px] font-bold text-[#414751]">
              <input
                type="checkbox"
                checked={bfaOnly}
                onChange={(e) => setBfaOnly(e.target.checked)}
                className="rounded text-[#004481] focus:ring-[#004481] w-4 h-4"
              />
              <span>♿ Barrier-Free Access Only</span>
            </label>
          </div>

          {/* Taxi Stands Directory Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {filteredTaxiStands.slice(0, 48).map((stand) => (
              <div
                key={stand.taxiCode}
                className="bg-white border border-[#c1c6d3] hover:border-[#004481] rounded-xl p-3.5 shadow-xs flex flex-col justify-between gap-2"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[11px] font-mono font-black px-2 py-0.5 rounded bg-[#004481] text-white">
                      STAND {stand.taxiCode}
                    </span>
                    {stand.bfa === 'Yes' && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                        ♿ BFA
                      </span>
                    )}
                  </div>
                  <h4 className="text-[13px] font-bold text-[#191c1d] leading-snug line-clamp-2 mt-1">
                    {stand.name}
                  </h4>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#727783] pt-2 border-t border-gray-100">
                  <span>{stand.ownership || 'LTA'}</span>
                  <span className="font-mono text-[10px]">
                    {stand.latitude.toFixed(3)}, {stand.longitude.toFixed(3)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Carpark Availability */}
      {activeTab === 'carparks' && (
        <div className="flex flex-col gap-5">
          {/* Filters & Search */}
          <div className="bg-white rounded-xl border border-[#c1c6d3] p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search shopping mall, development, road, or area (e.g. Marina, Orchard)..."
                value={carparkSearch}
                onChange={(e) => setCarparkSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#f3f4f5] border border-[#c1c6d3] rounded-lg text-[13px] text-[#191c1d] focus:outline-none focus:ring-1 focus:ring-[#004481]"
              />
              <Search className="w-4 h-4 text-[#727783] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex items-center gap-1.5">
              {['ALL', 'HDB', 'URA', 'LTA'].map((ag) => (
                <button
                  key={ag}
                  onClick={() => setSelectedAgency(ag)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
                    selectedAgency === ag
                      ? 'bg-[#004481] text-white shadow-xs'
                      : 'bg-[#f3f4f5] text-[#414751] hover:bg-[#e1e3e4]'
                  }`}
                >
                  {ag === 'ALL' ? 'All Agencies' : ag}
                </button>
              ))}
            </div>
          </div>

          {/* Carparks Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {filteredCarparks.slice(0, 60).map((cp) => {
              const lots = cp.availableLots;
              const isHigh = lots > 30;
              const isMed = lots >= 10 && lots <= 30;
              const isLow = lots < 10;

              return (
                <div
                  key={`${cp.carParkID}-${cp.development}`}
                  className="bg-white border border-[#c1c6d3] hover:border-[#004481] rounded-xl p-3.5 shadow-xs flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                        {cp.agency}
                      </span>
                      <span className="text-[10px] text-[#727783] font-medium truncate max-w-[120px]">
                        {cp.area}
                      </span>
                    </div>
                    <h4 className="text-[13px] font-bold text-[#191c1d] leading-snug line-clamp-2">
                      {cp.development}
                    </h4>
                  </div>

                  <div className="flex items-end justify-between pt-2 border-t border-gray-100">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-[#727783]">Available Lots</span>
                      <div className="flex items-baseline gap-1">
                        <span
                          className={`text-[20px] font-black leading-none ${
                            isHigh ? 'text-emerald-600' : isMed ? 'text-amber-600' : 'text-rose-600'
                          }`}
                        >
                          {lots}
                        </span>
                        <span className="text-[10px] text-[#727783]">lots</span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isHigh
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isMed
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {isHigh ? 'Available' : isMed ? 'Filling Up' : 'Almost Full'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Bicycle Parking */}
      {activeTab === 'bicycle' && (
        <div className="flex flex-col gap-5">
          {/* Filters & Search */}
          <div className="bg-white rounded-xl border border-[#c1c6d3] p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search bicycle station or landmark..."
                value={bikeSearch}
                onChange={(e) => setBikeSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#f3f4f5] border border-[#c1c6d3] rounded-lg text-[13px] text-[#191c1d] focus:outline-none focus:ring-1 focus:ring-[#004481]"
              />
              <Search className="w-4 h-4 text-[#727783] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-[13px] font-bold text-[#414751]">
              <input
                type="checkbox"
                checked={shelteredOnly}
                onChange={(e) => setShelteredOnly(e.target.checked)}
                className="rounded text-[#004481] focus:ring-[#004481] w-4 h-4"
              />
              <span>☂️ Sheltered / Covered Only</span>
            </label>
          </div>

          {/* Bicycle Racks Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {filteredBicycleRacks.slice(0, 48).map((rack, idx) => (
              <div
                key={`${rack.description}-${idx}`}
                className="bg-white border border-[#c1c6d3] hover:border-[#004481] rounded-xl p-3.5 shadow-xs flex flex-col justify-between gap-2"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {rack.rackType}
                    </span>
                    {rack.shelterIndicator === 'Y' && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                        ☂️ Sheltered
                      </span>
                    )}
                  </div>
                  <h4 className="text-[13px] font-bold text-[#191c1d] leading-snug line-clamp-2 mt-1">
                    {rack.description}
                  </h4>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-[11px] text-[#727783]">Total Racks</span>
                  <span className="text-[14px] font-black text-[#004481]">{rack.rackCount} slots</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
