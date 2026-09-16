import { fetchRiskDistribution, fetchRiskBySector } from "@/lib/api";

const BAND_ORDER = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;
const BAND_COLOR: Record<string, string> = {
  CRITICAL: "bg-red-500",
  HIGH: "bg-orange-500",
  MEDIUM: "bg-yellow-500",
  LOW: "bg-green-500",
};
const BAND_EMOJI: Record<string, string> = {
  CRITICAL: "🔴",
  HIGH: "🟠",
  MEDIUM: "🟡",
  LOW: "🟢",
};
const BAND_TEXT_COLOR: Record<string, string> = {
  CRITICAL: "text-red-600",
  HIGH: "text-orange-600",
  MEDIUM: "text-yellow-600",
  LOW: "text-green-600",
};

export default async function RiskPage() {
  let distribution: Record<string, number> = {};
  let bySector: Record<string, Record<string, number>> = {};
  let error: string | null = null;

  try {
    [distribution, bySector] = await Promise.all([
      fetchRiskDistribution(),
      fetchRiskBySector(),
    ]);
  } catch (e) {
    error = "Couldn't reach the backend — start it and reload.";
  }

  const sectorRows = Object.entries(bySector)
    .map(([sector, counts]) => ({
      sector,
      counts,
      total: Object.values(counts).reduce((a, b) => a + b, 0),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-slate-800">Risk Signals &amp; Analytics</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {BAND_ORDER.map((band) => (
          <div key={band} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
            <div className="text-5xl mb-4">{BAND_EMOJI[band]}</div>
            <h3 className="text-xl font-bold text-gray-900">{band.charAt(0) + band.slice(1).toLowerCase()}</h3>
            <p className={`text-3xl font-bold mt-2 ${BAND_TEXT_COLOR[band]}`}>{distribution[band] ?? 0}</p>
            <p className="text-sm text-gray-500">projects</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-6">Risk Distribution by Sector</h3>
        <div className="space-y-4">
          {sectorRows.map(({ sector, counts, total }) => (
            <div key={sector} className="flex items-center space-x-4">
              <span className="w-56 truncate text-sm font-medium text-gray-700" title={sector}>{sector}</span>
              <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden flex">
                {BAND_ORDER.map((band) => {
                  const count = counts[band] ?? 0;
                  const pct = total > 0 ? (count / total) * 100 : 0;
                  return pct > 0 ? (
                    <div key={band} className={`h-full ${BAND_COLOR[band]}`} style={{ width: `${pct}%` }} title={`${band}: ${count}`} />
                  ) : null;
                })}
              </div>
              <span className="w-10 text-right text-xs text-gray-400">{total}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-center space-x-6 mt-6 text-xs">
          {BAND_ORDER.map((band) => (
            <div key={band} className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${BAND_COLOR[band]}`}></div>
              {band.charAt(0) + band.slice(1).toLowerCase()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}