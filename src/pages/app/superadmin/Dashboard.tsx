import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Users, Trophy, ShoppingCart } from "lucide-react";

interface GlobalStats {
  totalRestaurantes: number;
  totalClientes: number;
  totalConversiones: number;
  totalPremios: number;
}

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<GlobalStats>({
    totalRestaurantes: 0,
    totalClientes: 0,
    totalConversiones: 0,
    totalPremios: 0,
  });

  useEffect(() => {
    checkSuperAdmin();
  }, []);

  const checkSuperAdmin = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Debes iniciar sesión");
        navigate("/login");
        return;
      }

      const { data: roleData, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (error || roleData?.role !== "superadmin") {
        toast.error("No tienes permisos de superadmin");
        navigate("/app/dashboard");
        return;
      }

      fetchGlobalStats();
    } catch (error) {
      console.error("Error checking superadmin:", error);
      navigate("/app/dashboard");
    }
  };

  const fetchGlobalStats = async () => {
    try {
      setLoading(true);

      // Fetch total restaurantes
      const { count: restaurantesCount } = await supabase
        .from("restaurantes")
        .select("*", { count: "exact", head: true });

      // Fetch total clientes
      const { count: clientesCount } = await supabase
        .from("clientes")
        .select("*", { count: "exact", head: true });

      // Fetch total conversiones
      const { count: conversionesCount } = await supabase
        .from("conversiones")
        .select("*", { count: "exact", head: true });

      // Fetch total premios
      const { count: premiosCount } = await supabase
        .from("premios")
        .select("*", { count: "exact", head: true });

      setStats({
        totalRestaurantes: restaurantesCount || 0,
        totalClientes: clientesCount || 0,
        totalConversiones: conversionesCount || 0,
        totalPremios: premiosCount || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Error al cargar las estadísticas");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard SuperAdmin</h1>
        <p className="text-muted-foreground mt-2">
          Vista global de todos los restaurantes y métricas del sistema
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Restaurantes
            </CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRestaurantes}</div>
            <p className="text-xs text-muted-foreground">
              Restaurantes registrados en el sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Clientes
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClientes}</div>
            <p className="text-xs text-muted-foreground">
              Clientes en todos los restaurantes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Conversiones
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalConversiones}</div>
            <p className="text-xs text-muted-foreground">
              Conversiones totales del sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Premios
            </CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPremios}</div>
            <p className="text-xs text-muted-foreground">
              Premios configurados en todos los restaurantes
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Restaurantes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Desde aquí puedes administrar todos los restaurantes del sistema.
            </p>
            <button
              onClick={() => navigate("/app/superadmin/restaurantes")}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Ver Restaurantes
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
