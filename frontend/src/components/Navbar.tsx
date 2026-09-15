import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 glass border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
     
          <div className="flex items-center space-x-3">
            <img 
              src="/logo.png" 
              alt="Parallax Logo" 
              className="h-10 w-auto object-contain" 
            />
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 font-medium tracking-wider">Central Sector Projects</span>
              <span className="text-lg font-bold text-gray-900 leading-none">Nirman Drishti</span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">Home</Link>
            <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">Dashboard</Link>
            <Link href="/projects" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">Projects</Link>
            <Link href="/risk" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">Risk Signals</Link>
          </div>

          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-full hover:bg-orange-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              Manage Project
            </button>
            <button className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-full hover:bg-blue-100 transition-all duration-200 border border-blue-200">
              Insights & Reports
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}