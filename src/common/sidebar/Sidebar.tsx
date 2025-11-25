import { RxDashboard } from "react-icons/rx";
import { LuBriefcaseBusiness } from "react-icons/lu";
import { TbBrandGoogleAnalytics } from "react-icons/tb";
import { IoSettingsOutline } from "react-icons/io5";
import { FolderOpen, Calculator, FileText, Layers, Database, Users, UserCog, GitCompareArrows, Folder } from "lucide-react";
import { ChevronDown, Building2 } from "lucide-react";
import { X } from "lucide-react";
import { useSession } from "@/sessionManager/SessionContext";
import Logo from "../Logo";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTES_ENUM } from "@/constants/routes.constant";
import { useState, useEffect, useRef } from "react";
import { useProject } from "@/hooks/useProject";

interface SidebarProps {
  toggleSidebar: () => void;
  isSidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
}
interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  section?: string;
  path?: string;
}

// Sidebar items
const sidebarItems: SidebarItem[] = [
  { icon: <RxDashboard size={20} />, label: "Dashboard", path: ROUTES_ENUM.DASHBOARD },
  { icon: <LuBriefcaseBusiness size={20} />, label: "Projects", path: ROUTES_ENUM.PROJECTS },
  { icon: <FolderOpen size={20} />, label: "Trades", path: ROUTES_ENUM.TRADES },
  { icon: <GitCompareArrows size={20} />, label: "Bid Comparison", path: ROUTES_ENUM.BID_COMPARISON },
  { icon: <Folder size={20} />, label: "Files", path: ROUTES_ENUM.FILES },
  { icon: <Calculator size={20} />, label: "Estimates" },
  { icon: <FileText size={20} />, label: "Proposals" },
  { icon: <Layers size={20} />, label: "Templates" },
  { icon: <Database size={20} />, label: "Pricing Database" },
  { icon: <Users size={20} />, label: "Clients" },
  { icon: <UserCog size={20} />, label: "Team", path: ROUTES_ENUM.TEAMS },
  {
    icon: <TbBrandGoogleAnalytics size={20} />,
    label: "Analytics",
    section: "YOUR TOOLS",
  },
  { icon: <IoSettingsOutline size={20} />, label: "Settings" },
];

export const Sidebar: React.FC<SidebarProps> = ({
  toggleSidebar,
  isSidebarOpen,
}) => {
  const { currentProject, projects } = useSession();
  const { selectProject } = useProject();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProjectDropdownOpen(false);
      }
    };

    if (isProjectDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProjectDropdownOpen]);

  const handleNavigation = (path?: string) => {
    if (path) {
      navigate(path);
    }
  };

  const handleProjectSelect = (projectId: string) => {
    selectProject(projectId);
    setIsProjectDropdownOpen(false);
  };

  const isActiveRoute = (path?: string) => {
    if (!path) return false;
    return location.pathname === path;
  };

  return (
    <>
      <div
        className={`
        fixed inset-y-0 left-0 z-50  overflow-y-auto scrollbar-hide w-64 transform transition-transform duration-300 ease-in-out bg-semi_blue
         dark:bg-semi-dark
        lg:translate-x-0 lg:static lg:inset-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        flex flex-col
      `}
      >
        <div className="flex items-center justify-between p-4 ">
          <Logo />
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-md hover:bg-slate-700"
          >
            <X size={20} className="text-dark dark:text-white" />
          </button>
        </div>

        {/* HIDDEN: Navigation Menu */}
        <nav className="p-4 space-y-2 flex-1 hidden">
          {sidebarItems.map((item, index) => (
            <div key={index}>
              {item.section && (
                <div className="text-xs text-secondary dark:text-white uppercase tracking-wider mb-2 mt-6">
                  {item.section}
                </div>
              )}
              <button
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-secondary dark:text-white hover:bg-light rounded-tl-3xl rounded-bl-3xl dark:hover:text-primary hover:text-primary ${
                  isActiveRoute(item.path) ? 'bg-light dark:bg-gray-700 text-primary dark:text-primary' : ''
                }`}
              >
                <span className="h-6 w-6 ">{item?.icon} </span>
                <span className="text-sm font-medium ">{item.label}</span>
              </button>
            </div>
          ))}
        </nav>

        {/* HIDDEN: Project Dropdown - Moved to bottom */}
        <div className="p-4 mt-auto hidden">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
              className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Building2 size={16} className="text-secondary-500 flex-shrink-0" />
                <span className="text-sm font-medium text-secondary-900 dark:text-white truncate">
                  {currentProject?.name || "Select Project"}
                </span>
              </div>
              <ChevronDown 
                size={16} 
                className={`text-secondary-500 transition-transform flex-shrink-0 ${isProjectDropdownOpen ? 'rotate-180' : ''}`} 
              />
            </button>
            
            {isProjectDropdownOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => handleProjectSelect(project.id)}
                    className={`w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      currentProject?.id === project.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                    }`}
                  >
                    <div className="text-sm font-medium text-secondary-900 dark:text-white truncate">
                      {project.name}
                    </div>
                    <div className="text-xs text-secondary-500 dark:text-secondary-400 truncate">
                      {project.client}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};
