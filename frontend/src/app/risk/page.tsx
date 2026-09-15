export default function RiskPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-slate-800">Risk Signals & Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
          <div className="text-5xl mb-4">🔴</div>
          <h3 className="text-xl font-bold text-gray-900">Critical</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">45</p>
          <p className="text-sm text-gray-500">Projects require immediate intervention</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
          <div className="text-5xl mb-4">🟠</div>
          <h3 className="text-xl font-bold text-gray-900">High Risk</h3>
          <p className="text-3xl font-bold text-orange-600 mt-2">128</p>
          <p className="text-sm text-gray-500">Projects showing significant deviation</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
          <div className="text-5xl mb-4">🟡</div>
          <h3 className="text-xl font-bold text-gray-900">Medium Risk</h3>
          <p className="text-3xl font-bold text-yellow-600 mt-2">312</p>
          <p className="text-sm text-gray-500">Projects needing monitoring</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Risk Distribution by Sector</h3>
        <div className="space-y-4">
          {['Railways', 'Highways', 'Power', 'Urban Development', 'Telecom'].map((sector, i) => (
            <div key={sector} className="flex items-center space-x-4">
              <span className="w-32 text-sm font-medium text-gray-700">{sector}</span>
              <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden flex">
                <div className="h-full bg-red-500" style={{width: `${20 - i*3}%`}}></div>
                <div className="h-full bg-orange-500" style={{width: `${30 - i*2}%`}}></div>
                <div className="h-full bg-yellow-500" style={{width: `${25 + i}%`}}></div>
                <div className="h-full bg-green-500" style={{width: `${25 + i*2}%`}}></div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center space-x-6 mt-6 text-xs">
          <div className="flex items-center"><div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>Critical</div>
          <div className="flex items-center"><div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>High</div>
          <div className="flex items-center"><div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>Medium</div>
          <div className="flex items-center"><div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>Low</div>
        </div>
      </div>
    </div>
  );
}