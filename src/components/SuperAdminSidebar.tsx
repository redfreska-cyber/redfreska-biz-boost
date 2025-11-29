import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Store,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import redFreskaLogo from "@/assets/redfreska-logo.png";

const superAdminMenuItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/app/superadmin/dashboard" },
  { title: "Restaurantes", icon: Store, url: "/app/superadmin/restaurantes" },
];

const SuperAdminSidebar = () => {
  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground min-h-screen flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center space-x-3">
          <img src={redFreskaLogo} alt="RedFreska Logo" className="w-10 h-10 object-contain" />
          <span className="text-xl font-bold">RedFreska</span>
        </div>
        <div className="mt-2 flex items-center space-x-2 text-sm text-sidebar-foreground/60">
          <Shield className="w-4 h-4" />
          <span>SuperAdmin</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {superAdminMenuItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            className={({ isActive }) =>
              cn(
                "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "hover:bg-sidebar-accent/50 text-sidebar-foreground/80"
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default SuperAdminSidebar;
