import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  ShoppingCart, 
  Award, 
  CheckCircle, 
  UsersRound,
  Settings,
  Utensils
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/app/dashboard" },
  { title: "Clientes", icon: Users, url: "/app/clientes" },
  { title: "Conversiones", icon: UserPlus, url: "/app/referidos" },
  { title: "Referidos", icon: ShoppingCart, url: "/app/conversiones" },
  { title: "Premios", icon: Award, url: "/app/premios" },
  { title: "Validaciones", icon: CheckCircle, url: "/app/validaciones" },
  { title: "Usuarios", icon: UsersRound, url: "/app/usuarios" },
  { title: "Configuración", icon: Settings, url: "/app/configuracion" },
];

const Sidebar = () => {
  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground min-h-screen flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
            <Utensils className="w-6 h-6 text-primary" />
          </div>
          <span className="text-xl font-bold">RedFreska</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
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

export default Sidebar;
