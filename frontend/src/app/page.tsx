import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop" 
            alt="Infrastructure" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-slate-900/40"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center animate-fade-in-up">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            Nirman Drishti
          </h1>
          <h2 className="text-2xl md:text-3xl text-blue-200 font-medium mb-6">
            Next-Gen Project Infrastructure Insights
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
            Predictive Monitoring for High-Value Central Sector Infrastructure Projects (Rs. 150 cr. & above)
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/dashboard" className="px-8 py-3 bg-orange-500 text-white font-bold rounded-full hover:bg-orange-600 transition-all duration-300 shadow-lg hover:shadow-orange-500/50 transform hover:-translate-y-1">
              View Dashboard
            </Link>
            <Link href="/projects" className="px-8 py-3 bg-white/10 backdrop-blur-md border border-white/30 text-white font-bold rounded-full hover:bg-white/20 transition-all duration-300">
              Explore Projects
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
              <div className="h-32 bg-blue-50 rounded-lg mb-4 flex items-center justify-center">
                <div className="text-4xl">📊</div>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Predictive AI Forecasts</h3>
              <p className="text-sm text-gray-600">Project Delay Prediction (Overall: 12% Risk)</p>
              <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-3/4"></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <div className="h-32 bg-red-50 rounded-lg mb-4 flex flex-col justify-center px-4 space-y-2">
                <div className="bg-red-500 text-white text-xs px-2 py-1 rounded">Project A - Rail</div>
                <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded">Project B - Power</div>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">High-Risk Lineup</h3>
              <p className="text-sm text-gray-600">Rs. 500 cr.+ projects requiring attention.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
              <div className="h-32 bg-green-50 rounded-lg mb-4 flex items-center justify-center">
                <div className="w-full px-4 space-y-2">
                  <div className="h-2 bg-green-500 rounded w-3/4"></div>
                  <div className="h-2 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Key Milestones Tracker</h3>
              <p className="text-sm text-gray-600">Current vs Forecasted completion tracking.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <div className="h-32 bg-purple-50 rounded-lg mb-4 flex items-center justify-center space-x-4">
                <div className="w-12 h-12 rounded-full border-4 border-green-500 flex items-center justify-center text-green-600 font-bold">✓</div>
                <div className="w-12 h-12 rounded-full border-4 border-yellow-500 flex items-center justify-center text-yellow-600 font-bold">!</div>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Compliance & Audit</h3>
              <p className="text-sm text-gray-600">Environmental & Financial reporting status.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in-up" style={{animationDelay: '0.5s'}}>
              <div className="h-32 bg-orange-50 rounded-lg mb-4 flex items-center justify-center">
                <div className="grid grid-cols-3 gap-1">
                  <div className="w-4 h-4 bg-green-500"></div>
                  <div className="w-4 h-4 bg-yellow-500"></div>
                  <div className="w-4 h-4 bg-red-500"></div>
                  <div className="w-4 h-4 bg-blue-500"></div>
                  <div className="w-4 h-4 bg-green-500"></div>
                  <div className="w-4 h-4 bg-orange-500"></div>
                </div>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Resource Optimization</h3>
              <p className="text-sm text-gray-600">Sector utilization and human resource mapping.</p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}