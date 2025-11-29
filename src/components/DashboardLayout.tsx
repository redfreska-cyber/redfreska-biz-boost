import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "./Sidebar";
import SuperAdminSidebar from "./SuperAdminSidebar";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, restaurante, userRole, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const isSuperAdmin = userRole?.role === "superadmin";

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Sesión cerrada");
    navigate("/welcome");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      {isSuperAdmin ? <SuperAdminSidebar /> : <Sidebar />}
      
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card">
          <h2 className="text-lg font-semibold text-foreground">
            {isSuperAdmin ? "SuperAdmin" : (restaurante?.nombre || "RedFreska")}
          </h2>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar sesión
          </Button>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
