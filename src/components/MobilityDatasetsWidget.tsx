import React, { useState, useEffect } from 'react';
import { Database, Download, ExternalLink, RefreshCw, FileText, CheckCircle2, Info } from 'lucide-react';
import { MobilityDatasetItem } from '../types';

export const MobilityDatasetsWidget: React.FC = () => {
  const [datasets, setDatasets] = useState<MobilityDatasetItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchDatasets = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/mobility-datasets');
      if (res.ok) {
        const data = await res.json();
        setDatasets(data.value || []);
      }
    } catch (e) {
      console.error('Error fetching mobility datasets:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  return (
    <div className="bg-white rounded-xl border border-[#c1c6d3] p-5 shadow-xs flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[17px] font-bold text-[#191c1d]">
                Official LTA Open Data Mobility Archives
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                PV / O-D Datasets
              </span>
            </div>
            <p className="text-[12px] text-[#727783] mt-0.5">
              Direct monthly download links and open data feeds for bus and rail passenger volumes
            </p>
          </div>
        </div>

        <button
          onClick={fetchDatasets}
          disabled={isLoading}
          className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-[12px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Links</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-2">
        {datasets.map((ds) => (
          <div
            key={ds.id}
            className="border border-[#e1e3e4] hover:border-[#004481] rounded-xl p-4 flex flex-col justify-between gap-3 bg-[#fcfdfe] transition-all"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {ds.category}
                </span>
                <span className="text-[11px] text-[#727783] font-medium">{ds.period}</span>
              </div>
              <h4 className="text-[14px] font-bold text-[#191c1d] leading-snug">{ds.title}</h4>
              <p className="text-[12px] text-[#414751] mt-1.5 line-clamp-2">{ds.description}</p>
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              {ds.downloadLink ? (
                <a
                  href={ds.downloadLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#005baa] hover:text-[#004481] hover:underline"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Archive (.zip)</span>
                </a>
              ) : (
                <span className="text-[11px] text-[#727783] italic flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" />
                  Direct stream available via API
                </span>
              )}
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                LTA DataMall v2
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
