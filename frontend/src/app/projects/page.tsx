import { fetchProjects } from "@/lib/api";

interface Project {
  id: string | number;
  name: string;
  ministry: string;
  state: string;
  total_cost: number;
  status: string;
}

export default async function ProjectsPage() {
  let projects: Project[] = [];
  try {
    projects = await fetchProjects();
  } catch (error) {
    console.error("Failed to fetch projects", error);
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "COMPLETED": return "bg-green-100 text-green-800 border-green-200";
      case "IN_PROGRESS": return "bg-blue-100 text-blue-800 border-blue-200";
      case "DELAYED": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">All Projects</h1>
        <input 
          type="text" 
          placeholder="Search projects..." 
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        />
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ministry</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost (Cr)</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projects.slice(0, 20).map((project) => (
              <tr key={project.id} className="hover:bg-blue-50 transition-colors duration-150 cursor-pointer">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{project.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.ministry}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.state}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">₹{project.total_cost.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(project.status)}`}>
                    {project.status.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}