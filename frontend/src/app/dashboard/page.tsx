import { fetchDashboardSummary } from "@/lib/api";

export default async function DashboardPage() {
  let summary;
  try {
    summary = await fetchDashboardSummary();
  } catch (error) {
    summary = {
      total_projects: 1775,
      total_cost: 450000,
      avg_risk_score: 42.5,
      projects_by_status: { PLANNING: 120, IN_PROGRESS: 850, DELAYED: 305, COMPLETED: 500 },
      critical_projects: []
    };
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">Dashboard Overview</h1>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition">Ministry-Wise</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">Sector-Wise</button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
          <p className="text-sm text-gray-500 mb-1 font-medium">Total Projects</p>
          <p className="text-4xl font-bold text-blue-600">{summary.total_projects}</p>
          <div className="mt-4 h-1 bg-blue-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 w-3/4 animate-pulse"></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
          <p className="text-sm text-gray-500 mb-1 font-medium">Total Cost (Cr)</p>
          <p className="text-4xl font-bold text-green-600">₹{summary.total_cost.toLocaleString()}</p>
          <div className="mt-4 h-1 bg-green-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 w-1/2"></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
          <p className="text-sm text-gray-500 mb-1 font-medium">Avg Risk Score</p>
          <p className="text-4xl font-bold text-red-600">{summary.avg_risk_score.toFixed(1)}</p>
          <div className="mt-4 h-1 bg-red-100 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 w-2/5"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-6 text-slate-700">Projects by Status</h3>
          <div className="space-y-4">
            {Object.entries(summary.projects_by_status).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">{status.replace('_', ' ')}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        status === 'COMPLETED' ? 'bg-green-500' : 
                        status === 'IN_PROGRESS' ? 'bg-blue-500' : 
                        status === 'DELAYED' ? 'bg-red-500' : 'bg-gray-400'
                      }`}
                      style={{width: `${(count / summary.total_projects) * 100}%`}}
                    ></div>
                  </div>
                  <span className="text-lg font-bold text-gray-800 w-12 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-6 text-slate-700">High-Risk Lineup (Rs. 500 cr.+)</h3>
          <div className="space-y-3">
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg hover:bg-red-100 transition cursor-pointer">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-red-900">Project Alpha - Rail Corridor</h4>
                  <p className="text-sm text-red-700">Severe Delays Detected</p>
                </div>
                <span className="px-2 py-1 bg-red-200 text-red-800 text-xs font-bold rounded">CRITICAL</span>
              </div>
            </div>
            <div className="p-4 bg-orange-50 border-l-4 border-orange-500 rounded-r-lg hover:bg-orange-100 transition cursor-pointer">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-orange-900">Project Beta - Power Grid</h4>
                  <p className="text-sm text-orange-700">Material Shortage</p>
                </div>
                <span className="px-2 py-1 bg-orange-200 text-orange-800 text-xs font-bold rounded">HIGH</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}